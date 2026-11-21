import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { GymClass, GymClassRow, toGymClass } from './gym-class';
import { CreateClassDto } from './dto/create-class.dto';
import { ListClassesQueryDto } from './dto/find-classes-query.dto';

// Estructura de la respuesta paginada de clases
type GymClassPage = {
  data: GymClass[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Relaciona los campos de la API con las columnas de PostgreSQL
const SORT_COLUMNS = {
  startsAt: 'c.starts_at',
  activity: 'c.activity',
  spots: 'c.spots',
};

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

  // GET /api/v2/classes: devuelve las clases paginadas.
  async findPage(queryDto: ListClassesQueryDto): Promise<GymClassPage> {
    const { page, limit, sort, order, activity } = queryDto;

    // Calculamos desde qué registro empezar.
    const offset = (page - 1) * limit;

    // Obtenemos la columna SQL correspondiente al campo elegido.
    const sortColumn = SORT_COLUMNS[sort];

    // Construimos el filtro por actividad.
    let where = '';
    const values: string[] = [];

    if (activity) {
      where = ` WHERE c.activity ILIKE '%' || $1 || '%'`;
      values.push(activity);
    }

    // Consultamos las clases de la página solicitada.
    const dataResult = await this.pool.query<GymClassRow>(
      `${this.baseQuery}${where}
     ORDER BY ${sortColumn} ${order.toUpperCase()}, c.id
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
      [...values, limit, offset],
    );

    // Contamos el total de clases que cumplen el filtro.
    const countResult = await this.pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM classes c${where}`,
      values,
    );

    const total = countResult.rows[0].total;

    // Devolvemos los datos y la información de paginación.
    return {
      data: dataResult.rows.map(toGymClass),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  // POST /api/classes: crea una nueva clase.
  async create(dto: CreateClassDto): Promise<GymClass> {
    // 1. Comprobamos que existe el monitor.
    const trainer = await this.pool.query(
      'SELECT id FROM trainers WHERE id = $1',
      [dto.trainerId],
    );

    // Si no existe, devolvemos un error 400.
    if (trainer.rows.length === 0) {
      throw new BadRequestException(
        'No existe ningún monitor con ese trainerId',
      );
    }

    // 2. Insertamos la nueva clase en la base de datos.
    const result = await this.pool.query<{ id: number }>(
      `INSERT INTO classes (activity, room, starts_at, spots, trainer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [dto.activity, dto.room, dto.startsAt, dto.spots, dto.trainerId],
    );

    // 3. Recuperamos la clase creada con el nombre de su monitor.
    return this.findOne(result.rows[0].id);
  }

  // DELETE /api/classes/:id: elimina una clase.
  async remove(id: number): Promise<GymClass> {
    // 1. Comprobamos que la clase existe.
    const gymClass = await this.findOne(id);

    // 2. Comprobamos si tiene reservas asociadas.
    const bookings = await this.pool.query<{ total: number }>(
      'SELECT COUNT(*)::int AS total FROM bookings WHERE class_id = $1',
      [id],
    );

    // Si tiene reservas, no permitimos eliminarla.
    if (bookings.rows[0].total > 0) {
      throw new ConflictException(
        'No se puede eliminar una clase que tiene reservas',
      );
    }

    // 3. Eliminamos la clase.
    await this.pool.query('DELETE FROM classes WHERE id = $1', [id]);

    // 4. Devolvemos los datos de la clase eliminada.
    return gymClass;
  }
}
