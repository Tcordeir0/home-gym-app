import { describe, it, expect } from 'vitest';
import { recoveryByGroup, groupOfExercise } from './recovery';

describe('groupOfExercise', () => {
  it('pega o grupo do POOL', () => {
    expect(groupOfExercise('Flexão (push-up)')).toBe('chest');
    expect(groupOfExercise('Agachamento livre')).toBe('legs');
    expect(groupOfExercise('Prancha')).toBe('core');
  });
  it('fora do POOL, infere pela ênfase (prefixo da base)', () => {
    // "Supino inclinado" não está no POOL mas a ênfase dá chest-upper → chest
    expect(groupOfExercise('Supino inclinado com halteres')).toBe('chest');
  });
  it('desconhecido → null', () => {
    expect(groupOfExercise('Exercício alienígena xyz')).toBeNull();
  });
});

describe('recoveryByGroup', () => {
  const mk = (date: string, w: string, nomes: string[]) => ({
    date, w, exercises: nomes.map((n) => ({ nome: n, sets: [{ kg: 10, reps: 10 }] })),
  });

  it('treinado hoje → descansando (0 dias)', () => {
    const r = recoveryByGroup([mk('2026-06-18', 'A', ['Flexão (push-up)'])], '2026-06-18');
    const chest = r.find((g) => g.group === 'chest')!;
    expect(chest.daysSince).toBe(0);
    expect(chest.status).toBe('resting');
  });

  it('treinado há 1 dia → ainda descansando (<48h)', () => {
    const r = recoveryByGroup([mk('2026-06-17', 'A', ['Flexão (push-up)'])], '2026-06-18');
    expect(r.find((g) => g.group === 'chest')!.status).toBe('resting');
  });

  it('treinado há 2 dias → pronto (~48h)', () => {
    const r = recoveryByGroup([mk('2026-06-16', 'A', ['Flexão (push-up)'])], '2026-06-18');
    const chest = r.find((g) => g.group === 'chest')!;
    expect(chest.daysSince).toBe(2);
    expect(chest.status).toBe('ready');
  });

  it('nunca treinado → pronto (nada a recuperar), daysSince null', () => {
    const r = recoveryByGroup([], '2026-06-18');
    const legs = r.find((g) => g.group === 'legs')!;
    expect(legs.daysSince).toBeNull();
    expect(legs.status).toBe('ready');
  });

  it('usa a data MAIS RECENTE quando o grupo foi treinado em vários dias', () => {
    const r = recoveryByGroup([
      mk('2026-06-10', 'A', ['Flexão (push-up)']),
      mk('2026-06-17', 'A', ['Supino no chão com halteres']),
    ], '2026-06-18');
    expect(r.find((g) => g.group === 'chest')!.daysSince).toBe(1);
  });

  it('ignora cardio e séries vazias', () => {
    const r = recoveryByGroup([
      { date: '2026-06-18', w: 'cardio', t: 'Corrida' },
      { date: '2026-06-18', w: 'A', exercises: [{ nome: 'Flexão (push-up)', sets: [] }] },
    ] as never, '2026-06-18');
    expect(r.find((g) => g.group === 'chest')!.daysSince).toBeNull();
  });

  it('retorna os 7 grupos', () => {
    const r = recoveryByGroup([], '2026-06-18');
    expect(r.map((g) => g.group).sort()).toEqual(['arms', 'back', 'chest', 'core', 'glutes', 'legs', 'shoulders']);
  });
});
