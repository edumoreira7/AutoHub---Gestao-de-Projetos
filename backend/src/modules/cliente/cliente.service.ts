import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ClienteCreateDto } from './dto/cliente-create.dto.js';
import { Cliente, ClienteFields } from './cliente.schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '../../utils/response.util.js';
import { duplicateKeyOf } from '../../utils/mongo.utils.js';
import { isValidCpf, isValidEmail, isValidPhone } from '../../utils/validation.utils.js';

@Injectable()
export class ClienteService {
    constructor(@InjectModel(Cliente.name) private readonly model: Model<Cliente>) { }

    async create(dto: ClienteCreateDto) {
        if (!dto) requiredBody();

        //------------------------------------------------------------------------------------------
        // Normalization.

        dto.cpf = dto.cpf?.trim();
        dto.email = dto.email?.trim().toLowerCase();
        dto.nomeCompleto = dto.nomeCompleto?.trim();
        dto.telefone = dto.telefone?.trim();
        dto.endereco = dto.endereco?.trim();

        //------------------------------------------------------------------------------------------
        // Validation.

        if (!dto.cpf) required(ClienteFields.cpf);
        if (!dto.email) required(ClienteFields.email);
        if (!dto.nomeCompleto) required(ClienteFields.nomeCompleto);
        if (!dto.telefone) required(ClienteFields.telefone);

        if (!isValidCpf(dto.cpf)) invalid(ClienteFields.cpf);
        if (!isValidEmail(dto.email)) invalid(ClienteFields.email);
        if (!isValidPhone(dto.telefone)) invalid(ClienteFields.telefone);

        const found = await this.model.findOne({ $or: [{ cpf: dto.cpf }, { email: dto.email }] });
        if (found) {
            if (found.cpf === dto.cpf) alreadyExists(ClienteFields.cpf);
            if (found.email === dto.email) alreadyExists(ClienteFields.email);
        }

        //------------------------------------------------------------------------------------------

        try {
            const cliente = await this.model.create(dto);
            return success(cliente._id.toString());
        } catch (error: unknown) {
            const field = duplicateKeyOf(error) as keyof typeof ClienteFields | undefined;
            if (field) alreadyExists(ClienteFields[field]);
            throw error;
        }
    }
}