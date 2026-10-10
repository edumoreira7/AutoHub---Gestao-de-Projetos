import { Module } from '@nestjs/common';

import { ClienteController } from './cliente.controller.js';
import { ClienteService } from './cliente.service.js';

@Module({
    controllers: [ClienteController],
    providers: [ClienteService],
})
export class ClienteModule { }