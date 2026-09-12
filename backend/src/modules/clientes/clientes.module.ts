import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cliente, ClienteSchema } from './clientes-schema.js';
import { ClientesController } from './clientes.controller.js';
import { ClientesService } from './clientes.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Cliente.name,
                schema: ClienteSchema,
            },
        ]),
    ],
    controllers: [ClientesController],
    providers: [ClientesService],
})
export class ClientesModule { }