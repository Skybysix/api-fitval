import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthRequest, JwtPayload } from './jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtenemos la petición HTTP.
    const request = context.switchToHttp().getRequest<AuthRequest>();

    // Extraemos el token de la cabecera Authorization.
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    // Comprobamos que exista y que sea de tipo Bearer.
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token');
    }

    let payload: JwtPayload;

    try {
      // Verificamos que el token sea válido.
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token no válido o caducado');
    }

    // Guardamos el id del usuario en la petición.
    request.userId = payload.sub;

    return true;
  }
}
