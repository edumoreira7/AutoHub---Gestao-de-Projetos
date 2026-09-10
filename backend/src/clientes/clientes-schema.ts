import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'clientes' })
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