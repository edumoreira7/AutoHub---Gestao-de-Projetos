import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Cliente } from '../cliente/cliente.schema.js';
import { Veiculo, VeiculoFields } from './veiculo.schema.js';
import { VeiculoCreateDto } from './dto/veiculo-create.dto.js';
import { VeiculoSearchDto } from './dto/veiculo-search.dto.js';
import { alreadyExists, invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { duplicateKeyOf, excludeVersionKey, MONGO_REGEX_CASE_INSENSITIVE } from '../../utils/mongo.utils.js';
import { escapeRegex } from '../../utils/string.utils.js';
import { LocalDataService } from '../../utils/local-data.service.js';
import type { ClienteRecord, VeiculoRecord } from '../../utils/local-data.service.js';

@Injectable()
export class VeiculoService {
    constructor(
        private readonly localData: LocalDataService,
        @Optional() @InjectModel(Veiculo.name) private readonly model?: Model<Veiculo>,
        @Optional() @InjectModel(Cliente.name) private readonly clienteModel?: Model<Cliente>,
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

        if (process.env.DATA_MODE === 'local') {
            const [veiculos, clientes] = await Promise.all([
                this.localData.read<VeiculoRecord>('veiculos'),
                this.localData.read<ClienteRecord>('clientes'),
            ]);
            const result = veiculos
                .filter((veiculo) =>
                    (!placa || veiculo.placa === placa) &&
                    (!marca || new RegExp(escapeRegex(marca), 'i').test(veiculo.marca)) &&
                    (!modelo || new RegExp(escapeRegex(modelo), 'i').test(veiculo.modelo)),
                )
                .map((veiculo) => ({
                    ...veiculo,
                    cliente: clientes.find((cliente) => cliente._id === veiculo.clienteId)?.nomeCompleto
                        ?? 'Cliente não encontrado',
                }));
            return success(undefined, result);
        }

        const model = this.model;
        if (!model) throw new Error('Modelo MongoDB de veículo não disponível.');
        const veiculos = await excludeVersionKey(model.find(filter))
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

        if (process.env.DATA_MODE === 'local') {
            const clientes = await this.localData.read<ClienteRecord>('clientes');
            if (!clientes.some((cliente) => cliente._id === clienteId)) notFound('Cliente');

            return this.localData.update<VeiculoRecord, ReturnType<typeof success>>('veiculos', (records) => {
                if (records.some((record) => record.placa === placa)) alreadyExists(VeiculoFields.placa);

                const id = this.localData.createId();
                records.push({ _id: id, placa, marca, modelo, ano, cor, clienteId });
                return success(id, undefined, 'Veículo cadastrado com sucesso');
            });
        }

        const model = this.model;
        const clienteModel = this.clienteModel;
        if (!model || !clienteModel) throw new Error('Modelos MongoDB de veículo não disponíveis.');
        const cliente = await clienteModel.exists({ _id: clienteId });
        if (!cliente) notFound('Cliente');

        try {
            const veiculo = await model.create({
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
