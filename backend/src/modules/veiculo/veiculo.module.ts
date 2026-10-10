import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cliente, ClienteSchema } from '../cliente/cliente.schema.js';
import { VeiculoController } from './veiculo.controller.js';
import { Veiculo, VeiculoSchema } from './veiculo.schema.js';
import { VeiculoService } from './veiculo.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Veiculo.name,
                schema: VeiculoSchema,
            },
            {
                name: Cliente.name,
                schema: ClienteSchema,
            },
        ]),
    ],
    controllers: [VeiculoController],
    providers: [VeiculoService],
})
export class VeiculoModule {}
