import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ClientesCreateDto } from './dto/clientes-create.dto.js';
import { Cliente } from './clientes-schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '../utils/response.util.js';
import { isDuplicateKeyError } from '../utils/mongo.utils.js';
import { isValidCpf, isValidEmail, isValidPhone } from '../utils/validation.utils.js';

@Injectable()
export class ClientesService {
    constructor(@InjectModel(Cliente.name) private readonly clienteModel: Model<Cliente>) { }

    async create(dto: ClientesCreateDto) {
        if (!dto) requiredBody();

        if (!dto.nomeCompleto) required('Nome completo');
        if (!dto.cpf) required('CPF');
        if (!dto.telefone) required('Telefone');
        if (!dto.email) required('Email');

        if (!isValidCpf(dto.cpf)) invalid('CPF');
        if (!isValidEmail(dto.email)) invalid('Email');
        if (!isValidPhone(dto.telefone)) invalid('Telefone');

        //------------------------------------------------------------------------------------------

        const clienteExistente = await this.clienteModel.exists({ cpf: dto.cpf });
        if (clienteExistente) alreadyExists('CPF');

        try {
            const cliente = await this.clienteModel.create(dto);
            return success(cliente._id.toString());
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) alreadyExists('CPF');
            throw error;
        }
    }
}