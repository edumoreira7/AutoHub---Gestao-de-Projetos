import { BadRequestException, ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Cliente } from './cliente.schema.js';
import { ClienteService } from './cliente.service.js';

describe('ClienteService', () => {
    let model: {
        create: ReturnType<typeof vi.fn>;
        find: ReturnType<typeof vi.fn>;
        findOne: ReturnType<typeof vi.fn>;
    };
    let service: ClienteService;

    beforeEach(() => {
        model = {
            create: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
        };
        service = new ClienteService(model as unknown as Model<Cliente>);
    });

    it('normaliza e cadastra um cliente válido', async () => {
        model.findOne.mockResolvedValue(null);
        model.create.mockResolvedValue({ _id: { toString: () => 'cliente-1' } });

        const result = await service.create({
            nomeCompleto: '  Ana Silva  ',
            cpf: '529.982.247-25',
            telefone: '(11) 99999-0001',
            email: '  ANA@EXAMPLE.COM ',
            endereco: '  Rua A, 10  ',
        });

        const normalized = {
            nomeCompleto: 'Ana Silva',
            cpf: '52998224725',
            telefone: '11999990001',
            email: 'ana@example.com',
            endereco: 'Rua A, 10',
        };
        expect(model.findOne).toHaveBeenCalledWith({
            $or: [{ cpf: normalized.cpf }, { email: normalized.email }],
        });
        expect(model.create).toHaveBeenCalledWith(normalized);
        expect(result).toEqual({ success: true, id: 'cliente-1' });
    });

    it('rejeita campos obrigatórios ausentes e dados inválidos', async () => {
        await expect(service.create({
            nomeCompleto: '',
            cpf: '52998224725',
            telefone: '11999990001',
            email: 'ana@example.com',
        })).rejects.toBeInstanceOf(BadRequestException);

        await expect(service.create({
            nomeCompleto: 'Ana Silva',
            cpf: '11111111111',
            telefone: '11999990001',
            email: 'ana@example.com',
        })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita CPF já cadastrado', async () => {
        model.findOne.mockResolvedValue({
            cpf: '52998224725',
            email: 'outra@example.com',
        });

        await expect(service.create({
            nomeCompleto: 'Ana Silva',
            cpf: '529.982.247-25',
            telefone: '(11) 99999-0001',
            email: 'ana@example.com',
        })).rejects.toBeInstanceOf(ConflictException);
    });

    it('consulta combinando nome, CPF e telefone normalizados', async () => {
        const lean = vi.fn().mockResolvedValue([{ _id: 'cliente-1' }]);
        const select = vi.fn().mockReturnValue({ lean });
        model.find.mockReturnValue({ select });

        const result = await service.findAll({
            nome: 'Ana.',
            cpf: '529.982.247-25',
            telefone: '(11) 99999-0001',
        });

        expect(model.find).toHaveBeenCalledWith({
            cpf: '52998224725',
            telefone: '11999990001',
            nomeCompleto: { $regex: 'Ana\\.', $options: 'i' },
        });
        expect(select).toHaveBeenCalledWith('-__v');
        expect(result).toEqual({ success: true, data: [{ _id: 'cliente-1' }] });
    });
});
