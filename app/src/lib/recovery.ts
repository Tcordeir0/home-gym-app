// Prontidão de recuperação por GRUPO muscular — base científica: ~48h pra um grupo
// se recuperar e crescer (síntese proteica). O histórico guarda só a DATA (sem hora),
// então a regra das 48h vira granularidade de dia: treinado há ≥2 dias = recuperado.
import { POOL, GROUP_LABEL, GEN_ROTATION } from '../data/pool';
import { emphasisOf } from './emphasis';

export interface GroupRecovery {
  group: string;            // chave do grupo (chest, back…)
  label: string;            // rótulo PT (Peito, Costas…)
  lastDate: string | null;  // última data treinado (AAAA-MM-DD) ou null = nunca
  daysSince: number | null; // dias desde o último treino do grupo (null = nunca)
  status: 'ready' | 'resting';
}

interface HistEx { nome: string; sets?: unknown[] }
interface HistEntry { date: string; w?: string; exercises?: HistEx[] }

// prefixo da sub-região (emphasis) → grupo, pra exercícios FORA do POOL (biblioteca).
const BASE_GROUP: Record<string, string> = {
  chest: 'chest', serratus: 'core',
  back: 'back', lat: 'back', lats: 'back', trap: 'back', trapezius: 'back', lombar: 'back', rhomboid: 'back',
  shoulder: 'shoulders', delt: 'shoulders',
  biceps: 'arms', triceps: 'arms', forearm: 'arms',
  quad: 'legs', quads: 'legs', hamstring: 'legs', calf: 'legs', calves: 'legs', adductor: 'legs', leg: 'legs',
  glute: 'glutes', glutes: 'glutes',
  abs: 'core', oblique: 'core', obliques: 'core', core: 'core',
};

/** Grupo (1 dos 7) de um exercício: do POOL (fonte primária) ou inferido pela ênfase. */
export function groupOfExercise(nome: string): string | null {
  const p = POOL.find((e) => e.n === nome);
  if (p) return p.g;
  const bases = emphasisOf(nome)?.bases || [];
  for (const b of bases) {
    const g = BASE_GROUP[b.split('-')[0]];
    if (g) return g;
  }
  return null;
}

const toDays = (iso: string): number => Math.floor(Date.parse(iso + 'T00:00:00Z') / 86400000);

/** Recuperação de cada grupo treinável: última data, dias desde, e se está pronto (≥2 dias). */
export function recoveryByGroup(history: HistEntry[], todayISO: string): GroupRecovery[] {
  const today = toDays(todayISO);
  const last: Record<string, string> = {}; // grupo → data mais recente treinada
  for (const h of history || []) {
    if (!h || h.w === 'cardio' || !h.date) continue;
    for (const ex of h.exercises || []) {
      if (!ex?.sets?.length) continue; // só conta se teve série registrada
      const g = groupOfExercise(ex.nome);
      if (!g) continue;
      if (!last[g] || h.date > last[g]) last[g] = h.date;
    }
  }
  return GEN_ROTATION.map((group) => {
    const lastDate = last[group] || null;
    const daysSince = lastDate ? Math.max(0, today - toDays(lastDate)) : null;
    // pronto: nunca treinado (nada a recuperar) OU ≥2 dias (~48h)
    const status: 'ready' | 'resting' = daysSince === null || daysSince >= 2 ? 'ready' : 'resting';
    return { group, label: GROUP_LABEL[group] || group, lastDate, daysSince, status };
  });
}
