import { Body, Controller, Post } from '@nestjs/common';
import { OrdemServicoCreateDto } from './dto/ordem-servico-create.dto.js';
import { OrdemServicoService } from './ordem-servico.service.js';

@Controller('ordens-servico')
export class OrdemServicoController {
    constructor(private readonly service: OrdemServicoService) {}

    @Post()
    create(@Body() dto: OrdemServicoCreateDto) {
        return this.service.create(dto);
    }
}