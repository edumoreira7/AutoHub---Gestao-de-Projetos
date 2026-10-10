import { Injectable } from '@nestjs/common';

import { ClienteCreateDto } from './dto/cliente-create.dto.js';
import { ClienteSearchDto } from './dto/cliente-search.dto.js';
import { ClienteFields } from './cliente.schema.js';

import { invalid, success, alreadyExists, required, requiredBody } from '../../utils/response.util.js';
import { isValidCpf, isValidEmail, isValidPhone } from '../../utils/validation.utils.js';
import { onlyDigits } from '../../utils/string.utils.js';
import { ClienteRecord, LocalDataService } from '../../utils/local-data.service.js';

@Injectable()
export class ClienteService {
    constructor(private readonly localData: LocalDataService) { }

    async create(dto: ClienteCreateDto) {
        if (!dto) requiredBody();

        const cpf = dto.cpf?.trim();
        const email = dto.email?.trim().toLowerCase();
        const nomeCompleto = dto.nomeCompleto?.trim();
        const telefone = dto.telefone?.trim();
        const endereco = dto.endereco?.trim();

        if (!cpf) required(ClienteFields.cpf);
        if (!email) required(ClienteFields.email);
        if (!nomeCompleto) required(ClienteFields.nomeCompleto);
        if (!telefone) required(ClienteFields.telefone);

        if (!isValidCpf(cpf)) invalid(ClienteFields.cpf);
        if (!isValidEmail(email)) invalid(ClienteFields.email);
        if (!isValidPhone(telefone)) invalid(ClienteFields.telefone);

        return this.localData.update<ClienteRecord, ReturnType<typeof success>>('clientes', (clientes) => {
            const found = clientes.find((cliente) =>
                onlyDigits(cliente.cpf) === onlyDigits(cpf) || cliente.email === email,
            );
            if (found) {
                if (onlyDigits(found.cpf) === onlyDigits(cpf)) alreadyExists(ClienteFields.cpf);
                if (found.email === email) alreadyExists(ClienteFields.email);
            }

            const cliente: ClienteRecord = {
                _id: this.localData.createId(),
                cpf,
                email,
                nomeCompleto,
                telefone,
                ...(endereco ? { endereco } : {}),
            };
            clientes.push(cliente);
            return success(cliente._id.toString());
        });
    }

    async findAll(dto: ClienteSearchDto) {
        const cpf = dto.cpf?.trim();
        const telefone = dto.telefone?.trim();
        const nome = dto.nome?.trim().toLocaleLowerCase();
        const clientes = await this.localData.read<ClienteRecord>('clientes');
        const filtrados = clientes.filter((cliente) =>
            (!cpf || onlyDigits(cliente.cpf) === onlyDigits(cpf))
            && (!telefone || onlyDigits(cliente.telefone) === onlyDigits(telefone))
            && (!nome || cliente.nomeCompleto.toLocaleLowerCase().includes(nome)),
        );

        return success(undefined, filtrados);
    }
}