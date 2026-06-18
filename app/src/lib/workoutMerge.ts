// Merge de exercícios ao RE-concluir um treino já registrado no mesmo dia
// (ex.: esqueceu um exercício, marcou e concluiu de novo). Em vez de barrar com
// "já registrou", mescla as séries novas no registro existente. Função PURA → testável.
import type { SetEntry } from '../store/types';

export interface WorkoutExercise { nome: string; sets: SetEntry[] }

/**
 * Mescla `incoming` dentro de `existing`:
 * - exercício novo (não estava) → adiciona (o esquecido)
 * - exercício já existente → fica a lista de séries MAIS COMPLETA (mais séries vencem)
 * Não muta os parâmetros.
 */
export function mergeExercises(existing: WorkoutExercise[], incoming: WorkoutExercise[]): WorkoutExercise[] {
  const out: WorkoutExercise[] = existing.map((e) => ({ ...e, sets: [...e.sets] }));
  for (const ne of incoming) {
    const cur = out.find((x) => x.nome === ne.nome);
    if (cur) {
      if (ne.sets.length >= cur.sets.length) cur.sets = [...ne.sets]; // séries mais completas vencem
    } else {
      out.push({ ...ne, sets: [...ne.sets] });
    }
  }
  return out;
}
