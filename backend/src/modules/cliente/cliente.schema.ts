import { SchemaFactory } from '@nestjs/mongoose';
import { DefaultSchema, Field, fieldsOf } from '../../utils/mongo.utils.js';

@DefaultSchema('clientes')
export class Cliente {
    @Field('CPF')
    cpf!: string;
    
    @Field('Email')
    email!: string;
    
    @Field('Nome completo')
    nomeCompleto!: string;
    
    @Field('Telefone')
    telefone!: string;
    
    @Field('Endereço')
    endereco?: string;
}

export const ClienteFields = fieldsOf(Cliente);
export const ClienteSchema = SchemaFactory.createForClass(Cliente);
ClienteSchema.index({ cpf: 1 }, { unique: true });
ClienteSchema.index({ email: 1 }, { unique: true });