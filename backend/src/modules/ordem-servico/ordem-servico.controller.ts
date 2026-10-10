import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { OrdemServicoService } from './ordem-servico.service.js';

@Controller('ordens-servico')
export class OrdemServicoController {
    constructor(private readonly service: OrdemServicoService) {}

    @Get()
    findAll(@Query() dto: OrdemServicoSearchDto) {
        return this.service.findAll(dto);
    }

    @Post()
    create(@Body() dto: OrdemServicoCreateDto) {
        return this.service.create(dto);
    }
}
