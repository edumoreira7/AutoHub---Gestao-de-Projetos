import { Body, Controller, Post } from '@nestjs/common';

import { ClientesCreateDto } from './dto/clientes-create.dto.js';
import { ClientesService } from './clientes.service.js';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    create(@Body() dto: ClientesCreateDto) {
        return this.clientesService.create(dto);
    }
}