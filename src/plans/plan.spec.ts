import { toPlan } from './plan';

describe('toPlan', () => {
  it('convierte monthly_price de PostgreSQL a número', () => {
    const row = {
      id: 1,
      name: 'Mañanas',
      monthly_price: '29.90',
    };

    const plan = toPlan(row);

    expect(plan.monthlyPrice).toBe(29.9);
  });
});
