import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StaffGuard } from './staff.guard';

// Simulamos una petición que ya tiene el ID del usuario
const context = {
  switchToHttp: () => ({
    getRequest: () => ({ userId: 1 }),
  }),
} as unknown as ExecutionContext;
describe('StaffGuard', () => {
  // Un UsersService falso: findById responderá lo que nosotros decidamos
  const fakeUsersService = { findById: jest.fn() };

  const guard = new StaffGuard(fakeUsersService as unknown as UsersService);
  it('deja pasar al personal', async () => {
    fakeUsersService.findById.mockResolvedValue({
      id: 1,
      role: 'staff',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
  it('bloquea a los socios', async () => {
    fakeUsersService.findById.mockResolvedValue({
      id: 1,
      role: 'member',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('bloquea si el usuario ya no existe', async () => {
    fakeUsersService.findById.mockResolvedValue(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
