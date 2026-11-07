import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

import { invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { ORDEM_SERVICO_STATUSES, OrdemServico, OrdemServicoFields, OrdemServicoStatus } from './ordem-servico.schema.js';
import { escapeRegex } from '../../utils/string.utils.js';
import { MONGO_REGEX_CASE_INSENSITIVE, excludeVersionKey } from '../../utils/mongo.utils.js';
import { badRequest, conflict, internalServerError } from '../../utils/response.util.js';
import { Servico } from '../servico/servico.schema.js';
import { AdicionarServicoDto } from './dto/adicionar-servico.dto.js';
import { priceInCents } from '../../utils/money.utils.js';

@Injectable()
export class OrdemServicoService {
    constructor(
        @InjectModel(OrdemServico.name) private readonly model: Model<OrdemServico>,
        @InjectModel(Veiculo.name) private readonly veiculoModel: Model<Veiculo>,
        @InjectModel(Servico.name) private readonly servicoModel: Model<Servico>,
    ) {}

    async findAll(dto: OrdemServicoSearchDto = {}) {
        const filter: QueryFilter<OrdemServico> = {};
        for (const field of ['descricao', 'data', 'veiculoId'] as const) {
            if (dto[field] !== undefined && typeof dto[field] !== 'string') {
                invalid(OrdemServicoFields[field]);
            }
        }
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
            const parsedDate = new Date(data + 'T00:00:00.000Z');
            if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== data) {
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
                status: ordem.status ?? null,
                servicos: ordem.servicos ?? [],
                totalCentavos: ordem.totalCentavos ?? 0,
                total: Number(ordem.totalCentavos ?? 0) / 100,
                veiculo: veiculo
                    ? `${veiculo.placa ?? 'Veículo'} · ${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`.trim().replace(/\s+/g, ' ')
                    : 'Veículo não encontrado',
                veiculoId: ordem.veiculoId && typeof ordem.veiculoId === 'object' ? (ordem.veiculoId as { _id?: string })._id ?? ordem.veiculoId : ordem.veiculoId,
            };
        }));
    }

    async orcamento(id: string) {
        if (!/^[a-f\d]{24}$/i.test(id)) badRequest('Identificador da ordem de serviço inválido');
        const ordem = await this.model.findById(id).populate('veiculoId', 'placa marca modelo').lean();
        if (!ordem) notFound('Ordem de serviço');
        if (!ordem.servicos?.length) badRequest('Adicione ao menos um item para gerar o orçamento');
        return success(id, { ordemId: id, descricao: ordem.descricao, data: ordem.data, veiculo: ordem.veiculoId, itens: ordem.servicos, totalCentavos: ordem.totalCentavos, emitidoEm: new Date().toISOString() });
    }

    async updateStatus(id: string, status: string | undefined) {
        const ordemId = id?.trim();
        if (!ordemId || !/^[a-f\d]{24}$/i.test(ordemId) || !Types.ObjectId.isValid(ordemId)) {
            invalid('Identificador da ordem de serviço');
        }
        if (!status || !ORDEM_SERVICO_STATUSES.includes(status as OrdemServicoStatus)) {
            invalid('Status');
        }

        const novoStatus = status as OrdemServicoStatus;
        const ordem = await this.model.findByIdAndUpdate(
            ordemId,
            { status: novoStatus },
            { returnDocument: 'after', runValidators: true },
        ).exec();
        if (!ordem) notFound('Ordem de serviço');

        return success(ordem._id.toString(), undefined, 'Status da ordem de serviço atualizado com sucesso');
    }

    async adicionarServico(id: string, dto: AdicionarServicoDto) {
        if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) badRequest('Identificador da ordem de serviço inválido');
        if (!await this.model.exists({ _id: id })) notFound('Ordem de serviço');
        if (typeof dto?.servicoId !== 'string' || !/^[a-f\d]{24}$/i.test(dto.servicoId)) badRequest('Serviço não encontrado no sistema');
        const servico = await this.servicoModel.findById(dto.servicoId).lean();
        if (!servico) badRequest('Serviço não encontrado no sistema');
        if (servico.ativo === false) badRequest('Serviço inativo não pode ser adicionado à ordem');
        const cents = priceInCents(servico.precoPadrao);
        if (cents === undefined) badRequest('O serviço possui um preço inválido e precisa ser corrigido');

        let ordem;
        try {
            // One atomic document update keeps item and total together under concurrency.
            ordem = await this.model.findOneAndUpdate({
                _id: id, 'servicos.servicoId': { $ne: servico._id },
                $or: [{ totalCentavos: { $exists: false } }, { totalCentavos: { $lte: Number.MAX_SAFE_INTEGER - cents } }],
            }, {
                $push: { servicos: { servicoId: servico._id, nome: servico.nome, precoCentavos: cents } },
                $inc: { totalCentavos: cents },
            }, { returnDocument: 'after', runValidators: true }).select('-__v').lean();
        } catch {
            internalServerError('Não foi possível adicionar o serviço. Tente novamente.');
        }
        if (!ordem) {
            if (!await this.model.exists({ _id: id })) notFound('Ordem de serviço');
            conflict('Serviço já adicionado à ordem ou limite do total atingido');
        }
        return success(id, { ...ordem, total: ordem.totalCentavos / 100 }, 'Serviço adicionado à ordem com sucesso');
    }

    async create(dto: OrdemServicoCreateDto) {
        if (!dto) requiredBody();

        for (const field of ['descricao', 'data', 'veiculoId'] as const) {
            if (dto[field] !== undefined && typeof dto[field] !== 'string') {
                invalid(OrdemServicoFields[field]);
            }
        }
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
