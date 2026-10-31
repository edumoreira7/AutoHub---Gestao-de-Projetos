import { BadRequestException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalDataService } from '../../utils/local-data.service.js';
import type { ServicoRecord } from '../../utils/local-data.service.js';
import { ServicoService } from './servico.service.js';

describe('ServicoService', () => {
    let originalDataMode: string | undefined;
    let localData: {
        createId: ReturnType<typeof vi.fn>;
        read: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
    };
    let service: ServicoService;

    beforeEach(() => {
        originalDataMode = process.env.DATA_MODE;
        process.env.DATA_MODE = 'local';
        localData = {
            createId: vi.fn().mockReturnValue('a'.repeat(24)),
            read: vi.fn().mockResolvedValue([]),
            update: vi.fn(),
        };
        service = new ServicoService(
            localData as unknown as LocalDataService,
            undefined,
        );
    });

    afterEach(() => {
        if (originalDataMode === undefined) delete process.env.DATA_MODE;
        else process.env.DATA_MODE = originalDataMode;
    });

    it('creates an active service by default in local mode', async () => {
        const records: ServicoRecord[] = [];
        localData.update.mockImplementation(async (_collection, change) => change(records));

        const result = await service.create({
            nome: ' Troca de óleo ',
            precoPadrao: 150,
        });

        expect(records).toEqual([{
            _id: 'a'.repeat(24),
            nome: 'Troca de óleo',
            precoPadrao: 150,
            ativo: true,
        }]);
        expect(result).toMatchObject({ success: true, id: 'a'.repeat(24) });
    });

    it.each([0, -1, 10.001, Number.NaN, Number.POSITIVE_INFINITY])(
        'rejects invalid service prices (%s)',
        async (precoPadrao) => {
            await expect(service.create({
                nome: 'Serviço de teste',
                precoPadrao,
            })).rejects.toBeInstanceOf(BadRequestException);
            expect(localData.update).not.toHaveBeenCalled();
        },
    );

    it('rejects a blank name and a non-boolean active flag', async () => {
        await expect(service.create({
            nome: '  ',
            precoPadrao: 10,
        })).rejects.toBeInstanceOf(BadRequestException);
        await expect(service.create({
            nome: 'Serviço',
            precoPadrao: 10,
            ativo: 'true' as unknown as boolean,
        })).rejects.toBeInstanceOf(BadRequestException);
        expect(localData.update).not.toHaveBeenCalled();
    });

    it('filters local services by active flag', async () => {
        localData.read.mockResolvedValue([
            { _id: 'a'.repeat(24), nome: 'Ativo', precoPadrao: 10, ativo: true },
            { _id: 'b'.repeat(24), nome: 'Inativo', precoPadrao: 20, ativo: false },
        ]);

        const result = await service.findAll('true');

        expect(result).toMatchObject({
            success: true,
            data: [{ nome: 'Ativo', ativo: true }],
        });
    });
});
