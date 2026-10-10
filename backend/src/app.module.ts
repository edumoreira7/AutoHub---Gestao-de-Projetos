import { Module } from '@nestjs/common';
import { ClienteModule } from './modules/cliente/cliente.module.js';
import { VeiculoModule } from './modules/veiculo/veiculo.module.js';
import { OrdemServicoModule } from './modules/ordem-servico/ordem-servico.module.js';
import { LocalDataModule } from './utils/local-data.module.js';

@Module({
  imports: [
    LocalDataModule,
    ClienteModule,
    VeiculoModule,
    OrdemServicoModule,
  ],
})
export class AppModule { }