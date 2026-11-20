import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { AuthRequest } from './jwt-payload';

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    // Obtenemos el ID del usuario que AuthGuard ha extraído del token.
    const userId = request.userId;

    // Buscamos al usuario en la base de datos.
    const user = await this.usersService.findById(userId);

    // Si el usuario ya no existe, devolvemos un error 401.
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Si existe, pero no es personal, devolvemos un error 403.
    if (user.role !== 'staff') {
      throw new ForbiddenException('Solo para el personal del gimnasio');
    }

    return true;
  }
}
