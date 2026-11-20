import { INestApplication, ValidationPipe } from '@nestjs/common';

// Configuración común de la aplicación
export function configureApp(app: INestApplication) {
  // Todas las rutas empiezan por /api
  app.setGlobalPrefix('api');

  // Validación global de los datos que recibe la API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}