import { Injectable } from '@nestjs/common';

import { VeiculoFields } from './veiculo.schema.js';
import { VeiculoCreateDto } from './dto/veiculo-create.dto.js';
import { VeiculoSearchDto } from './dto/veiculo-search.dto.js';
import { alreadyExists, invalid, notFound, required, requiredBody, success } from '../../utils/response.util.js';
import { ClienteRecord, LocalDataService, VeiculoRecord } from '../../utils/local-data.service.js';

@Injectable()
export class VeiculoService {
    constructor(private readonly localData: LocalDataService) {}

    async findAll(dto: VeiculoSearchDto) {
        const placa = dto.placa?.trim().toUpperCase().replace(/[\s-]/g, '');
        const marca = dto.marca?.trim().toLocaleLowerCase();
        const modelo = dto.modelo?.trim().toLocaleLowerCase();
        const veiculos = await this.localData.read<VeiculoRecord>('veiculos');
        const clientes = await this.localData.read<ClienteRecord>('clientes');
        const proprietarios = new Map(clientes.map((cliente) => [cliente._id, cliente.nomeCompleto]));
        const filtrados = veiculos.filter((veiculo) =>
            (!placa || veiculo.placa === placa)
            && (!marca || veiculo.marca.toLocaleLowerCase().includes(marca))
            && (!modelo || veiculo.modelo.toLocaleLowerCase().includes(modelo)),
        ).map((veiculo) => ({
            ...veiculo,
            cliente: proprietarios.get(veiculo.clienteId) ?? 'Cliente não encontrado',
        }));

        return success(undefined, filtrados);
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
        if (!/^[a-f\d]{24}$/i.test(clienteId)) invalid(VeiculoFields.clienteId);

        const clientes = await this.localData.read<ClienteRecord>('clientes');
        if (!clientes.some((cliente) => cliente._id === clienteId)) notFound('Cliente');

        return this.localData.update<VeiculoRecord, ReturnType<typeof success>>('veiculos', (veiculos) => {
            if (veiculos.some((veiculo) => veiculo.placa === placa)) alreadyExists(VeiculoFields.placa);
            const veiculo: VeiculoRecord = {
                _id: this.localData.createId(),
                placa,
                marca,
                modelo,
                ano,
                cor,
                clienteId,
            };
            veiculos.push(veiculo);
            return success(veiculo._id, undefined, 'Veículo cadastrado com sucesso');
        });
    }
}