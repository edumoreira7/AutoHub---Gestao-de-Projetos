import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { VeiculoCreateDto } from './dto/veiculo-create.dto.js';
import { VeiculoSearchDto } from './dto/veiculo-search.dto.js';
import { VeiculoService } from './veiculo.service.js';

@Controller('veiculos')
export class VeiculoController {
    constructor(private readonly service: VeiculoService) {}

    @Post()
    create(@Body() dto: VeiculoCreateDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() dto: VeiculoSearchDto) {
        return this.service.findAll(dto);
    }
}
