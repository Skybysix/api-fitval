import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { toTrainer, type TrainerRow } from './trainer';

@Injectable()
export class TrainersService {
  constructor(private readonly pool: Pool) {}

  // GET /api/v1/trainers/:id
  // Busca un monitor y reúne sus especialidades.
  async findOne(id: number) {
    const result = await this.pool.query<TrainerRow>(
      `SELECT
      t.id,
      t.name,
      t.email,
      s.name AS specialty
    FROM trainers t
    JOIN trainer_specialties ts ON ts.trainer_id = t.id
    JOIN specialties s ON s.id = ts.specialty_id
    WHERE t.id = $1
    ORDER BY s.id`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Trainer not found');
    }

    return toTrainer(result.rows);
  }

  // POST /api/v1/trainers
  // Crea un monitor y relaciona sus especialidades en una transacción.
  async create(dto: CreateTrainerDto) {
    // Obtenemos una conexión exclusiva para la transacción.
    const client = await this.pool.connect();

    try {
      // 1. Comenzamos la transacción.
      await client.query('BEGIN');

      // 2. Insertamos el monitor.
      const trainerResult = await client.query<{ id: number }>(
        `INSERT INTO trainers (dni, name, email)
       VALUES ($1, $2, $3)
       RETURNING id`,
        [dto.dni, dto.name, dto.email],
      );

      const trainerId = trainerResult.rows[0].id;

      // 3. Comprobamos cada especialidad y creamos su relación.
      for (const specialtyId of dto.specialtyIds) {
        const specialtyResult = await client.query(
          'SELECT id FROM specialties WHERE id = $1',
          [specialtyId],
        );

        if (specialtyResult.rows.length === 0) {
          throw new BadRequestException(
            `No existe la especialidad ${specialtyId}`,
          );
        }

        await client.query(
          `INSERT INTO trainer_specialties (trainer_id, specialty_id)
         VALUES ($1, $2)`,
          [trainerId, specialtyId],
        );
      }

      // 4. Confirmamos todos los cambios.
      await client.query('COMMIT');

      // Devolvemos el monitor con sus especialidades.
      return this.findOne(trainerId);
    } catch (error) {
      // Si algo falla, deshacemos todos los cambios.
      await client.query('ROLLBACK');

      // 5. Si el DNI o el email están repetidos, devolvemos un 409.
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? (error as { code?: unknown }).code
          : undefined;

      if (errorCode === '23505') {
        throw new ConflictException('El DNI o el email ya están registrados');
      }

      throw error;
    } finally {
      // 6. Liberamos la conexión.
      client.release();
    }
  }
}
