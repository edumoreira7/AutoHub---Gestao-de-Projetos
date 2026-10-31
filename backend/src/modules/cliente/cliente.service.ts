import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';

import { ClienteCreateDto } from './dto/cliente-create.dto.js';
import { ClienteSearchDto } from './dto/cliente-search.dto.js';
import { Cliente, ClienteFields } from './cliente.schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '../../utils/response.util.js';
import { duplicateKeyOf, excludeVersionKey, MONGO_REGEX_CASE_INSENSITIVE } from '../../utils/mongo.utils.js';
import { isValidCpf, isValidEmail, isValidPhone } from '../../utils/validation.utils.js';
import { escapeRegex, onlyDigits } from '../../utils/string.utils.js';
import { LocalDataService } from '../../utils/local-data.service.js';
import type { ClienteRecord } from '../../utils/local-data.service.js';

@Injectable()
export class ClienteService {
    constructor(
        private readonly localData: LocalDataService,
        @Optional() @InjectModel(Cliente.name) private readonly model?: Model<Cliente>,
    ) { }

    async create(dto: ClienteCreateDto) {
        if (!dto) requiredBody();

        dto.cpf = onlyDigits(dto.cpf?.trim() ?? '');
        dto.email = dto.email?.trim().toLowerCase();
        dto.nomeCompleto = dto.nomeCompleto?.trim();
        dto.telefone = onlyDigits(dto.telefone?.trim() ?? '');
        dto.endereco = dto.endereco?.trim();

        if (!dto.cpf) required(ClienteFields.cpf);
        if (!dto.email) required(ClienteFields.email);
        if (!dto.nomeCompleto) required(ClienteFields.nomeCompleto);
        if (!dto.telefone) required(ClienteFields.telefone);

        if (!isValidCpf(dto.cpf)) invalid(ClienteFields.cpf);
        if (!isValidEmail(dto.email)) invalid(ClienteFields.email);
        if (!isValidPhone(dto.telefone)) invalid(ClienteFields.telefone);

        if (process.env.DATA_MODE === 'local') {
            return this.localData.update<ClienteRecord, ReturnType<typeof success>>('clientes', (records) => {
                const found = records.find((record) => record.cpf === dto.cpf || record.email === dto.email);
                if (found?.cpf === dto.cpf) alreadyExists(ClienteFields.cpf);
                if (found?.email === dto.email) alreadyExists(ClienteFields.email);

                const id = this.localData.createId();
                records.push({
                    _id: id,
                    cpf: dto.cpf,
                    email: dto.email,
                    nomeCompleto: dto.nomeCompleto,
                    telefone: dto.telefone,
                    ...(dto.endereco ? { endereco: dto.endereco } : {}),
                });
                return success(id);
            });
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de cliente não disponível.');
        const found = await model.findOne({ $or: [{ cpf: dto.cpf }, { email: dto.email }] });
        if (found) {
            if (found.cpf === dto.cpf) alreadyExists(ClienteFields.cpf);
            if (found.email === dto.email) alreadyExists(ClienteFields.email);
        }

        try {
            const cliente = await model.create(dto);
            return success(cliente._id.toString());
        } catch (error: unknown) {
            const field = duplicateKeyOf(error) as keyof typeof ClienteFields | undefined;
            if (field) alreadyExists(ClienteFields[field]);
            throw error;
        }
    }

    async findAll(dto: ClienteSearchDto) {
        const filter: QueryFilter<Cliente> = {};

        dto.cpf = dto.cpf?.trim();
        dto.telefone = dto.telefone?.trim();
        dto.nome = dto.nome?.trim();

        if (dto.cpf) filter.cpf = onlyDigits(dto.cpf);
        if (dto.telefone) filter.telefone = onlyDigits(dto.telefone);
        if (dto.nome) filter.nomeCompleto = {
            $regex: escapeRegex(dto.nome.trim()),
            $options: MONGO_REGEX_CASE_INSENSITIVE,
        };

        if (process.env.DATA_MODE === 'local') {
            const nome = dto.nome ? new RegExp(escapeRegex(dto.nome), 'i') : undefined;
            const clientes = await this.localData.read<ClienteRecord>('clientes');
            return success(undefined, clientes.filter((cliente) =>
                (!dto.cpf || cliente.cpf === onlyDigits(dto.cpf)) &&
                (!dto.telefone || cliente.telefone === onlyDigits(dto.telefone)) &&
                (!nome || nome.test(cliente.nomeCompleto)),
            ));
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de cliente não disponível.');
        const clientes = await excludeVersionKey(model.find(filter)).lean();
        return success(undefined, clientes);
    }
}
