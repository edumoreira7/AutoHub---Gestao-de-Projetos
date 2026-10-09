import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Veiculo, VeiculoSchema } from './veiculo.schema.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Veiculo.name, schema: VeiculoSchema },
        ]),
    ],
})
export class VeiculoModule {}
