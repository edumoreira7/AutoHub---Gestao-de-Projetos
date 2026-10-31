import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cliente, ClienteSchema } from './cliente.schema.js';
import { ClienteController } from './cliente.controller.js';
import { ClienteService } from './cliente.service.js';

const mongoModels = process.env.DATA_MODE === 'local'
    ? []
    : [
        MongooseModule.forFeature([
            {
                name: Cliente.name,
                schema: ClienteSchema,
            },
        ]),
    ];

@Module({
    imports: mongoModels,
    controllers: [ClienteController],
    providers: [ClienteService],
})
export class ClienteModule { }