import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

import { invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { OrdemServico, OrdemServicoFields } from './ordem-servico.schema.js';
import { escapeRegex } from '../../utils/string.utils.js';
import { MONGO_REGEX_CASE_INSENSITIVE, excludeVersionKey } from '../../utils/mongo.utils.js';

@Injectable()
export class OrdemServicoService {
    constructor(
        @InjectModel(OrdemServico.name) private readonly model: Model<OrdemServico>,
        @InjectModel(Veiculo.name) private readonly veiculoModel: Model<Veiculo>,
    ) {}

    async findAll(dto: OrdemServicoSearchDto = {}) {
        const filter: QueryFilter<OrdemServico> = {};
        const descricao = dto.descricao?.trim();
        const data = dto.data?.trim();
        const veiculoId = dto.veiculoId?.trim();

        if (descricao) {
            filter.descricao = {
                $regex: escapeRegex(descricao),
                $options: MONGO_REGEX_CASE_INSENSITIVE,
            };
        }

        if (data) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                invalid(OrdemServicoFields.data);
            }
            filter.data = data;
        }

        if (veiculoId) {
            if (!/^[a-f\d]{24}$/i.test(veiculoId) || !Types.ObjectId.isValid(veiculoId)) {
                invalid(OrdemServicoFields.veiculoId);
            }
            filter.veiculoId = new Types.ObjectId(veiculoId);
        }

        const ordens = (await excludeVersionKey(this.model.find(filter))
            .populate('veiculoId', 'placa marca modelo clienteId')
            .lean()) as unknown as Array<Record<string, unknown>>;

        return success(undefined, ordens.map((ordem) => {
            const veiculo = ordem.veiculoId as
                | { placa?: string; marca?: string; modelo?: string; clienteId?: { nomeCompleto?: string } | string | null }
                | undefined;

            return {
                ...ordem,
                veiculo: veiculo
                    ? `${veiculo.placa ?? 'Veículo'} · ${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`.trim().replace(/\s+/g, ' ')
                    : 'Veículo não encontrado',
                veiculoId: ordem.veiculoId && typeof ordem.veiculoId === 'object' ? (ordem.veiculoId as { _id?: string })._id ?? ordem.veiculoId : ordem.veiculoId,
            };
        }));
    }

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
        if (!/^[a-f\d]{24}$/i.test(veiculoId) || !Types.ObjectId.isValid(veiculoId)) invalid(OrdemServicoFields.veiculoId);

        const veiculo = await this.veiculoModel.exists({ _id: veiculoId });
        if (!veiculo) notFound('Veículo');

        const ordem = await this.model.create({
            descricao,
            data,
            veiculoId: new Types.ObjectId(veiculoId),
        });

        return success(ordem._id.toString(), undefined, 'Ordem de serviço cadastrada com sucesso');
    }
}
