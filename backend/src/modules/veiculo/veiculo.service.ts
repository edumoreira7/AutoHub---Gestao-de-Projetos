import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Cliente } from '../cliente/cliente.schema.js';
import { Veiculo, VeiculoFields } from './veiculo.schema.js';
import { VeiculoCreateDto } from './dto/veiculo-create.dto.js';
import { VeiculoSearchDto } from './dto/veiculo-search.dto.js';
import { alreadyExists, invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { duplicateKeyOf, excludeVersionKey, MONGO_REGEX_CASE_INSENSITIVE } from '../../utils/mongo.utils.js';
import { escapeRegex } from '../../utils/string.utils.js';

@Injectable()
export class VeiculoService {
    constructor(
        @InjectModel(Veiculo.name) private readonly model: Model<Veiculo>,
        @InjectModel(Cliente.name) private readonly clienteModel: Model<Cliente>,
    ) {}

    async findAll(dto: VeiculoSearchDto) {
        const placa = dto.placa?.trim().toUpperCase().replace(/[\s-]/g, '');
        const marca = dto.marca?.trim();
        const modelo = dto.modelo?.trim();
        const filter: Record<string, unknown> = {};

        if (placa) filter.placa = placa;
        if (marca) {
            filter.marca = {
                $regex: escapeRegex(marca),
                $options: MONGO_REGEX_CASE_INSENSITIVE,
            };
        }
        if (modelo) {
            filter.modelo = {
                $regex: escapeRegex(modelo),
                $options: MONGO_REGEX_CASE_INSENSITIVE,
            };
        }

        const veiculos = await excludeVersionKey(this.model.find(filter))
            .populate('clienteId', 'nomeCompleto')
            .lean() as unknown as Array<Record<string, unknown>>;

        return success(undefined, veiculos.map((veiculo) => {
            const cliente = veiculo.clienteId as { nomeCompleto?: unknown } | undefined;
            return {
                ...veiculo,
                cliente: cliente?.nomeCompleto ? String(cliente.nomeCompleto) : 'Cliente não encontrado',
            };
        }));
    }

    async create(dto: VeiculoCreateDto) {
        if (!dto) requiredBody();

        const placa = dto.placa?.trim().toUpperCase().replace(/[\s-]/g, '');
        const marca = dto.marca?.trim();
        const modelo = dto.modelo?.trim();
        const cor = dto.cor?.trim();
        const clienteId = dto.clienteId?.trim();
        const anoRaw: unknown = dto.ano;
        const ano = Number(anoRaw);

        if (!placa) required(VeiculoFields.placa);
        if (!marca) required(VeiculoFields.marca);
        if (!modelo) required(VeiculoFields.modelo);
        if (anoRaw === undefined || anoRaw === null || anoRaw === '') required(VeiculoFields.ano);
        if (!cor) required(VeiculoFields.cor);
        if (!clienteId) required(VeiculoFields.clienteId);

        if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) invalid(VeiculoFields.placa);
        if (!Number.isInteger(ano) || ano < 1886 || ano > new Date().getFullYear() + 1) invalid(VeiculoFields.ano);
        if (marca.length > 60) invalid(VeiculoFields.marca);
        if (modelo.length > 60) invalid(VeiculoFields.modelo);
        if (cor.length > 40) invalid(VeiculoFields.cor);
        if (!/^[a-f\d]{24}$/i.test(clienteId) || !Types.ObjectId.isValid(clienteId)) invalid(VeiculoFields.clienteId);

        const cliente = await this.clienteModel.exists({ _id: clienteId });
        if (!cliente) notFound('Cliente');

        try {
            const veiculo = await this.model.create({
                placa,
                marca,
                modelo,
                ano,
                cor,
                clienteId: new Types.ObjectId(clienteId),
            });
            return success(veiculo._id.toString(), undefined, 'Veículo cadastrado com sucesso');
        } catch (error: unknown) {
            const field = duplicateKeyOf(error) as keyof typeof VeiculoFields | undefined;
            if (field) alreadyExists(VeiculoFields[field]);
            throw error;
        }
    }
}
