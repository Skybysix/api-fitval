import { BadRequestException, NotFoundException, ConflictException, } from '@nestjs/common';
import { Pool } from 'pg';
import { ClassesService } from './classes.service';

// Una fila de clase como la devuelve el JOIN.
// La usaremos en varios tests.
const spinningRow = {
    id: 1,
    activity: 'Spinning',
    room: 'Sala 1',
    starts_at: new Date('2026-11-02T09:00:00Z'),
    spots: 12,
    trainer_name: 'Carla Navarro',
};

describe('ClassesService', () => {
    // Un Pool falso: no habla con PostgreSQL.
    const fakePool = { query: jest.fn() };
    const service = new ClassesService(fakePool as unknown as Pool);

    beforeEach(() => {
        fakePool.query.mockReset();
    });

    it('findOne lanza un 404 si no hay ninguna fila', async () => {
        fakePool.query.mockResolvedValue({ rows: [] });

        await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('findOne devuelve la clase convertida cuando encuentra una fila', async () => {
        fakePool.query.mockResolvedValue({ rows: [spinningRow] });

        const gymClass = await service.findOne(1);

        expect(gymClass.trainerName).toBe('Carla Navarro');
        expect(gymClass.startsAt).toEqual(
            new Date('2026-11-02T09:00:00Z'),
        );
    });

    it('create lanza BadRequestException si el monitor no existe y no hace INSERT', async () => {
        fakePool.query.mockResolvedValue({ rows: [] });

        const dto = {
            activity: 'Spinning',
            room: 'Sala 1',
            startsAt: '2026-11-02T09:00:00Z',
            spots: 12,
            trainerId: 99,
        };

        await expect(service.create(dto)).rejects.toThrow(BadRequestException);

        expect(fakePool.query).toHaveBeenCalledTimes(1);
    });
    it('remove lanza ConflictException si la clase tiene reservas y no la borra', async () => {
        // 1.ª consulta: encuentra la clase
        fakePool.query.mockResolvedValueOnce({ rows: [spinningRow] });

        // 2.ª consulta: el COUNT indica que hay 3 reservas
        fakePool.query.mockResolvedValueOnce({ rows: [{ total: 3 }] });

        await expect(service.remove(1)).rejects.toThrow(ConflictException);

        // Solo se han realizado 2 consultas.
        // La tercera (DELETE) nunca se ejecuta.
        expect(fakePool.query).toHaveBeenCalledTimes(2);
    });
});