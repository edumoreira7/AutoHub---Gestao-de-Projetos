import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ServicoCreateDto } from './dto/servico-create.dto.js';
import { ServicoService } from './servico.service.js';

@Controller('servicos')
export class ServicoController {
    constructor(private readonly service: ServicoService) {}

    @Get()
    findAll(@Query('ativo') ativo?: string) {
        return this.service.findAll(ativo);
    }

    @Post()
    create(@Body() dto: ServicoCreateDto) {
        return this.service.create(dto);
    }
}
