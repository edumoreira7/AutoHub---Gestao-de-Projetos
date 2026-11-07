import { Body, Controller, Get, Injectable, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { badRequest, conflict, notFound, success } from '../utils/response.util.js';
import { escapeRegex } from '../utils/string.utils.js';

@Schema({ collection: 'pecas', timestamps: true })
class Peca {
    @Prop({ required: true, trim: true }) nome!: string;
    @Prop({ required: true, unique: true, trim: true }) codigo!: string;
    @Prop({ required: true, min: 0, validate: Number.isSafeInteger }) quantidade!: number;
}
const PecaSchema = SchemaFactory.createForClass(Peca);

@Injectable()
class EstoqueService {
    constructor(@InjectModel(Peca.name) private readonly model: Model<Peca>) {}

    async listar(busca?: string) {
        if (busca !== undefined && typeof busca !== 'string') badRequest('Pesquisa inválida');
        const termo = escapeRegex(busca?.trim() ?? '');
        return success(undefined, await this.model.find(termo ? { $or: [{ nome: { $regex: termo, $options: 'i' } }, { codigo: { $regex: termo, $options: 'i' } }] } : {}).sort({ nome: 1 }).select('-__v').lean());
    }

    async criar(dto: { nome?: string; codigo?: string; quantidade?: number }) {
        if (typeof dto?.nome !== 'string' || !dto.nome.trim() || dto.nome.trim().length > 100) badRequest('Informe o nome da peça (até 100 caracteres)');
        if (typeof dto.codigo !== 'string' || !dto.codigo.trim() || dto.codigo.trim().length > 40) badRequest('Informe o código da peça (até 40 caracteres)');
        if (!Number.isSafeInteger(dto.quantidade) || dto.quantidade! < 0) badRequest('Informe uma quantidade inteira maior ou igual a zero');
        try {
            const peca = await this.model.create({ nome: dto.nome.trim(), codigo: dto.codigo.trim().toUpperCase(), quantidade: dto.quantidade });
            return success(peca._id.toString(), peca, 'Peça cadastrada com sucesso');
        } catch (error) {
            if ((error as { code?: number }).code === 11000) conflict('Código de peça já cadastrado');
            throw error;
        }
    }

    async movimentar(id: string, dto: { quantidade?: number }) {
        if (!/^[a-f\d]{24}$/i.test(id)) badRequest('Identificador da peça inválido');
        const delta = dto?.quantidade;
        if (!Number.isSafeInteger(delta) || delta === 0) badRequest('Informe uma movimentação inteira diferente de zero');
        const quantidade = delta as number;
        const peca = await this.model.findOneAndUpdate({
            _id: new Types.ObjectId(id),
            quantidade: { $gte: quantidade < 0 ? -quantidade : 0, $lte: quantidade > 0 ? Number.MAX_SAFE_INTEGER - quantidade : Number.MAX_SAFE_INTEGER },
        }, { $inc: { quantidade } }, { returnDocument: 'after', runValidators: true }).select('-__v').lean();
        if (!peca) {
            if (!await this.model.exists({ _id: id })) notFound('Peça');
            badRequest('Movimentação inválida: estoque insuficiente ou limite de quantidade excedido');
        }
        return success(id, peca, 'Estoque atualizado com sucesso');
    }
}

@Controller('pecas')
class EstoqueController {
    constructor(private readonly service: EstoqueService) {}
    @Get() listar(@Query('busca') busca?: string) { return this.service.listar(busca); }
    @Post() criar(@Body() dto: { nome?: string; codigo?: string; quantidade?: number }) { return this.service.criar(dto); }
    @Patch(':id/movimentacoes') movimentar(@Param('id') id: string, @Body() dto: { quantidade?: number }) { return this.service.movimentar(id, dto); }
}

@Module({ imports: [MongooseModule.forFeature([{ name: Peca.name, schema: PecaSchema }])], providers: [EstoqueService], controllers: [EstoqueController] })
export class EstoqueModule {}
