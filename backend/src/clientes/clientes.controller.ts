import { Body, Controller, Post } from '@nestjs/common';

import { CreateClienteDto } from './dto/clientes-create.dto.js';
import { ClientesService } from './clientes.service.js';

@Controller('clientes')
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    create(@Body() createClienteDto: CreateClienteDto) {
        return this.clientesService.create(createClienteDto);
    }
}