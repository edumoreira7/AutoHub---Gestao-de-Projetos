import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdemServicoAddServicoDto } from './dto/ordem-servico-add-servico.dto.js';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoSearchDto } from './dto/ordem-servico-search.dto.js';
import { OrdemServicoStatusDto } from './dto/ordem-servico-status.dto.js';
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

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: OrdemServicoStatusDto) {
        return this.service.updateStatus(id, dto?.status);
    }

    @Post(':id/servicos')
    addServico(@Param('id') id: string, @Body() dto: OrdemServicoAddServicoDto) {
        return this.service.addServico(id, dto?.servicoId);
    }
}
