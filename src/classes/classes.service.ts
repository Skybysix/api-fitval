
import { Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { GymClass, GymClassRow, toGymClass } from './gym-class';

@Injectable()
export class ClassesService {
  // Inyectamos la conexión con PostgreSQL.
  constructor(private readonly pool: Pool) {}

  // Consulta SQL común para obtener las clases y el nombre de su monitor.
  private readonly baseQuery = `
    SELECT
      c.id,
      c.activity,
      c.room,
      c.starts_at,
      c.spots,
      t.name AS trainer_name
    FROM classes c
    JOIN trainers t ON t.id = c.trainer_id
  `;

  // GET /api/classes: devuelve todas las clases ordenadas por fecha.
  async findAll(activity?: string): Promise<GymClass[]> {
    let query = this.baseQuery;
    const values: string[] = [];

    // Si recibimos una actividad, filtramos sin distinguir mayúsculas.
    if (activity) {
      query += ` WHERE c.activity ILIKE '%' || $1 || '%'`;
      values.push(activity);
    }

    query += ' ORDER BY c.starts_at';

    const result = await this.pool.query<GymClassRow>(query, values);

    return result.rows.map(toGymClass);
  }

  // GET /api/classes/:id: devuelve una clase concreta.
  async findOne(id: number): Promise<GymClass> {
    const result = await this.pool.query<GymClassRow>(
      `${this.baseQuery} WHERE c.id = $1`,
      [id],
    );

    // Si no existe ninguna clase con ese ID, devolvemos un 404.
    if (result.rows.length === 0) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return toGymClass(result.rows[0]);
  }
}
