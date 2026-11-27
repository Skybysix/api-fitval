import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

// Lee el .env solo si existe
if (existsSync('.env')) {
  process.loadEnvFile();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  // Aplica la configuración común de la API
  configureApp(app);
  app.useStaticAssets('uploads', { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
