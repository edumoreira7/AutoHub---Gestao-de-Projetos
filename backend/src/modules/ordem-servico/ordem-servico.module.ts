import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Veiculo, VeiculoSchema } from '../veiculo/veiculo.schema.js';
import { OrdemServicoController } from './ordem-servico.controller.js';
import { OrdemServico, OrdemServicoSchema } from './ordem-servico.schema.js';
import { OrdemServicoService } from './ordem-servico.service.js';
import { Servico, ServicoSchema } from '../servico/servico.schema.js';

const mongoModels = process.env.DATA_MODE === 'local'
    ? []
    : [
        MongooseModule.forFeature([
            {
                name: OrdemServico.name,
                schema: OrdemServicoSchema,
            },
            {
                name: Veiculo.name,
                schema: VeiculoSchema,
            },
            {
                name: Servico.name,
                schema: ServicoSchema,
            },
        ]),
    ];

@Module({
    imports: mongoModels,
    controllers: [OrdemServicoController],
    providers: [OrdemServicoService],
})
export class OrdemServicoModule {}
