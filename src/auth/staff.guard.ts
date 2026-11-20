import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
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

    // Comprobamos que existe y que su rol es staff.
    if (!user || user.role !== 'staff') {
      throw new ForbiddenException('Solo para el personal del gimnasio');
    }

    return true;
  }
}
