import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Servico } from './servico.schema.js';
import { ServicoCreateDto } from './servico-create.dto.js';
import { badRequest, internalServerError, success } from '../../utils/response.util.js';
import { INVALID_PRICE, priceInCents } from '../../utils/money.utils.js';

@Injectable()
export class ServicoService {
    constructor(
        @InjectModel(Servico.name)
        private readonly servicoModel: Model<Servico>,
    ) {}

    async criar(dto: ServicoCreateDto) {
        const cents = priceInCents(dto?.precoPadrao);
        if (cents === undefined) badRequest(INVALID_PRICE);
        if (typeof dto?.nome !== 'string' || !dto.nome.trim()) badRequest('Nome do serviço é obrigatório');
        if (dto.nome.trim().length > 100) badRequest('Nome do serviço deve ter no máximo 100 caracteres');
        if (dto.ativo !== undefined && typeof dto.ativo !== 'boolean') badRequest('Ativo deve ser verdadeiro ou falso');
        try {
            const servico = await this.servicoModel.create({ nome: dto.nome.trim(), precoPadrao: cents / 100, ativo: dto.ativo ?? true });
            return success(servico._id.toString(), servico, 'Serviço cadastrado com sucesso');
        } catch {
            internalServerError('Não foi possível cadastrar o serviço. Tente novamente.');
        }
    }

    async findActive() {
        // Older services had no ativo field and remain eligible.
        const servicos = await this.servicoModel.find({ ativo: { $ne: false } }).select('-__v').sort({ nome: 1 }).lean();
        return success(undefined, servicos.map(servico => ({ ...servico, ativo: true })));
    }
}
