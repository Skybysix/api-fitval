import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { User } from './user';

@Injectable()
export class UsersService {
  // Inyectamos el Pool de PostgreSQL.
  constructor(private readonly pool: Pool) {}

  // Busca un usuario por su correo.
  // Devuelve undefined si no existe.
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email],
    );

    return result.rows[0];
  }

  // Busca un usuario por su id.
  // Devuelve undefined si no existe.
  async findById(id: number): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      'SELECT id, email, password_hash, role FROM users WHERE id = $1',
      [id],
    );

    return result.rows[0];
  }

  // Guarda un usuario nuevo utilizando el hash de su contraseña.
  async create(email: string, passwordHash: string): Promise<User> {
    const result = await this.pool.query<User>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash, role`,
      [email, passwordHash],
    );

    // INSERT ... RETURNING devuelve la fila que acabamos de crear.
    return result.rows[0];
  }
}
