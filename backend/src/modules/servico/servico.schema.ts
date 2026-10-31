import { SchemaFactory } from '@nestjs/mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';
import { priceInCents } from '../../utils/money.utils.js';

@DefaultSchema('servicos')
export class Servico {
    @Field('Nome do serviço', { required: true, trim: true, maxlength: 100 })
    nome!: string;

    @Field('Preço padrão', { required: true, min: 0.01, validate: (value: number) => priceInCents(value) !== undefined })
    precoPadrao!: number;

    @Field('Ativo', { type: Boolean, default: true })
    ativo!: boolean;
}

export const ServicoFields = fieldsOf(Servico);
export const ServicoSchema = SchemaFactory.createForClass(Servico);
