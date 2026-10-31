import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';
import { Servico } from '../servico/servico.schema.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';

export const ORDEM_SERVICO_STATUSES = [
    'ABERTA',
    'EM_ANDAMENTO',
    'AGUARDANDO_PEÇAS',
    'CONCLUÍDA',
    'CANCELADA',
] as const;

export type OrdemServicoStatus = (typeof ORDEM_SERVICO_STATUSES)[number];

@Schema({ _id: false })
export class OrdemServicoItem {
    @Prop({ type: Types.ObjectId, ref: Servico.name, required: true })
    servicoId!: Types.ObjectId;

    @Prop({ type: String, required: true, trim: true })
    nome!: string;

    @Prop({ type: Number, required: true, min: 0 })
    preco!: number;
}

export const OrdemServicoItemSchema = SchemaFactory.createForClass(OrdemServicoItem);

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

    @Field('Serviços', { type: [OrdemServicoItemSchema], default: [] })
    servicos!: OrdemServicoItem[];

    @Field('Valor total', { type: Number, required: true, min: 0, default: 0 })
    valorTotal!: number;
}

export const OrdemServicoFields = fieldsOf(OrdemServico);
export const OrdemServicoSchema = SchemaFactory.createForClass(OrdemServico);
OrdemServicoSchema.index({ veiculoId: 1 });
