import type { Request } from 'express';

// Lo único que guardamos dentro del token: el id del usuario.
export interface JwtPayload {
  sub: number;
}

// Una petición que ya ha pasado por AuthGuard.
// Lleva el id del usuario autenticado.
export interface AuthRequest extends Request {
  userId: number;
}
