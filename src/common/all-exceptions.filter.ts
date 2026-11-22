import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger,} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch() sin nada dentro = atrapa TODOS los errores
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errors');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // ¿Es un error conocido (404, 400, 409...)?
    // Si no, es un 500
    const isHttp = exception instanceof HttpException;

    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Mensaje del error o uno genérico para el 500
    let message: string | string[] = 'Error interno del servidor';

    if (isHttp) {
      const body = exception.getResponse();

      message =
        typeof body === 'string'
          ? body
          : (body as { message: string | string[] }).message;
    }

    // Los errores 500 se registran en la consola
    // La traza nunca se envía al cliente
    if (statusCode === 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Todos los errores tienen la misma estructura
    response.status(statusCode).json({
      statusCode,
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}