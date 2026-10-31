import { Body, Controller, Get, Post } from '@nestjs/common';
import { ServicoService } from './servico.service.js';
import { ServicoCreateDto } from './servico-create.dto.js';

@Controller('servicos')
export class ServicoController {
    constructor(private readonly service: ServicoService) {}
    @Post()
    create(@Body() dto: ServicoCreateDto) { return this.service.criar(dto); }
    @Get()
    findAll() { return this.service.findActive(); }
}
