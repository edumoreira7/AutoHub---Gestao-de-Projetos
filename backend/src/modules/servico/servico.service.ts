import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { invalid, required, requiredBody, success } from '../../utils/response.util.js';
import { LocalDataService } from '../../utils/local-data.service.js';
import type { ServicoRecord } from '../../utils/local-data.service.js';
import { ServicoCreateDto } from './dto/servico-create.dto.js';
import { Servico, ServicoFields } from './servico.schema.js';

function isMoneyAmount(value: unknown): value is number {
    return typeof value === 'number' &&
        Number.isFinite(value) &&
        value > 0 &&
        Math.abs(Math.round(value * 100) - value * 100) < 1e-8;
}

@Injectable()
export class ServicoService {
    constructor(
        private readonly localData: LocalDataService,
        @Optional() @InjectModel(Servico.name) private readonly model?: Model<Servico>,
    ) {}

    async findAll(ativo?: string) {
        let ativoFiltro: boolean | undefined;
        if (ativo !== undefined) {
            if (ativo !== 'true' && ativo !== 'false') invalid('Filtro de ativo');
            ativoFiltro = ativo === 'true';
        }

        if (process.env.DATA_MODE === 'local') {
            const servicos = await this.localData.read<ServicoRecord>('servicos');
            return success(undefined, servicos.filter((servico) =>
                ativoFiltro === undefined || servico.ativo === ativoFiltro,
            ));
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de serviço não disponível.');
        return success(undefined, await model.find(
            ativoFiltro === undefined ? {} : { ativo: ativoFiltro },
        ).select('-__v').lean().exec());
    }

    async create(dto: ServicoCreateDto) {
        if (!dto) requiredBody();

        const nome = typeof dto.nome === 'string' ? dto.nome.trim() : '';
        const precoPadrao: unknown = dto.precoPadrao;
        const ativo: unknown = dto.ativo;

        if (!nome) required(ServicoFields.nome);
        if (nome.length > 120) invalid(ServicoFields.nome);
        if (precoPadrao === undefined || precoPadrao === null || precoPadrao === '') {
            required(ServicoFields.precoPadrao);
        }
        if (!isMoneyAmount(precoPadrao)) invalid(ServicoFields.precoPadrao);
        if (ativo !== undefined && typeof ativo !== 'boolean') invalid(ServicoFields.ativo);

        const servicoAtivo = ativo ?? true;
        const normalizedPrice = Math.round(precoPadrao * 100) / 100;
        if (process.env.DATA_MODE === 'local') {
            return this.localData.update<ServicoRecord, ReturnType<typeof success>>('servicos', (records) => {
                const id = this.localData.createId();
                records.push({ _id: id, nome, precoPadrao: normalizedPrice, ativo: servicoAtivo });
                return success(id, undefined, 'Serviço cadastrado com sucesso');
            });
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de serviço não disponível.');
        const servico = await model.create({ nome, precoPadrao: normalizedPrice, ativo: servicoAtivo });
        return success(servico._id.toString(), undefined, 'Serviço cadastrado com sucesso');
    }
}
