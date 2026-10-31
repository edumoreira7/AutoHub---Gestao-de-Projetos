import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Model } from 'mongoose';
import { ServicoService } from './servico.service.js';
import type { Servico } from './servico.schema.js';
import { INVALID_PRICE } from '../../utils/money.utils.js';

describe('HU08 - cadastro de serviços', () => {
    it.each([undefined, null, 0, -50, 'abc', '12.50', true, {}, [], NaN, Infinity, 0.001, 10.123, Number.MAX_VALUE])('rejeita preço %j sem persistir', async precoPadrao => {
        const create = vi.fn();
        const service = new ServicoService({ create } as unknown as Model<Servico>);
        await expect(service.criar({ nome: 'Revisão', precoPadrao: precoPadrao as number })).rejects.toThrow(INVALID_PRICE);
        expect(create).not.toHaveBeenCalled();
    });
    it.each(['', '   ', undefined, 10, 'x'.repeat(101)])('rejeita nome inválido %j', async nome => {
        const create = vi.fn();
        const service = new ServicoService({ create } as unknown as Model<Servico>);
        await expect(service.criar({ nome: nome as string, precoPadrao: 50 })).rejects.toBeInstanceOf(BadRequestException);
        expect(create).not.toHaveBeenCalled();
    });
    it('normaliza nome, aceita centavos e cria serviço ativo por padrão', async () => {
        const create = vi.fn().mockResolvedValue({ _id: 'servico-1' });
        const service = new ServicoService({ create } as unknown as Model<Servico>);
        const resposta = await service.criar({ nome: '  Revisão  ', precoPadrao: 0.29 });
        expect(create).toHaveBeenCalledWith({ nome: 'Revisão', precoPadrao: 0.29, ativo: true });
        expect(resposta).toMatchObject({ success: true, id: 'servico-1' });
    });
    it('trata falha de gravação sem informar sucesso', async () => {
        const service = new ServicoService({ create: vi.fn().mockRejectedValue(new Error('database')) } as unknown as Model<Servico>);
        await expect(service.criar({ nome: 'Revisão', precoPadrao: 50 })).rejects.toBeInstanceOf(InternalServerErrorException);
    });
});
