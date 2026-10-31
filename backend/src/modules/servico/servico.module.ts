import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicoController } from './servico.controller.js';
import { Servico, ServicoSchema } from './servico.schema.js';
import { ServicoService } from './servico.service.js';

const mongoModels = process.env.DATA_MODE === 'local'
    ? []
    : [MongooseModule.forFeature([{ name: Servico.name, schema: ServicoSchema }])];

@Module({
    imports: mongoModels,
    controllers: [ServicoController],
    providers: [ServicoService],
})
export class ServicoModule {}
