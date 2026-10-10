import { Body, Query, Controller, Post, Get } from '@nestjs/common';

import { ClienteCreateDto } from './dto/cliente-create.dto.js';
import { ClienteSearchDto } from './dto/cliente-search.dto.js';
import { ClienteService } from './cliente.service.js';

@Controller('clientes')
export class ClienteController {
    constructor(private readonly service: ClienteService) { }

    @Post()
    create(@Body() dto: ClienteCreateDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() dto: ClienteSearchDto) {
        return this.service.findAll(dto);
    }
}