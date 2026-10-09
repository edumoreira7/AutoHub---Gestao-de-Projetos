import { SchemaFactory } from '@nestjs/mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';

@DefaultSchema('veiculos')
export class Veiculo {
    @Field('Placa')
    placa!: string;

    @Field('Marca')
    marca!: string;

    @Field('Modelo')
    modelo!: string;

    @Field('Ano')
    ano!: number;

    @Field('Cor')
    cor!: string;

    @Field('Cliente')
    clienteId!: string;
}

export const VeiculoFields = fieldsOf(Veiculo);
export const VeiculoSchema = SchemaFactory.createForClass(Veiculo);

VeiculoSchema.index({ placa: 1 }, { unique: true });
