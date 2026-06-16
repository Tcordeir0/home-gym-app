import { describe, it, expect } from 'vitest';
import { statsFor, type StatsInput } from './stats';
import type { HistoryEntry } from '../store/types';

const baseUser = {
  id: 'u1', name: 'T',
  body: { height: null, age: null, sex: 'm', neck: null, hip: null, activity: 1.55, goal: 'lose' },
} as StatsInput['users'][number];
function input(history: HistoryEntry[]): StatsInput {
  return { users: [baseUser], history: { u1: history }, scores: {}, measures: {}, daily: {} };
}

describe('statsFor — contagem de treinos cobre A–E (não só A/B/C)', () => {
  it('conta Treino D e E como treino', () => {
    const hist: HistoryEntry[] = [
      { date: '2026-06-10', w: 'A', exercises: [] },
      { date: '2026-06-11', w: 'D', exercises: [] },
      { date: '2026-06-12', w: 'E', exercises: [] },
      { date: '2026-06-13', w: 'cardio' },
    ];
    const s = statsFor(input(hist), 'u1');
    expect(s.treinos).toBe(3); // A + D + E (cardio não conta)
    expect(s.cardios).toBe(1);
  });

  it('só cardio → zero treinos', () => {
    const s = statsFor(input([{ date: '2026-06-10', w: 'cardio' }]), 'u1');
    expect(s.treinos).toBe(0);
  });
});
