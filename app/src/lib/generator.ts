// Gerador de treino — portado do v1. Gera A/B/C por equipamento + foco.
import { POOL, GROUP_LABEL, EQUIPMENT_OPTIONS, GEN_ROTATION, type PoolItem } from '../data/pool';
import { emphasisOf } from './emphasis';
import { weightFor, SUBFOCUS_BY_GROUP, type Biotype } from '../data/shapeGoals';
import type { Exercise } from '../data/types';
import { weeklyTarget, spacedDays, spacedPairs, focusFrequency } from './volume';

/** Meta de shape do perfil — enviesa cada grupo pra sub-região que a meta prioriza. */
export interface ShapeBias { preset?: string; overrides?: Record<string, number>; biotype?: Biotype; }

// rótulo de equipamento derivado da fonte única (EQUIPMENT_OPTIONS) — sem hardcoded espalhado
const EQUIP_LABEL: Record<string, string> = Object.fromEntries(EQUIPMENT_OPTIONS.map((o) => [o.key, o.label]));

// equipamentos que ADICIONAM carga (kg/resistência). O resto (peso do corpo, banco, barra
// fixa) é "corporal" — nesses o app usa o peso do perfil em vez de pedir kg na mão.
const LOAD_EQUIP = ['dumbbell', 'barbell', 'kettlebell', 'band', 'machine'];
// Palavras de CARGA no nome — pra inferir exercícios FORA do POOL (ex.: da biblioteca, nome em
// inglês). Conservador: "barra fixa"/"pull-up"/"crunches" NÃO batem → tratados como peso do corpo.
const LOAD_WORD = /halter|anilha|kettlebell|m[áa]quina|polia|\bcabo\b|dumbbell|barbell|machine|cable|smith|crossover|com peso|com barra|com disco/i;

/** Exercício é só de peso do corpo? (não dá pra adicionar carga pela lista de equipamento) */
export function isBodyweight(nome: string): boolean {
  const e = POOL.find((p) => p.n === nome);
  if (e) return !e.eq.some((k) => LOAD_EQUIP.includes(k));
  // fora do POOL (ex.: exercício da biblioteca) → infere pelo nome: sem palavra de carga = corporal
  return !LOAD_WORD.test(nome || '');
}

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

const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function generateWorkout(equip: string[], focusKey: string, perDay = 6, days = 3, subFocus?: string | null, shape?: ShapeBias, scientific = false): Record<string, Exercise[]> {
  const pool = eligiblePool(equip);
  const byGroup: Record<string, PoolItem[]> = {};
  GEN_ROTATION.forEach((g) => { byGroup[g] = pool.filter((e) => e.g === g); });
  const used: Record<string, boolean> = {};
  const n = Math.min(WORKOUT_LETTERS.length, Math.max(1, days));

  // SEQUÊNCIA de sub-regiões por grupo: rotaciona TODAS as sub-regiões (bíceps→tríceps→antebraço,
  // abdômen→oblíquos…) pra serem treinadas na semana. A prioridade da meta aparece MAIS (peso vira
  // repetição), mas NUNCA zera as outras — era o bug: foco peito não fazia tríceps nem abdômen.
  function weightedRoundRobin(g: string): string[] {
    const subs = SUBFOCUS_BY_GROUP[g] || [];
    if (!subs.length) return [];
    const items = subs.map((s) => ({
      base: s.base,
      w: Math.max(1, Math.round(shape ? weightFor(s.base, shape.preset, shape.overrides, shape.biotype) : 1)),
    }));
    // sub-foco escolhido à mão pesa mais no grupo em foco
    if (g === focusKey && subFocus) { const it = items.find((i) => i.base === subFocus); if (it) it.w += 2; }
    items.sort((a, b) => b.w - a.w); // prioridade primeiro
    const remaining = items.map((i) => i.w);
    const seq: string[] = [];
    let left = remaining.reduce((a, x) => a + x, 0);
    while (left > 0) {
      for (let i = 0; i < items.length; i++) {
        if (remaining[i] > 0) { seq.push(items[i].base); remaining[i]--; left--; }
      }
    }
    return seq; // ex.: peito-inf×3 + peito-sup×1 → [inf, sup, inf, inf]
  }
  const groupSeq: Record<string, string[]> = {};
  GEN_ROTATION.forEach((g) => { groupSeq[g] = weightedRoundRobin(g); });
  const groupCount: Record<string, number> = {};

  // GAPS da meta: sub-regiões prioritárias (peso ≥ 2) que NÃO são o grupo em foco.
  // Vira 1 acessório garantido por treino (rotacionando), pra o ponto fraco do shape
  // SEMPRE entrar nos A–E — não só quando calha na rotação.
  const gapTargets: { group: string; base: string }[] = [];
  if (shape) {
    const ranked: { group: string; base: string; w: number }[] = [];
    for (const [group, subs] of Object.entries(SUBFOCUS_BY_GROUP)) {
      if (group === focusKey) continue; // o foco já tem volume dedicado
      for (const sdef of subs) {
        const w = weightFor(sdef.base, shape.preset, shape.overrides, shape.biotype);
        if (w >= 2) ranked.push({ group, base: sdef.base, w });
      }
    }
    ranked.sort((a, b) => b.w - a.w);
    ranked.forEach((r) => gapTargets.push({ group: r.group, base: r.base }));
  }

  function pick(g: string, explicitBase?: string | null): PoolItem | undefined {
    // sub-região alvo: a explícita (acessório de gap) OU a próxima da rotação do grupo
    let preferBase = explicitBase ?? null;
    if (!preferBase && groupSeq[g]?.length) {
      preferBase = groupSeq[g][(groupCount[g] || 0) % groupSeq[g].length];
      groupCount[g] = (groupCount[g] || 0) + 1;
    }
    let cand = (byGroup[g] || []).filter((e) => !used[e.n]);
    if (!cand.length) cand = pool.filter((e) => !used[e.n]);
    if (!cand.length) cand = pool;
    if (preferBase) {
      const pref = cand.filter((e) => emphasisOf(e.n)?.bases.includes(preferBase));
      if (pref.length) cand = pref;
    }
    const ex = cand[Math.floor(Math.random() * cand.length)];
    if (ex) used[ex.n] = true;
    return ex;
  }

  // offset gira o início da rotação a cada treino (A,B,C…) pra TODOS os grupos entrarem na
  // semana — sem isso, "Corpo todo" com 6/dia sempre cortava o 7º grupo (core/abdômen).
  function slots(offset: number): string[] {
    const s: string[] = [];
    const foc = focusKey && focusKey !== 'full';
    if (foc) { s.push(focusKey, focusKey); }
    const rot = foc ? GEN_ROTATION.filter((g) => g !== focusKey) : GEN_ROTATION;
    let i = 0;
    while (s.length < perDay) { s.push(rot[(i + offset) % rot.length]); i++; }
    return s;
  }

  const toEx = (e: PoolItem | { n: string; g: string; s: number; r: string; d: string }): Exercise =>
    ({ nome: e.n, musculo: GROUP_LABEL[e.g] || '', series: e.s || 3, reps: e.r, dica: e.d });

  // ---- MODO CIENTÍFICO: distribui por VOLUME-alvo (séries/semana) + RECUPERAÇÃO (≥48h) ----
  // Foco entra em dias ESPAÇADOS (2× em 3–4 dias, 3× em 5) com mais volume; cada outro grupo 2×.
  const sciDayGroups: string[][] = [];
  if (scientific) {
    const foc = !!focusKey && focusKey !== 'full' && GEN_ROTATION.includes(focusKey);
    const dg: string[][] = Array.from({ length: n }, () => []);
    const pairs = spacedPairs(n);
    let pi = 0;
    GEN_ROTATION.forEach((g) => {
      const isF = foc && g === focusKey;
      const dayset: number[] = n <= 2 ? Array.from({ length: n }, (_, i) => i)
        : isF ? spacedDays(n, focusFrequency(n))
        : pairs[pi++ % pairs.length];
      const exTotal = Math.max(dayset.length, Math.round(weeklyTarget(g, isF) / 3)); // ~3 séries/exercício
      for (let i = 0; i < exTotal; i++) dg[dayset[i % dayset.length]].push(g);
    });
    const cap = perDay + (foc ? 2 : 0); // dia de foco fica um pouco maior
    dg.forEach((arr) => {
      arr.sort((a, b) => (a === focusKey ? -1 : 0) - (b === focusKey ? -1 : 0) || GEN_ROTATION.indexOf(a) - GEN_ROTATION.indexOf(b));
      sciDayGroups.push(arr.slice(0, cap));
    });
  }

  const treinos: Record<string, Exercise[]> = {};
  WORKOUT_LETTERS.slice(0, n).forEach((k, wi) => {
    const groupsForDay = scientific && sciDayGroups[wi]?.length ? sciDayGroups[wi] : slots(wi);
    const exs = groupsForDay.map((g) =>
      // cada grupo rotaciona suas sub-regiões (cobre bi/tri, abdômen/oblíquos… na semana)
      toEx(pick(g) || { n: 'Exercício', g, s: 3, r: '12', d: '' }));
    // acessório do GAP da meta — só no modo PADRÃO (no científico o volume já modela a distribuição)
    if (!scientific && gapTargets.length) {
      const gt = gapTargets[wi % gapTargets.length];
      const e = pick(gt.group, gt.base);
      if (e) exs.push(toEx(e));
    }
    treinos[k] = exs;
  });
  return treinos;
}

/** Rótulos padrão pra N treinos (A..E) + aquecimento. */
export function defaultLabels(days: number): Record<string, string> {
  const out: Record<string, string> = { warm: 'Aquec.' };
  WORKOUT_LETTERS.slice(0, Math.min(WORKOUT_LETTERS.length, Math.max(1, days))).forEach((k) => (out[k] = `Treino ${k}`));
  return out;
}
