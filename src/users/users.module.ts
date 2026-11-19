import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersService } from './users.service';

@Module({
  // Necesitamos el módulo de base de datos para acceder al Pool.
  imports: [DatabaseModule],

  // Registramos el servicio de usuarios.
  providers: [UsersService],

  // Lo exportamos para que AuthModule pueda utilizarlo.
  exports: [UsersService],
})
export class UsersModule {}