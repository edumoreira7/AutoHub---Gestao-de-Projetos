import { SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';
import { Cliente } from '../cliente/cliente.schema.js';

@DefaultSchema('veiculos')
export class Veiculo {
    @Field('Placa', { required: true, trim: true, maxlength: 8 })
    placa!: string;

    @Field('Marca', { required: true, trim: true, maxlength: 60 })
    marca!: string;

    @Field('Modelo', { required: true, trim: true, maxlength: 60 })
    modelo!: string;

    @Field('Ano', { required: true, min: 1886 })
    ano!: number;

    @Field('Cor', { required: true, trim: true, maxlength: 40 })
    cor!: string;

    @Field('Cliente', { type: Types.ObjectId, ref: Cliente.name, required: true })
    clienteId!: Types.ObjectId;
}

export const VeiculoFields = fieldsOf(Veiculo);
export const VeiculoSchema = SchemaFactory.createForClass(Veiculo);

VeiculoSchema.index({ placa: 1 }, { unique: true });
VeiculoSchema.index({ clienteId: 1 });
