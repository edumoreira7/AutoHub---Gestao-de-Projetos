import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cliente, ClienteSchema } from './cliente.schema.js';
import { ClienteController } from './cliente.controller.js';
import { ClienteService } from './cliente.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Cliente.name,
                schema: ClienteSchema,
            },
        ]),
    ],
    controllers: [ClienteController],
    providers: [ClienteService],
})
export class ClienteModule { }