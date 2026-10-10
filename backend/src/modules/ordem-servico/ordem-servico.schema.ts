import { SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';
import { Veiculo } from '../veiculo/veiculo.schema.js';

@DefaultSchema('ordens_servico')
export class OrdemServico {
    @Field('Descrição', { required: true, trim: true, maxlength: 1000 })
    descricao!: string;

    @Field('Data', { required: true })
    data!: string;

    @Field('Veículo', { type: Types.ObjectId, ref: Veiculo.name, required: true })
    veiculoId!: Types.ObjectId;
}

export const OrdemServicoFields = fieldsOf(OrdemServico);
export const OrdemServicoSchema = SchemaFactory.createForClass(OrdemServico);
OrdemServicoSchema.index({ veiculoId: 1 });
