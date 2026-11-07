import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdemServicoStatusDto } from './dto/ordem-servico-status.dto.js';
import { AdicionarServicoDto } from './dto/adicionar-servico.dto.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { OrdemServicoService } from './ordem-servico.service.js';

@Controller('ordens-servico')
export class OrdemServicoController {
    constructor(private readonly service: OrdemServicoService) {}

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: OrdemServicoStatusDto) {
        return this.service.updateStatus(id, dto?.status);
    }

    @Get(':id/orcamento')
    orcamento(@Param('id') id: string) { return this.service.orcamento(id); }

    @Post(':id/servicos')
    adicionarServico(@Param('id') id: string, @Body() dto: AdicionarServicoDto) {
        return this.service.adicionarServico(id, dto);
    }

    @Get()
    findAll(@Query() dto: OrdemServicoSearchDto) {
        return this.service.findAll(dto);
    }

    @Post()
    create(@Body() dto: OrdemServicoCreateDto) {
        return this.service.create(dto);
    }
}
