import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request from 'supertest';
import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';
import type { Server } from 'node:http';

// Tipo de la respuesta del login
type LoginResponse = {
  accessToken: string;
};

// Tipo de la respuesta paginada de clases
type ClassesPageResponse = {
  data: unknown[];
};

describe('API de FitVal', () => {
  let app: INestApplication;
  let server: Server;
  let memberToken: string;

  // Antes de todos los tests: arrancamos la API entera
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app); // La misma configuración que main.ts
    await app.init();

    server = app.getHttpServer() as Server;

    // Correo distinto en cada ejecución
    const email = `test-${Date.now()}@fitval.com`;
    const password = 'TestPassword123!';

    // Registramos un socio
    await request(server)
      .post('/api/v1/auth/register')
      .send({ email, password });

    // Iniciamos sesión con el socio recién registrado
    const loginResponse = await request(server)
      .post('/api/v1/auth/login')
      .send({ email, password });

    // Guardamos el token para utilizarlo en los tests
    const loginBody = loginResponse.body as LoginResponse;
    memberToken = loginBody.accessToken;
  });

  // Después de todos: cerramos PostgreSQL y la API
  afterAll(async () => {
    await app.get(Pool).end();
    await app.close();
  });

  it('GET /api/v1/health responde 200', async () => {
    const response = await request(server).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'fitval' });
  });

  it('GET /api/v1/classes responde 200 y devuelve un array', async () => {
    const response = await request(server).get('/api/v1/classes');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/v1/classes/abc responde 400', async () => {
    const response = await request(server).get('/api/v1/classes/abc');

    expect(response.status).toBe(400);
  });

  it('GET /api/v1/classes/999999 responde 404 con el formato nuevo', async () => {
    const response = await request(server).get('/api/v1/classes/999999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('path', '/api/v1/classes/999999');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('Las respuestas no incluyen la cabecera x-powered-by', async () => {
    const response = await request(server).get('/api/v1/health');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('POST /api/v1/classes sin token responde 401', async () => {
    const response = await request(server).post('/api/v1/classes').send({});

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/auth/login con contraseña incorrecta responde 401', async () => {
    const response = await request(server).post('/api/v1/auth/login').send({
      email: 'test@fitval.com',
      password: 'contraseña-incorrecta',
    });

    expect(response.status).toBe(401);
  });

  it('POST /api/v1/classes con token de socio responde 403', async () => {
    const response = await request(server)
      .post('/api/v1/classes')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({});

    expect(response.status).toBe(403);
  });

  it('GET /api/v2/classes?page=1&limit=3 devuelve 3 clases', async () => {
    const response = await request(server).get(
      '/api/v2/classes?page=1&limit=3',
    );

    expect(response.status).toBe(200);

    const body = response.body as ClassesPageResponse;
    expect(body.data).toHaveLength(3);
  });

  it('GET /api/v2/classes?limit=100 responde 400', async () => {
    const response = await request(server).get('/api/v2/classes?limit=100');

    expect(response.status).toBe(400);
  });
});
