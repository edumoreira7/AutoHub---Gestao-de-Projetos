import { Body, Controller, Query, Get, Post } from '@nestjs/common';

import { ClientesCreateDto } from './dto/clientes-create.dto.js';
import { ClientesSearchDto } from './dto/clientes-search.dto.js';
import { ClientesService } from './clientes.service.js';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    create(@Body() dto: ClientesCreateDto) {
        return this.clientesService.create(dto);
    }

    @Get()
    findAll(@Query() dto: ClientesSearchDto) {
        return this.clientesService.findAll(dto);
    }
}