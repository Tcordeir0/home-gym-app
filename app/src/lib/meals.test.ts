import { describe, it, expect } from 'vitest';
import { mealByHour, groupByMeal, sameItemIndex } from './meals';
import type { FoodItem } from '../store/types';

const f = (n: string, meal?: FoodItem['meal'], g = 100): FoodItem => ({ n, k: 100, p: 10, g, meal });

describe('mealByHour', () => {
  it('sugere a refeição pela hora', () => {
    expect(mealByHour(8)).toBe('cafe');
    expect(mealByHour(12)).toBe('almoco');
    expect(mealByHour(16)).toBe('lanche');
    expect(mealByHour(21)).toBe('janta');
    expect(mealByHour(0)).toBe('cafe');
  });
});

describe('groupByMeal', () => {
  it('agrupa na ordem das refeições + "Sem refeição" no fim', () => {
    const food = [f('Ovo', 'cafe'), f('Arroz', 'almoco'), f('Pão'), f('Iogurte', 'lanche')];
    const g = groupByMeal(food);
    expect(g.map((x) => x.key)).toEqual(['cafe', 'almoco', 'lanche', 'outros']);
  });

  it('preserva o índice ORIGINAL de cada item (pra editar/remover não quebrar)', () => {
    const food = [f('Ovo', 'cafe'), f('Arroz', 'almoco'), f('Banana', 'cafe')];
    const g = groupByMeal(food);
    const cafe = g.find((x) => x.key === 'cafe')!;
    expect(cafe.items.map((it) => it.idx)).toEqual([0, 2]); // Ovo=0, Banana=2
    expect(cafe.items.map((it) => it.item.n)).toEqual(['Ovo', 'Banana']);
  });

  it('só retorna grupos não-vazios', () => {
    const g = groupByMeal([f('Ovo', 'cafe')]);
    expect(g).toHaveLength(1);
    expect(g[0].key).toBe('cafe');
  });

  it('item sem meal cai em "outros"', () => {
    const g = groupByMeal([f('Pão')]);
    expect(g[0].key).toBe('outros');
    expect(g[0].label).toBe('Sem refeição');
  });
});

describe('sameItemIndex (dedup — sem flood ao repetir)', () => {
  it('acha item igual na MESMA refeição', () => {
    const food = [f('Ovo', 'cafe'), f('Arroz', 'almoco')];
    expect(sameItemIndex(food, 'Ovo', 'cafe')).toBe(0);
  });
  it('mesmo nome em refeição DIFERENTE não conta como repetido', () => {
    const food = [f('Ovo', 'cafe')];
    expect(sameItemIndex(food, 'Ovo', 'janta')).toBe(-1);
  });
  it('retorna -1 quando não há repetido', () => {
    expect(sameItemIndex([f('Ovo', 'cafe')], 'Frango', 'almoco')).toBe(-1);
  });
});
