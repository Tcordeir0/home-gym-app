// Gerador de treino — portado do v1. Gera A/B/C por equipamento + foco.
import { POOL, GROUP_LABEL, GEN_ROTATION, type PoolItem } from '../data/pool';
import type { Exercise } from '../data/types';

function eligiblePool(equip: string[]): PoolItem[] {
  const allowed: Record<string, boolean> = { bodyweight: true };
  (equip || []).forEach((k) => { allowed[k] = true; });
  return POOL.filter((e) => e.eq.every((k) => allowed[k]));
}

/** Outras opções com a MESMA ênfase (mesmo grupo) que o exercício, respeitando o
 *  equipamento do perfil — pra trocar uma variação que não serve. */
export function alternativesFor(exNome: string, equip: string[]): Exercise[] {
  const cur = POOL.find((e) => e.n === exNome);
  if (!cur) return [];
  return eligiblePool(equip)
    .filter((e) => e.g === cur.g && e.n !== exNome)
    .map((e) => ({ nome: e.n, musculo: GROUP_LABEL[e.g] || '', series: e.s || 3, reps: e.r, dica: e.d }));
}

export function generateWorkout(equip: string[], focusKey: string, perDay = 6): Record<string, Exercise[]> {
  const pool = eligiblePool(equip);
  const byGroup: Record<string, PoolItem[]> = {};
  GEN_ROTATION.forEach((g) => { byGroup[g] = pool.filter((e) => e.g === g); });
  const used: Record<string, boolean> = {};

  function pick(g: string): PoolItem | undefined {
    let cand = (byGroup[g] || []).filter((e) => !used[e.n]);
    if (!cand.length) cand = pool.filter((e) => !used[e.n]);
    if (!cand.length) cand = pool;
    const ex = cand[Math.floor(Math.random() * cand.length)];
    if (ex) used[ex.n] = true;
    return ex;
  }

  function slots(): string[] {
    const s: string[] = [];
    const foc = focusKey && focusKey !== 'full';
    if (foc) { s.push(focusKey, focusKey); }
    const rot = foc ? GEN_ROTATION.filter((g) => g !== focusKey) : GEN_ROTATION;
    let i = 0;
    while (s.length < perDay) { s.push(rot[i % rot.length]); i++; }
    return s;
  }

  const treinos: Record<string, Exercise[]> = {};
  (['A', 'B', 'C'] as const).forEach((k) => {
    treinos[k] = slots().map((g) => {
      const e = pick(g) || { n: 'Exercício', g, s: 3, r: '12', d: '' };
      return { nome: e.n, musculo: GROUP_LABEL[e.g] || '', series: e.s || 3, reps: e.r, dica: e.d };
    });
  });
  return treinos;
}
