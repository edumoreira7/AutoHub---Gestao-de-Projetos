import { SchemaFactory } from '@nestjs/mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';

@DefaultSchema('servicos')
export class Servico {
    @Field('Nome', { type: String, required: true, trim: true, maxlength: 120 })
    nome!: string;

    @Field('Preço padrão', { type: Number, required: true, min: 0.01 })
    precoPadrao!: number;

    @Field('Ativo', { type: Boolean, required: true, default: true })
    ativo!: boolean;
}

export const ServicoFields = fieldsOf(Servico);
export const ServicoSchema = SchemaFactory.createForClass(Servico);
