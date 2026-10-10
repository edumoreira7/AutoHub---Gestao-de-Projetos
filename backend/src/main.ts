import { NestFactory } from '@nestjs/core';
import dns from 'node:dns';
import { AppModule } from './app.module.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const isLocalDevOrigin = origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (!origin || (allowedOrigins ? allowedOrigins.includes(origin) : isLocalDevOrigin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origem não permitida pelo CORS'));
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
