import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

import { invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { OrdemServico, OrdemServicoFields, ORDEM_SERVICO_STATUSES } from './ordem-servico.schema.js';
import type { OrdemServicoStatus } from './ordem-servico.schema.js';
import { escapeRegex } from '../../utils/string.utils.js';
import { MONGO_REGEX_CASE_INSENSITIVE, excludeVersionKey } from '../../utils/mongo.utils.js';
import { LocalDataService } from '../../utils/local-data.service.js';
import type { OrdemServicoItemRecord, OrdemServicoRecord, ServicoRecord, VeiculoRecord } from '../../utils/local-data.service.js';
import { Servico } from '../servico/servico.schema.js';

function isValidDateOnly(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

@Injectable()
export class OrdemServicoService {
    constructor(
        private readonly localData: LocalDataService,
        @Optional() @InjectModel(OrdemServico.name) private readonly model?: Model<OrdemServico>,
        @Optional() @InjectModel(Veiculo.name) private readonly veiculoModel?: Model<Veiculo>,
        @Optional() @InjectModel(Servico.name) private readonly servicoModel?: Model<Servico>,
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
            if (!isValidDateOnly(data)) invalid(OrdemServicoFields.data);
            filter.data = data;
        }

        if (veiculoId) {
            if (!/^[a-f\d]{24}$/i.test(veiculoId) || !Types.ObjectId.isValid(veiculoId)) {
                invalid(OrdemServicoFields.veiculoId);
            }
            filter.veiculoId = new Types.ObjectId(veiculoId);
        }

        if (process.env.DATA_MODE === 'local') {
            const [ordens, veiculos] = await Promise.all([
                this.localData.read<OrdemServicoRecord>('ordens-servico'),
                this.localData.read<VeiculoRecord>('veiculos'),
            ]);
            const resultado = ordens
                .filter((ordem) =>
                    (!descricao || new RegExp(escapeRegex(descricao), 'i').test(ordem.descricao)) &&
                    (!data || ordem.data === data) &&
                    (!veiculoId || ordem.veiculoId === veiculoId),
                )
                .map((ordem) => {
                    const veiculo = veiculos.find((item) => item._id === ordem.veiculoId);
                    return {
                        ...ordem,
                        status: ordem.status ?? null,
                        servicos: ordem.servicos ?? [],
                        valorTotal: ordem.valorTotal ?? 0,
                        veiculo: veiculo
                            ? `${veiculo.placa ?? 'Veículo'} · ${veiculo.marca ?? ''} ${veiculo.modelo ?? ''}`.trim().replace(/\s+/g, ' ')
                            : 'Veículo não encontrado',
                    };
                });
            return success(undefined, resultado);
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de ordem de serviço não disponível.');
        const ordens = (await excludeVersionKey(model.find(filter))
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
                valorTotal: ordem.valorTotal ?? 0,
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
        if (!isValidDateOnly(data)) invalid(OrdemServicoFields.data);
        const agora = new Date();
        const hoje = [
            agora.getFullYear(),
            String(agora.getMonth() + 1).padStart(2, '0'),
            String(agora.getDate()).padStart(2, '0'),
        ].join('-');
        if (data < hoje) invalid(OrdemServicoFields.data);
        if (!/^[a-f\d]{24}$/i.test(veiculoId) || !Types.ObjectId.isValid(veiculoId)) invalid(OrdemServicoFields.veiculoId);

        if (process.env.DATA_MODE === 'local') {
            const veiculos = await this.localData.read<VeiculoRecord>('veiculos');
            if (!veiculos.some((veiculo) => veiculo._id === veiculoId)) notFound('Veículo');

            return this.localData.update<OrdemServicoRecord, ReturnType<typeof success>>('ordens-servico', (records) => {
                const id = this.localData.createId();
                records.push({ _id: id, descricao, data, veiculoId, status: 'ABERTA' });
                return success(id, undefined, 'Ordem de serviço cadastrada com sucesso');
            });
        }

        const model = this.model;
        const veiculoModel = this.veiculoModel;
        if (!model || !veiculoModel) throw new Error('Modelos MongoDB de ordem de serviço não disponíveis.');
        const veiculo = await veiculoModel.exists({ _id: veiculoId });
        if (!veiculo) notFound('Veículo');

        const ordem = await model.create({
            descricao,
            data,
            veiculoId: new Types.ObjectId(veiculoId),
            status: 'ABERTA',
            servicos: [],
            valorTotal: 0,
        });

        return success(ordem._id.toString(), undefined, 'Ordem de serviço cadastrada com sucesso');
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
        if (process.env.DATA_MODE === 'local') {
            return this.localData.update<OrdemServicoRecord, ReturnType<typeof success>>('ordens-servico', (records) => {
                const ordem = records.find((record) => record._id === ordemId);
                if (!ordem) notFound('Ordem de serviço');
                ordem.status = novoStatus;
                return success(ordemId, undefined, 'Status da ordem de serviço atualizado com sucesso');
            });
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de ordem de serviço não disponível.');
        const ordem = await model.findByIdAndUpdate(
            ordemId,
            { status: novoStatus },
            { new: true, runValidators: true },
        ).exec();
        if (!ordem) notFound('Ordem de serviço');

        return success(ordem._id.toString(), undefined, 'Status da ordem de serviço atualizado com sucesso');
    }

    async addServico(id: string, servicoId: string | undefined) {
        const ordemId = id?.trim();
        const novoServicoId = servicoId?.trim();
        if (!ordemId || !/^[a-f\d]{24}$/i.test(ordemId) || !Types.ObjectId.isValid(ordemId)) {
            invalid('Identificador da ordem de serviço');
        }
        if (!novoServicoId || !/^[a-f\d]{24}$/i.test(novoServicoId) || !Types.ObjectId.isValid(novoServicoId)) {
            invalid('Identificador do serviço');
        }

        if (process.env.DATA_MODE === 'local') {
            const servicos = await this.localData.read<ServicoRecord>('servicos');
            const servico = servicos.find((item) => item._id === novoServicoId);
            if (!servico) notFound('Serviço');
            if (!servico.ativo) invalid('Serviço inativo');

            return this.localData.update<OrdemServicoRecord, ReturnType<typeof success>>('ordens-servico', (ordens) => {
                const ordem = ordens.find((item) => item._id === ordemId);
                if (!ordem) notFound('Ordem de serviço');
                const itens = ordem.servicos ?? [];
                if (itens.some((item) => item.servicoId === novoServicoId)) {
                    invalid('Este serviço já foi adicionado à ordem de serviço');
                }

                const precoCentavos = Math.round(servico.precoPadrao * 100);
                const item: OrdemServicoItemRecord = {
                    servicoId: novoServicoId,
                    nome: servico.nome,
                    preco: precoCentavos / 100,
                };
                ordem.servicos = [...itens, item];
                ordem.valorTotal = (Math.round((ordem.valorTotal ?? 0) * 100) + precoCentavos) / 100;
                return success(ordemId, {
                    servicos: ordem.servicos,
                    valorTotal: ordem.valorTotal,
                }, 'Serviço adicionado à ordem de serviço');
            });
        }

        const servicoModel = this.servicoModel;
        const model = this.model;
        if (!servicoModel || !model) throw new Error('Modelos MongoDB de serviço e ordem de serviço não disponíveis.');
        const servico = await servicoModel.findById(novoServicoId).lean().exec();
        if (!servico) notFound('Serviço');
        if (!servico.ativo) invalid('Serviço inativo');

        const precoCentavos = Math.round(servico.precoPadrao * 100);
        const item = {
            servicoId: new Types.ObjectId(novoServicoId),
            nome: servico.nome,
            preco: precoCentavos / 100,
        };
        const ordemAtualizada = await model.findOneAndUpdate(
            {
                _id: ordemId,
                'servicos.servicoId': { $ne: item.servicoId },
            },
            [
                {
                    $set: {
                        servicos: {
                            $concatArrays: [
                                { $ifNull: ['$servicos', []] },
                                [item],
                            ],
                        },
                        valorTotal: {
                            $round: [
                                { $add: [{ $ifNull: ['$valorTotal', 0] }, item.preco] },
                                2,
                            ],
                        },
                    },
                },
            ],
            { new: true },
        ).exec();

        if (!ordemAtualizada) {
            const existeOrdem = await model.exists({ _id: ordemId });
            if (!existeOrdem) notFound('Ordem de serviço');
            invalid('Este serviço já foi adicionado à ordem de serviço');
        }

        return success(ordemId, {
            servicos: ordemAtualizada.servicos,
            valorTotal: ordemAtualizada.valorTotal,
        }, 'Serviço adicionado à ordem de serviço');
    }
}
