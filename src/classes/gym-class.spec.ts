import { GymClassRow, toGymClass } from './gym-class';

describe('toGymClass', () => {
  // Agrupamos los tests de esta función.
  it('convierte una fila de la base de datos en una clase de la API', () => {
    // 1. PREPARAR: una fila como las que devuelve PostgreSQL.
    const row: GymClassRow = {
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      starts_at: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainer_name: 'Carla Navarro',
    };

    // 2. EJECUTAR: llamamos a la función que queremos probar.
    const gymClass = toGymClass(row);

    // 3. COMPROBAR: verificamos que transforma correctamente los campos.
    expect(gymClass).toEqual({
      id: 1,
      activity: 'Spinning',
      room: 'Sala 1',
      startsAt: new Date('2026-11-02T09:00:00Z'),
      spots: 12,
      trainerName: 'Carla Navarro',
    });
  });
  it('no debería devolver los nombres originales de PostgreSQL', () => {
  const row: GymClassRow = {
    id: 1,
    activity: 'Spinning',
    room: 'Sala 1',
    starts_at: new Date('2026-11-02T09:00:00Z'),
    spots: 12,
    trainer_name: 'Carla Navarro',
  };

  const gymClass = toGymClass(row);

  // Comprobamos que no existen las propiedades originales.
  expect(gymClass).not.toHaveProperty('starts_at');
  expect(gymClass).not.toHaveProperty('trainer_name');
});
});