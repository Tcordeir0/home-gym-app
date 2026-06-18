import { describe, it, expect } from 'vitest';
import { mergeExercises } from './workoutMerge';

describe('mergeExercises — re-concluir treino (esqueceu um exercício)', () => {
  it('adiciona o exercício esquecido sem mexer nos que já estavam', () => {
    const existing = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }] }];
    const incoming = [{ nome: 'Tríceps testa', sets: [{ kg: 10, reps: 12 }] }];
    const out = mergeExercises(existing, incoming);
    expect(out.map((e) => e.nome).sort()).toEqual(['Supino', 'Tríceps testa']);
    expect(out.find((e) => e.nome === 'Supino')!.sets).toHaveLength(1);
  });

  it('mesmo exercício: fica a lista de séries MAIS completa', () => {
    const existing = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }] }];
    const incoming = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }, { kg: 20, reps: 9 }, { kg: 20, reps: 8 }] }];
    const out = mergeExercises(existing, incoming);
    expect(out).toHaveLength(1);
    expect(out[0].sets).toHaveLength(3);
  });

  it('não substitui por uma lista MENOR', () => {
    const existing = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }, { kg: 20, reps: 9 }] }];
    const incoming = [{ nome: 'Supino', sets: [{ kg: 30, reps: 5 }] }];
    const out = mergeExercises(existing, incoming);
    expect(out[0].sets).toHaveLength(2); // mantém a maior
    expect(out[0].sets[0].kg).toBe(20);
  });

  it('preserva o rir das séries', () => {
    const existing: { nome: string; sets: { kg?: number | null; reps?: number | null; rir?: number }[] }[] = [];
    const incoming = [{ nome: 'Rosca', sets: [{ kg: 12, reps: 10, rir: 2 }] }];
    const out = mergeExercises(existing, incoming);
    expect(out[0].sets[0].rir).toBe(2);
  });

  it('não muta os parâmetros', () => {
    const existing = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }] }];
    const incoming = [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }, { kg: 20, reps: 8 }] }];
    mergeExercises(existing, incoming);
    expect(existing[0].sets).toHaveLength(1); // intacto
  });
});
