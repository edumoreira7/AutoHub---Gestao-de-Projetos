import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalDataService } from '../../utils/local-data.service.js';
import type { OrdemServicoRecord, ServicoRecord } from '../../utils/local-data.service.js';
import { OrdemServico } from './ordem-servico.schema.js';
import { OrdemServicoService } from './ordem-servico.service.js';

describe('OrdemServicoService', () => {
    let originalDataMode: string | undefined;
    let localData: {
        createId: ReturnType<typeof vi.fn>;
        read: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    let model: {
        create: ReturnType<typeof vi.fn>;
        find: ReturnType<typeof vi.fn>;
        findByIdAndUpdate: ReturnType<typeof vi.fn>;
    };
    let query: {
        select: ReturnType<typeof vi.fn>;
        populate: ReturnType<typeof vi.fn>;
        lean: ReturnType<typeof vi.fn>;
    };
    let service: OrdemServicoService;

    beforeEach(() => {
        originalDataMode = process.env.DATA_MODE;
        delete process.env.DATA_MODE;
        localData = {
            createId: vi.fn().mockReturnValue('c'.repeat(24)),
            read: vi.fn(),
            update: vi.fn(),
        };
        query = {
            select: vi.fn(),
            populate: vi.fn(),
            lean: vi.fn(),
        };
        query.select.mockReturnValue(query);
        query.populate.mockReturnValue(query);
        model = {
            create: vi.fn(),
            find: vi.fn().mockReturnValue(query),
            findByIdAndUpdate: vi.fn(),
        };
        service = new OrdemServicoService(
            localData as unknown as LocalDataService,
            model as unknown as Model<OrdemServico>,
            { exists: vi.fn() } as never,
        );
    });

    afterEach(() => {
        if (originalDataMode === undefined) delete process.env.DATA_MODE;
        else process.env.DATA_MODE = originalDataMode;
    });

    it('persists an allowed status in MongoDB', async () => {
        const execute = vi.fn().mockResolvedValue({ _id: { toString: () => 'a'.repeat(24) } });
        model.findByIdAndUpdate.mockReturnValue({ exec: execute });

        const result = await service.updateStatus('a'.repeat(24), 'EM_ANDAMENTO');

        expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
            'a'.repeat(24),
            { status: 'EM_ANDAMENTO' },
            { new: true, runValidators: true },
        );
        expect(result).toEqual({
            success: true,
            id: 'a'.repeat(24),
            message: 'Status da ordem de serviço atualizado com sucesso',
        });
    });

    it('rejects unknown status values without writing', async () => {
        await expect(service.updateStatus('a'.repeat(24), 'FINALIZADA'))
            .rejects.toBeInstanceOf(BadRequestException);
        expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects invalid identifiers without writing', async () => {
        await expect(service.updateStatus('id-invalido', 'ABERTA'))
            .rejects.toBeInstanceOf(BadRequestException);
        expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('reports an order that does not exist', async () => {
        model.findByIdAndUpdate.mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
        });

        await expect(service.updateStatus('a'.repeat(24), 'CANCELADA'))
            .rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates and persists the status in local mode', async () => {
        process.env.DATA_MODE = 'local';
        const records: OrdemServicoRecord[] = [
            { _id: 'a'.repeat(24), descricao: 'Revisão', data: '2026-10-31', veiculoId: 'b'.repeat(24), status: 'ABERTA' },
        ];
        localData.update.mockImplementation(async (_collection, change) => change(records));

        const result = await service.updateStatus('a'.repeat(24), 'CONCLUÍDA');

        expect(localData.update).toHaveBeenCalledWith('ordens-servico', expect.any(Function));
        expect(records[0].status).toBe('CONCLUÍDA');
        expect(result).toMatchObject({ success: true, id: 'a'.repeat(24) });
        expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects an order date before today', async () => {
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const data = [
            ontem.getFullYear(),
            String(ontem.getMonth() + 1).padStart(2, '0'),
            String(ontem.getDate()).padStart(2, '0'),
        ].join('-');

        await expect(service.create({
            descricao: 'Revisão',
            data,
            veiculoId: 'b'.repeat(24),
        })).rejects.toBeInstanceOf(BadRequestException);
        expect(localData.read).not.toHaveBeenCalled();
        expect(model.create).not.toHaveBeenCalled();
    });

    it.each([0, 1])('accepts an order dated today or in the future (%i days)', async (diasAdiante) => {
        process.env.DATA_MODE = 'local';
        const dataOrdem = new Date();
        dataOrdem.setDate(dataOrdem.getDate() + diasAdiante);
        const data = [
            dataOrdem.getFullYear(),
            String(dataOrdem.getMonth() + 1).padStart(2, '0'),
            String(dataOrdem.getDate()).padStart(2, '0'),
        ].join('-');
        const records: OrdemServicoRecord[] = [];
        localData.read.mockResolvedValue([{ _id: 'b'.repeat(24) }]);
        localData.update.mockImplementation(async (_collection, change) => change(records));

        await service.create({
            descricao: 'Revisão',
            data,
            veiculoId: 'b'.repeat(24),
        });

        expect(records[0]).toMatchObject({
            data,
            veiculoId: 'b'.repeat(24),
            status: 'ABERTA',
        });
    });

    it('rejects impossible dates and malformed vehicle IDs in a query', async () => {
        process.env.DATA_MODE = 'local';

        await expect(service.findAll({ data: '2026-02-30' }))
            .rejects.toBeInstanceOf(BadRequestException);
        await expect(service.findAll({ veiculoId: 'not-an-object-id' }))
            .rejects.toBeInstanceOf(BadRequestException);

        expect(localData.read).not.toHaveBeenCalled();
        expect(model.find).not.toHaveBeenCalled();
    });

    it('returns MongoDB orders with persisted status and requested filters', async () => {
        const orderId = 'a'.repeat(24);
        const vehicleId = 'b'.repeat(24);
        query.lean.mockResolvedValue([{
            _id: orderId,
            descricao: 'Revisão',
            data: '2026-10-31',
            status: 'EM_ANDAMENTO',
            veiculoId: { _id: vehicleId, placa: 'ABC1D23', marca: 'Teste', modelo: 'Local' },
        }]);

        const result = await service.findAll({
            descricao: 'Revisão',
            data: '2026-10-31',
            veiculoId: vehicleId,
        });

        expect(model.find).toHaveBeenCalledWith({
            descricao: { $regex: 'Revisão', $options: 'i' },
            data: '2026-10-31',
            veiculoId: expect.anything(),
        });
        expect(String(model.find.mock.calls[0][0].veiculoId)).toBe(vehicleId);
        expect(result).toMatchObject({
            success: true,
            data: [{
                _id: orderId,
                status: 'EM_ANDAMENTO',
                veiculo: 'ABC1D23 · Teste Local',
                veiculoId: vehicleId,
            }],
        });
    });

    it('returns null status for legacy local orders without changing them', async () => {
        process.env.DATA_MODE = 'local';
        const legacyOrder: OrdemServicoRecord = {
            _id: 'a'.repeat(24),
            descricao: 'Ordem antiga',
            data: '2026-10-31',
            veiculoId: 'b'.repeat(24),
        };
        localData.read.mockImplementation(async (collection: string) =>
            collection === 'ordens-servico'
                ? [legacyOrder]
                : [{ _id: 'b'.repeat(24), placa: 'ABC1D23', marca: 'Teste', modelo: 'Local' }],
        );

        const result = await service.findAll();

        expect(result).toMatchObject({
            success: true,
            data: [{ _id: legacyOrder._id, status: null }],
        });
        expect(legacyOrder).not.toHaveProperty('status');
        expect(localData.update).not.toHaveBeenCalled();
    });

    it('adds an active service locally and updates the total in cents', async () => {
        process.env.DATA_MODE = 'local';
        const ordemId = 'a'.repeat(24);
        const servicoId = 'b'.repeat(24);
        const ordens: OrdemServicoRecord[] = [{
            _id: ordemId,
            descricao: 'Revisão',
            data: '2026-10-31',
            veiculoId: 'c'.repeat(24),
            servicos: [{ servicoId: 'd'.repeat(24), nome: 'Inspeção', preco: 12.35 }],
            valorTotal: 12.35,
        }];
        const servico: ServicoRecord = {
            _id: servicoId,
            nome: 'Troca de óleo',
            precoPadrao: 10.1,
            ativo: true,
        };
        localData.read.mockResolvedValue([servico]);
        localData.update.mockImplementation(async (_collection, change) => change(ordens));

        const result = await service.addServico(ordemId, servicoId);

        expect(ordens[0].servicos).toEqual([
            { servicoId: 'd'.repeat(24), nome: 'Inspeção', preco: 12.35 },
            { servicoId, nome: 'Troca de óleo', preco: 10.1 },
        ]);
        expect(ordens[0].valorTotal).toBe(22.45);
        expect(result).toMatchObject({
            success: true,
            data: { servicos: ordens[0].servicos, valorTotal: 22.45 },
        });
    });

    it('rejects inactive and duplicated services locally', async () => {
        process.env.DATA_MODE = 'local';
        const ordemId = 'a'.repeat(24);
        const servicoId = 'b'.repeat(24);
        const ordens: OrdemServicoRecord[] = [{
            _id: ordemId,
            descricao: 'Revisão',
            data: '2026-10-31',
            veiculoId: 'c'.repeat(24),
            servicos: [{ servicoId, nome: 'Troca de óleo', preco: 10 }],
            valorTotal: 10,
        }];
        localData.read.mockResolvedValue([{
            _id: servicoId,
            nome: 'Troca de óleo',
            precoPadrao: 10,
            ativo: true,
        }]);
        localData.update.mockImplementation(async (_collection, change) => change(ordens));

        await expect(service.addServico(ordemId, servicoId))
            .rejects.toBeInstanceOf(BadRequestException);

        localData.read.mockResolvedValue([{
            _id: servicoId,
            nome: 'Troca de óleo',
            precoPadrao: 10,
            ativo: false,
        }]);
        await expect(service.addServico(ordemId, servicoId))
            .rejects.toBeInstanceOf(BadRequestException);
    });
});
