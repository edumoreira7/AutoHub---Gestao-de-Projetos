import { SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';

export const ORDEM_SERVICO_STATUSES = [
    'ABERTA',
    'EM_ANDAMENTO',
    'AGUARDANDO_PEÇAS',
    'CONCLUÍDA',
    'CANCELADA',
] as const;

export type OrdemServicoStatus = (typeof ORDEM_SERVICO_STATUSES)[number];

export interface ItemServico {
    servicoId: Types.ObjectId;
    nome: string;
    precoCentavos: number;
}

@DefaultSchema('ordens_servico')
export class OrdemServico {
    @Field('Descrição', { required: true, trim: true, maxlength: 1000 })
    descricao!: string;

    @Field('Data', { required: true })
    data!: string;

    @Field('Veículo', { type: Types.ObjectId, ref: Veiculo.name, required: true })
    veiculoId!: Types.ObjectId;

    @Field('Status', { type: String, required: true, enum: ORDEM_SERVICO_STATUSES, default: 'ABERTA' })
    status!: OrdemServicoStatus;

    @Field('Serviços', {
        type: [{ _id: false, servicoId: { type: Types.ObjectId, ref: 'Servico', required: true },
            nome: { type: String, required: true }, precoCentavos: { type: Number, required: true, min: 1, validate: Number.isSafeInteger } }],
        default: [],
    })
    servicos!: ItemServico[];

    @Field('Total em centavos', { type: Number, default: 0, min: 0, validate: Number.isSafeInteger })
    totalCentavos!: number;
}

export const OrdemServicoFields = fieldsOf(OrdemServico);
export const OrdemServicoSchema = SchemaFactory.createForClass(OrdemServico);
OrdemServicoSchema.index({ veiculoId: 1 });
