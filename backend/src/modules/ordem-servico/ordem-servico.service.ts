import { Injectable } from '@nestjs/common';
import { invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { LocalDataService, OrdemServicoRecord, VeiculoRecord } from '../../utils/local-data.service.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoFields } from './ordem-servico.schema.js';

@Injectable()
export class OrdemServicoService {
    constructor(private readonly localData: LocalDataService) {}

    async create(dto: OrdemServicoCreateDto) {
        if (!dto) requiredBody();

        const descricao = dto.descricao?.trim();
        const data = dto.data?.trim();
        const veiculoId = dto.veiculoId?.trim();

        if (!descricao) required(OrdemServicoFields.descricao);
        if (!data) required(OrdemServicoFields.data);
        if (!veiculoId) required(OrdemServicoFields.veiculoId);
        if (descricao.length > 1000) invalid(OrdemServicoFields.descricao);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) invalid(OrdemServicoFields.data);

        const dataValida = new Date(`${data}T00:00:00.000Z`);
        if (Number.isNaN(dataValida.getTime()) || dataValida.toISOString().slice(0, 10) !== data) {
            invalid(OrdemServicoFields.data);
        }
        if (!/^[a-f\d]{24}$/i.test(veiculoId)) invalid(OrdemServicoFields.veiculoId);

        const veiculos = await this.localData.read<VeiculoRecord>('veiculos');
        if (!veiculos.some((veiculo) => veiculo._id === veiculoId)) notFound('Veículo');

        return this.localData.update<OrdemServicoRecord, ReturnType<typeof success>>(
            'ordens-servico',
            (ordens) => {
                const ordem: OrdemServicoRecord = {
                    _id: this.localData.createId(),
                    descricao,
                    data,
                    veiculoId,
                };
                ordens.push(ordem);
                return success(ordem._id, undefined, 'Ordem de serviço cadastrada com sucesso');
            },
        );
    }
}