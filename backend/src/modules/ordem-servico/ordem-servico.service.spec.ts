import { describe, expect, it, vi } from 'vitest';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { OrdemServicoService } from './ordem-servico.service.js';
import type { OrdemServico } from './ordem-servico.schema.js';
import type { Servico } from '../servico/servico.schema.js';
import type { Veiculo } from '../veiculo/veiculo.schema.js';

describe('HU09 - associação de serviço', () => {
    const ordemId = new Types.ObjectId().toString();
    const servicoId = new Types.ObjectId().toString();
    it('trata erro de escrita sem separar item e total', async () => {
        const lean = vi.fn().mockRejectedValue(new Error('write failed'));
        const update = vi.fn().mockReturnValue({ select: () => ({ lean }) });
        const model = { exists: vi.fn().mockResolvedValue({ _id: ordemId }), findOneAndUpdate: update };
        const servicoModel = { findById: () => ({ lean: async () => ({ _id: new Types.ObjectId(servicoId), nome: 'Revisão', precoPadrao: 0.29, ativo: true }) }) };
        const service = new OrdemServicoService(model as unknown as Model<OrdemServico>, {} as Model<Veiculo>, servicoModel as unknown as Model<Servico>);
        await expect(service.adicionarServico(ordemId, { servicoId })).rejects.toThrow('Não foi possível adicionar o serviço');
        expect(update).toHaveBeenCalledOnce();
        expect(update.mock.calls[0][1]).toMatchObject({ $inc: { totalCentavos: 29 }, $push: { servicos: { nome: 'Revisão', precoCentavos: 29 } } });
    });
});
