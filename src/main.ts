import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.config';

// Lee el .env solo si existe
if (existsSync('.env')) {
  process.loadEnvFile();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplica la configuración común de la API
  configureApp(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();