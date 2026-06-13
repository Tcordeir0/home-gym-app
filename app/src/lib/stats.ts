// Pontos, nível e estatísticas — portado do v1.
import type { AppState } from '../store/types';
import { waterGoal, targetsFor } from './diet';

export type StatsInput = Pick<AppState, 'users' | 'history' | 'scores' | 'measures' | 'daily'>;

export function totalPoints(state: Pick<AppState, 'scores'>, uid: string): number {
  const s = state.scores[uid];
  if (!s || !s.byDay) return 0;
  return Object.keys(s.byDay).reduce((a, k) => a + s.byDay[k], 0);
}

/** 1RM estimado (fórmula de Epley). Acima de ~12 reps perde precisão, mas serve de guia. */
export function e1RM(kg: number, reps: number): number {
  if (kg <= 0) return 0;
  if (reps <= 1) return kg;
  return Math.round(kg * (1 + reps / 30));
}

export function xpForLevel(L: number): number {
  return 100 * (L - 1) + 25 * (L - 1) * (L - 2); // L1:0 L2:100 L3:250 L4:450 L5:700 L6:1000
}
export function levelFor(pts: number): number {
  let L = 1;
  while (xpForLevel(L + 1) <= pts) L++;
  return L;
}
export function levelInfo(pts: number) {
  const L = levelFor(pts), cur = xpForLevel(L), next = xpForLevel(L + 1);
  return { level: L, into: pts - cur, span: next - cur, pct: Math.max(0, Math.min(100, Math.round(((pts - cur) / (next - cur)) * 100))) };
}

export interface Stats {
  treinos: number;
  cardios: number;
  activeDays: number;
  streak: number;
  pts: number;
  weighIns: number;
  waterDays: number;
  dietDays: number; // dias com alimento registrado
  proteinDays: number; // dias que bateram a meta de proteína
}

export function statsFor(state: StatsInput, uid: string): Stats {
  const list = state.history[uid] || [];
  const treinos = list.filter((e) => e.w === 'A' || e.w === 'B' || e.w === 'C').length;
  const cardios = list.filter((e) => e.w === 'cardio').length;
  const days: Record<string, boolean> = {};
  list.forEach((e) => { days[e.date] = true; });

  const fu = state.users.find((x) => x.id === uid);
  let streak = 0, fb = (fu && fu.freezes) || 0;
  const cur = new Date();
  for (let i = 0; i < 400; i++) {
    const ds = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0');
    if (days[ds]) { streak++; cur.setDate(cur.getDate() - 1); }
    else if (i === 0) cur.setDate(cur.getDate() - 1); // hoje sem treino não quebra
    else if (fb > 0) { fb--; cur.setDate(cur.getDate() - 1); } // congelador segura uma falta
    else break;
  }

  const weighIns = ((state.measures && state.measures[uid]) || []).filter((m) => typeof m.weight === 'number').length;
  // meta de água pela última pesagem do perfil (não fixo em 2L)
  const marr = (state.measures && state.measures[uid]) || [];
  let lw: number | null = null, lwDate = '';
  marr.forEach((m) => { if (typeof m.weight === 'number' && m.date >= lwDate) { lw = m.weight; lwDate = m.date; } });
  const wgoal = waterGoal(lw);
  const dd = (state.daily && state.daily[uid]) || {};
  let waterDays = 0;
  Object.keys(dd).forEach((date) => { if ((dd[date].waterMl || 0) >= wgoal) waterDays++; });

  // dieta: dias com alimento + dias que bateram a proteína
  const dietTargets = fu ? targetsFor(fu.body, lw) : null;
  let dietDays = 0, proteinDays = 0;
  Object.keys(dd).forEach((date) => {
    const food = dd[date].food || [];
    if (food.length) {
      dietDays++;
      if (dietTargets) {
        const prot = food.reduce((a, it) => a + (it.p * it.g) / 100, 0);
        if (prot >= dietTargets.protein) proteinDays++;
      }
    }
  });

  return { treinos, cardios, activeDays: Object.keys(days).length, streak, pts: totalPoints(state, uid), weighIns, waterDays, dietDays, proteinDays };
}
