import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteModule } from './modules/cliente/cliente.module.js';
import { VeiculoModule } from './modules/veiculo/veiculo.module.js';
import { OrdemServicoModule } from './modules/ordem-servico/ordem-servico.module.js';
import { ServicoModule } from './modules/servico/servico.module.js';
import { LocalDataModule } from './utils/local-data.module.js';

const localDataMode = process.env.DATA_MODE === 'local';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    LocalDataModule,

    ...(!localDataMode
      ? [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>('MONGO_URI'),
              dbName: configService.get<string>('MONGO_DB_NAME') || 'autohub',
            }),
          }),
        ]
      : []),

    ClienteModule,
    VeiculoModule,
    OrdemServicoModule,
    ServicoModule,
  ],
})
export class AppModule { }
