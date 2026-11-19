import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Plan, PlanRow, toPlan } from './plan';

@Injectable()
export class PlansService {
  // Inyectamos la conexión con PostgreSQL.
  constructor(private readonly pool: Pool) {}

  // GET /api/plans: devuelve los planes ordenados del más barato al más caro.
  async findAll(): Promise<Plan[]> {
    const result = await this.pool.query<PlanRow>(
      'SELECT id, name, monthly_price FROM plans ORDER BY monthly_price',
    );

    // Convertimos cada fila de PostgreSQL al formato de nuestra API.
    return result.rows.map(toPlan);
  }
}
