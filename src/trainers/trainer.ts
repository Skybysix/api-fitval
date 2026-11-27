// Una fila tal como llega desde el JOIN de PostgreSQL
export interface TrainerRow {
  id: number;
  name: string;
  email: string;
  specialty: string;
  photo_url: string | null;
}

// El monitor que queremos devolver desde nuestra API
export interface Trainer {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  specialties: string[];
}

// Convierte varias filas del JOIN en un único monitor
export function toTrainer(rows: TrainerRow[]): Trainer {
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
    photoUrl: rows[0].photo_url,
    specialties: rows.map((row) => row.specialty),
  };
}
