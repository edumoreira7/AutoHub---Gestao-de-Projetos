import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Servico, ServicoSchema } from './servico.schema.js';
import { ServicoService } from './servico.service.js';
import { ServicoController } from './servico.controller.js';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Servico.name, schema: ServicoSchema },
        ]),
    ],
    providers: [ServicoService],
    controllers: [ServicoController],
    exports: [ServicoService],
})
export class ServicoModule {}
