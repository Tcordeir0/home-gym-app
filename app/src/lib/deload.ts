// Sugestão de DELOAD derivada do histórico — base científica (Renaissance Periodization):
// após ~4-6 semanas acumulando volume, a fadiga supera a recuperação. Uma semana com
// volume ~50% (deload) dissipa a fadiga e destrava o crescimento. Detectamos isso SÓ pelo
// histórico (séries/semana do grupo-motor), sem precisar de input novo do usuário.
import { groupOfExercise } from './recovery';
import { landmark } from './volume';
import { GROUP_LABEL, GEN_ROTATION } from '../data/pool';

interface HistEx { nome: string; sets?: unknown[] }
interface HistEntry { date: string; w?: string; exercises?: HistEx[] }

const toDays = (iso: string): number => Math.floor(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** Séries por grupo em cada "semana atrás" (0 = últimos 7 dias, 1 = 7-13 dias, …). */
export function weeklySetsByGroup(history: HistEntry[], todayISO: string, weeks = 6): Record<string, number>[] {
  const today = toDays(todayISO);
  const buckets: Record<string, number>[] = Array.from({ length: weeks }, () => ({}));
  for (const h of history || []) {
    if (!h || h.w === 'cardio' || !h.date) continue;
    const wi = Math.floor((today - toDays(h.date)) / 7);
    if (wi < 0 || wi >= weeks) continue;
    for (const ex of h.exercises || []) {
      const n = ex?.sets?.length || 0;
      if (!n) continue;
      const g = groupOfExercise(ex.nome);
      if (!g) continue;
      buckets[wi][g] = (buckets[wi][g] || 0) + n;
    }
  }
  return buckets;
}

export interface DeloadSuggestion {
  suggest: boolean;
  group: string | null;   // grupo-motor (mais treinado no bloco)
  label: string;          // rótulo PT
  weeks: number;          // semanas consecutivas de acúmulo detectadas
}

/**
 * Sugere deload se o grupo MAIS treinado vem acumulando volume (≥ MEV) por ≥4 semanas
 * COMPLETAS consecutivas (semanas 1..4 atrás) — um mesociclo típico antes do deload.
 * Não sugere se a semana atual já está leve (provável deload em andamento).
 */
export function deloadSuggestion(history: HistEntry[], todayISO: string): DeloadSuggestion {
  const none: DeloadSuggestion = { suggest: false, group: null, label: '', weeks: 0 };
  const buckets = weeklySetsByGroup(history, todayISO, 6);

  // grupo-motor: o de maior volume somado nas últimas 6 semanas
  const totals: Record<string, number> = {};
  buckets.forEach((b) => GEN_ROTATION.forEach((g) => { totals[g] = (totals[g] || 0) + (b[g] || 0); }));
  let driver: string | null = null;
  let max = 0;
  for (const g of GEN_ROTATION) if ((totals[g] || 0) > max) { max = totals[g]; driver = g; }
  if (!driver || max === 0) return none;

  const mev = landmark(driver).mev;
  // conta semanas COMPLETAS consecutivas (a partir da semana 1 atrás) com volume ≥ MEV
  let streak = 0;
  for (let w = 1; w < 6; w++) {
    if ((buckets[w][driver] || 0) >= mev) streak++;
    else break;
  }
  // não sugere se a semana atual já está leve (< metade do MEV = já está descansando)
  const thisWeek = buckets[0][driver] || 0;
  const alreadyDeloading = thisWeek > 0 && thisWeek < mev / 2;

  return {
    suggest: streak >= 4 && !alreadyDeloading,
    group: driver,
    label: GROUP_LABEL[driver] || driver,
    weeks: streak,
  };
}
