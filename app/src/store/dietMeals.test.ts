import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';
import { deviceId } from '../lib/device';

function seed() {
  const base = useStore.getState();
  useStore.setState({
    ...base,
    users: [{ ...base.users[0], id: 'test-user', name: 'Talys', claimedDevice: deviceId() }],
    active: 'test-user',
    daily: {},
  });
}

const foodOf = (date: string) => useStore.getState().daily['test-user']?.[date]?.food || [];

describe('dieta — refeições + dedup (sem flood)', () => {
  beforeEach(seed);

  it('addFoodOn não cria linha repetida do mesmo item na mesma refeição', () => {
    const s = useStore.getState();
    s.addFoodOn('2026-06-19', { n: 'Ovo', k: 155, p: 13, g: 0, meal: 'cafe' });
    s.addFoodOn('2026-06-19', { n: 'Ovo', k: 155, p: 13, g: 0, meal: 'cafe' }); // repetido
    expect(foodOf('2026-06-19')).toHaveLength(1);
  });

  it('mesmo item em refeição DIFERENTE é permitido (2 linhas)', () => {
    const s = useStore.getState();
    s.addFoodOn('2026-06-19', { n: 'Ovo', k: 155, p: 13, g: 0, meal: 'cafe' });
    s.addFoodOn('2026-06-19', { n: 'Ovo', k: 155, p: 13, g: 0, meal: 'janta' });
    expect(foodOf('2026-06-19')).toHaveLength(2);
  });

  it('"Repetir dia anterior" 2x NÃO floda duplicatas', () => {
    const s = useStore.getState();
    s.addFoodOn('2026-06-18', { n: 'Arroz', k: 130, p: 3, g: 150, meal: 'almoco' });
    s.copyDietFromPrev('2026-06-19'); // copia o dia 18 pro 19
    expect(foodOf('2026-06-19')).toHaveLength(1);
    s.copyDietFromPrev('2026-06-19'); // repetir de novo → não duplica
    expect(foodOf('2026-06-19')).toHaveLength(1);
  });

  it('setFoodMeal muda a refeição de um item', () => {
    const s = useStore.getState();
    s.addFoodOn('2026-06-19', { n: 'Ovo', k: 155, p: 13, g: 100, meal: 'cafe' });
    s.setFoodMeal('2026-06-19', 0, 'janta');
    expect(foodOf('2026-06-19')[0].meal).toBe('janta');
  });
});
