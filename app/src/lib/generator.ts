// Gerador de treino — portado do v1. Gera A/B/C por equipamento + foco.
import { POOL, GROUP_LABEL, EQUIPMENT_OPTIONS, GEN_ROTATION, type PoolItem } from '../data/pool';
import type { Exercise } from '../data/types';

// rótulo de equipamento derivado da fonte única (EQUIPMENT_OPTIONS) — sem hardcoded espalhado
const EQUIP_LABEL: Record<string, string> = Object.fromEntries(EQUIPMENT_OPTIONS.map((o) => [o.key, o.label]));

/** Alternativa de exercício: além do Exercise, diz o equipamento e se o perfil já o tem. */
export interface Alt extends Exercise { equipKey: string; equipLabel: string; owned: boolean; }

function ownedSet(equip: string[]): Record<string, boolean> {
  const allowed: Record<string, boolean> = { bodyweight: true };
  (equip || []).forEach((k) => { allowed[k] = true; });
  return allowed;
}

function eligiblePool(equip: string[]): PoolItem[] {
  const allowed = ownedSet(equip);
  return POOL.filter((e) => e.eq.every((k) => allowed[k]));
}

/** Outras opções com a MESMA ênfase (mesmo grupo) que o exercício. Inclui também
 *  variações de OUTRO equipamento (ex.: flexão → supino com halteres), com as que o
 *  perfil já consegue fazer no topo e as demais marcadas pelo equipamento que pedem. */
export function alternativesFor(exNome: string, equip: string[]): Alt[] {
  const cur = POOL.find((e) => e.n === exNome);
  if (!cur) return [];
  const allowed = ownedSet(equip);
  return POOL
    .filter((e) => e.g === cur.g && e.n !== exNome)
    .map((e) => {
      const key = e.eq.find((k) => k !== 'bodyweight') || 'bodyweight';
      return {
        nome: e.n, musculo: GROUP_LABEL[e.g] || '', series: e.s || 3, reps: e.r, dica: e.d,
        equipKey: key, equipLabel: EQUIP_LABEL[key] || key, owned: e.eq.every((k) => allowed[k]),
      };
    })
    .sort((a, b) => Number(b.owned) - Number(a.owned)); // primeiro as que dá pra fazer já
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
