import { Body, Controller, Post } from '@nestjs/common';

import { ClienteCreateDto } from './dto/cliente-create.dto.js';
import { ClienteService } from './cliente.service.js';

@Controller('clientes')
export class ClienteController {
    constructor(private readonly service: ClienteService) { }

    @Post()
    create(@Body() dto: ClienteCreateDto) {
        return this.service.create(dto);
    }
}