
 // Así llega un plan desde PostgreSQL (una fila).
export interface PlanRow {
  id: number;
  name: string;
  monthly_price: string;
}

// Así lo devuelve nuestra API.
export interface Plan {
  id: number;
  name: string;
  monthlyPrice: number;
}

// Convierte una fila de PostgreSQL en un plan de la API.
export function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: Number(row.monthly_price),
  };
}
