import { TrainerRow, toTrainer } from './trainer';

describe('toTrainer', () => {
  it('junta las filas de un monitor con sus especialidades', () => {
    // 1. Preparar: dos filas del JOIN para Carla
    const rows: TrainerRow[] = [
      {
        id: 1,
        name: 'Carla Navarro',
        email: 'carla@example.com',
        specialty: 'Ciclo indoor',
      },
      {
        id: 1,
        name: 'Carla Navarro',
        email: 'carla@example.com',
        specialty: 'Fuerza',
      },
    ];

    // 2. Ejecutar
    const trainer = toTrainer(rows);

    // 3. Comprobar el resultado
    expect(trainer).toEqual({
      id: 1,
      name: 'Carla Navarro',
      email: 'carla@example.com',
      specialties: ['Ciclo indoor', 'Fuerza'],
    });
  });
});
