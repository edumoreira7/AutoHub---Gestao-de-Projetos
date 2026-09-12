import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { DefaultSchema } from '../../utils/mongo.utils.js';

@DefaultSchema('clientes')
export class Cliente {
    @Prop({ required: true, trim: true })
    nomeCompleto!: string;

    @Prop({ required: true, trim: true })
    cpf!: string;

    @Prop({ required: true, trim: true })
    telefone!: string;

    @Prop({ required: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ trim: true })
    endereco?: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
ClienteSchema.index({ cpf: 1 }, { unique: true });