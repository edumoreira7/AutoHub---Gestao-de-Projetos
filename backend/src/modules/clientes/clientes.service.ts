import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';

import { ClientesCreateDto } from './dto/clientes-create.dto.js';
import { ClientesSearchDto } from './dto/clientes-search.dto.js';
import { Cliente } from './clientes.schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '#utils/response.util.js';
import { isDuplicateKeyError, getExcludeFields, MONGO_REGEX_CASE_INSENSITIVE, MONGO_VERSION_KEY } from '#utils/mongo.utils.js';
import { isValidCpf, isValidEmail, isValidPhone } from '#utils/validation.utils.js';
import { escapeRegex, onlyDigits } from '#utils/string.utils.js';

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

    async findAll(dto: ClientesSearchDto) {
        const filter: QueryFilter<Cliente> = {};

        if (dto.cpf?.trim()) filter.cpf = onlyDigits(dto.cpf);
        if (dto.telefone?.trim()) filter.telefone = onlyDigits(dto.telefone);
        if (dto.nome?.trim()) filter.nomeCompleto = {
            $regex: escapeRegex(dto.nome.trim()),
            $options: MONGO_REGEX_CASE_INSENSITIVE,
        };

        const clientes = await this.clienteModel
            .find(filter)
            .select(getExcludeFields(MONGO_VERSION_KEY))
            .lean();

        return success(undefined, clientes);
    }
}