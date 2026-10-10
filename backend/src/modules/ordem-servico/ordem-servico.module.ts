import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Veiculo, VeiculoSchema } from '../veiculo/veiculo.schema.js';
import { OrdemServicoController } from './ordem-servico.controller.js';
import { OrdemServico, OrdemServicoSchema } from './ordem-servico.schema.js';
import { OrdemServicoService } from './ordem-servico.service.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: OrdemServico.name,
                schema: OrdemServicoSchema,
            },
            {
                name: Veiculo.name,
                schema: VeiculoSchema,
            },
        ]),
    ],
    controllers: [OrdemServicoController],
    providers: [OrdemServicoService],
})
export class OrdemServicoModule {}
