import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { Cliente } from './clientes-schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '../utils/response.util.js';
import { isDuplicateKeyError } from '../utils/mongo.utils.js';
import { isValidCpf, isValidEmail, isValidPhone } from '../utils/validation.utils.js';

@Injectable()
export class ClientesService {
    constructor(@InjectModel(Cliente.name) private readonly clienteModel: Model<Cliente>) { }

    async create(createClienteDto: CreateClienteDto) {
        if (!createClienteDto) requiredBody();

        if (!createClienteDto.nomeCompleto) required('Nome completo');
        if (!createClienteDto.cpf) required('CPF');
        if (!createClienteDto.telefone) required('Telefone');
        if (!createClienteDto.email) required('Email');

        if (!isValidCpf(createClienteDto.cpf)) invalid('CPF');
        if (!isValidEmail(createClienteDto.email)) invalid('Email');
        if (!isValidPhone(createClienteDto.telefone)) invalid('Telefone');

        //------------------------------------------------------------------------------------------

        const clienteExistente = await this.clienteModel.exists({ cpf: createClienteDto.cpf });
        if (clienteExistente) alreadyExists('CPF');

        try {
            const cliente = await this.clienteModel.create(createClienteDto);
            return success(undefined, cliente._id.toString());
        } catch (error: unknown) {
            if (isDuplicateKeyError(error)) alreadyExists('CPF');
            throw error;
        }
    }
}