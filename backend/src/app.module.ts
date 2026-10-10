import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteModule } from './modules/cliente/cliente.module.js';
import { VeiculoModule } from './modules/veiculo/veiculo.module.js';
import { OrdemServicoModule } from './modules/ordem-servico/ordem-servico.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        dbName: configService.get<string>('MONGO_DB_NAME') || 'autohub',
      }),
    }),

    ClienteModule,
    VeiculoModule,
    OrdemServicoModule,
  ],
})
export class AppModule { }
