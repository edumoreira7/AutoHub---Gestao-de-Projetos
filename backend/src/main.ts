import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import dns from 'node:dns';
import { AppModule } from './app.module.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.DATA_MODE === 'local') {
    Logger.log('Usando armazenamento local em arquivos JSON.', 'AutoHub');
  }
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
