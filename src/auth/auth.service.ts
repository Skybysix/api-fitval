import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Registra un usuario nuevo.
  async register(dto: RegisterDto) {
    // Comprobamos si ya existe un usuario con ese correo.
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Ese correo ya está registrado');
    }

    // Generamos el hash de la contraseña.
    const passwordHash = await argon2.hash(dto.password);

    // Guardamos el usuario con su contraseña hasheada.
    const user = await this.usersService.create(
      dto.email,
      passwordHash,
    );

    // Devolvemos únicamente los datos públicos.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // Inicia sesión con el correo y la contraseña.
  async login(dto: LoginDto) {
    // Buscamos el usuario por su correo.
    const user = await this.usersService.findByEmail(dto.email);

    // Comprobamos que exista y que la contraseña sea correcta.
    if (!user || !(await argon2.verify(user.password_hash, dto.password))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // El payload contiene únicamente el id del usuario.
    const payload: JwtPayload = { sub: user.id };

    // Firmamos el token JWT.
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
