// Una fila tal como llega desde el JOIN de PostgreSQL
export interface TrainerRow {
  id: number;
  name: string;
  email: string;
  specialty: string;
}

// El monitor que queremos devolver desde nuestra API
export interface Trainer {
  id: number;
  name: string;
  email: string;
  specialties: string[];
}

// Convierte varias filas del JOIN en un único monitor
export function toTrainer(rows: TrainerRow[]): Trainer {
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    specialties: rows.map((row) => row.specialty),
  };
}
