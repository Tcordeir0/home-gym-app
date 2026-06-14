// Metas de SHAPE — prioridade (peso) por sub-região muscular (bases vulovix da Anatomia).
// Variam por GÊNERO (m/f) e o BIOTIPO ajusta a estratégia (ecto/meso/endo).
// Peso: 0 = ignora · 1 = baseline (qualquer base não listada) · 2 = importante · 3 = máximo.
// Alimenta: o gap na Anatomia (volume real × meta) e a sugestão de sub-foco no Montar treino.

import type { Sex, Biotype } from '../store/types';

export type { Biotype };

export interface ShapeGoal {
  id: string;
  name: string;
  emoji: string;
  gender: Sex | 'any';
  desc: string;
  weights: Record<string, number>; // base → peso (>1). Bases ausentes = 1.
}

export const SHAPE_GOALS: ShapeGoal[] = [
  // ===== Masculino =====
  {
    id: 'estetico_m', name: 'Estético / praia', emoji: '🏖️', gender: 'm',
    desc: 'Peito inferior + contorno lateral, oblíquos marcados, ombro 3D e braço cheio.',
    weights: {
      'chest-lower': 3, 'chest-upper': 2, 'obliques': 3, 'abs-upper': 2, 'abs-lower': 2,
      'shoulder-side': 3, 'shoulder-front': 2, 'deltoid-rear': 2,
      'triceps-long': 2, 'triceps-lateral': 2, 'biceps': 2, 'lats-mid': 2,
    },
  },
  {
    id: 'vtaper_m', name: 'Costas em V', emoji: '🔻', gender: 'm',
    desc: 'Dorsal largo + ombro lateral + cintura fina (ilusão de V).',
    weights: { 'lats-upper': 3, 'lats-mid': 3, 'traps-mid': 2, 'shoulder-side': 3, 'deltoid-rear': 2, 'biceps': 2, 'obliques': 2 },
  },
  {
    id: 'bracos_m', name: 'Braços & peito', emoji: '💪', gender: 'm',
    desc: 'Volume de bíceps/tríceps e peitoral cheio.',
    weights: { 'biceps': 3, 'triceps-long': 3, 'triceps-lateral': 2, 'forearm-flexors': 2, 'chest-upper': 2, 'chest-lower': 2, 'shoulder-front': 2 },
  },
  {
    id: 'forca_m', name: 'Força', emoji: '🏋️', gender: 'm',
    desc: 'Compostos pesados: peito, costas, perna, lombar e ombro.',
    weights: { 'chest-upper': 2, 'chest-lower': 2, 'lats-mid': 3, 'lower-back-erectors': 2, 'quads': 3, 'hamstrings-lateral': 2, 'hamstrings-medial': 2, 'gluteus-maximus': 2, 'shoulder-front': 2, 'traps-upper': 2 },
  },
  // ===== Feminino =====
  {
    id: 'gluteo_f', name: 'Glúteo & pernas', emoji: '🍑', gender: 'f',
    desc: 'Glúteo redondo, posterior de coxa e pernas firmes.',
    weights: { 'gluteus-maximus': 3, 'gluteus-medius': 3, 'hamstrings-lateral': 2, 'hamstrings-medial': 2, 'quads': 2, 'abs-lower': 2, 'obliques': 2 },
  },
  {
    id: 'definicao_f', name: 'Definição / verão', emoji: '👙', gender: 'f',
    desc: 'Abdômen e oblíquos marcados, glúteo e braço tonificado.',
    weights: { 'abs-upper': 3, 'abs-lower': 3, 'obliques': 3, 'gluteus-maximus': 2, 'gluteus-medius': 2, 'shoulder-side': 2, 'triceps-long': 2, 'triceps-lateral': 2 },
  },
  {
    id: 'postura_f', name: 'Cintura & postura', emoji: '⏳', gender: 'f',
    desc: 'Cintura, costas e ombro pra uma postura elegante (efeito ampulheta).',
    weights: { 'lats-mid': 2, 'lats-upper': 2, 'deltoid-rear': 2, 'traps-lower': 2, 'abs-upper': 2, 'abs-lower': 2, 'obliques': 2, 'gluteus-maximus': 2 },
  },
  {
    id: 'atletico_f', name: 'Atlético / força', emoji: '🏋️‍♀️', gender: 'f',
    desc: 'Corpo forte e funcional: pernas, glúteo, costas e ombro.',
    weights: { 'quads': 3, 'gluteus-maximus': 3, 'hamstrings-lateral': 2, 'hamstrings-medial': 2, 'lats-mid': 2, 'shoulder-front': 2, 'shoulder-side': 2, 'abs-upper': 2 },
  },
  // ===== Ambos =====
  {
    id: 'equilibrio', name: 'Equilíbrio', emoji: '⚖️', gender: 'any',
    desc: 'Tudo parelho — sem priorizar nenhuma parte.', weights: {},
  },
];

export const BIOTYPES: { id: Biotype; name: string; desc: string }[] = [
  { id: 'ecto', name: 'Ectomorfo', desc: 'Magro, dificuldade de ganhar massa → foco em compostos e carga, menos cardio.' },
  { id: 'meso', name: 'Mesomorfo', desc: 'Ganha músculo fácil → treino estético equilibrado funciona bem.' },
  { id: 'endo', name: 'Endomorfo', desc: 'Retém gordura mais fácil → mais volume/abdômen e cardio pra definir.' },
];

/** Metas disponíveis pro gênero do perfil (+ as "any"). */
export function goalsForGender(sex: Sex): ShapeGoal[] {
  return SHAPE_GOALS.filter((g) => g.gender === sex || g.gender === 'any');
}

export function shapeGoalById(id?: string): ShapeGoal | undefined {
  return SHAPE_GOALS.find((g) => g.id === id);
}

/** Default por gênero (estético masc / definição fem). */
export function defaultShape(sex: Sex): string {
  return sex === 'f' ? 'definicao_f' : 'estetico_m';
}

// O biotipo dá um leve empurrão de estratégia (sem reescrever a meta):
// endo reforça abdômen/oblíquos/panturrilha (condicionamento); ecto reforça os grandes (compostos).
const BIOTYPE_NUDGE: Record<Biotype, Record<string, number>> = {
  endo: { 'abs-upper': 1, 'abs-lower': 1, 'obliques': 1, 'calves-gastroc-lateral': 1, 'calves-gastroc-medial': 1 },
  ecto: { 'chest-upper': 1, 'chest-lower': 1, 'lats-mid': 1, 'quads': 1, 'shoulder-front': 1 },
  meso: {},
};

// Sub-focos oferecidos por grupo do gerador (base vulovix → rótulo curto).
export const SUBFOCUS_BY_GROUP: Record<string, { base: string; label: string }[]> = {
  chest: [{ base: 'chest-upper', label: 'Superior' }, { base: 'chest-lower', label: 'Inferior' }],
  back: [{ base: 'lats-upper', label: 'Dorsal sup.' }, { base: 'lats-mid', label: 'Dorsal médio' }, { base: 'traps-upper', label: 'Trapézio' }],
  shoulders: [{ base: 'shoulder-front', label: 'Frontal' }, { base: 'shoulder-side', label: 'Lateral' }, { base: 'deltoid-rear', label: 'Posterior' }],
  arms: [{ base: 'biceps', label: 'Bíceps' }, { base: 'triceps-long', label: 'Tríceps longa' }, { base: 'triceps-lateral', label: 'Tríceps lateral' }, { base: 'forearm-flexors', label: 'Antebraço' }],
  legs: [{ base: 'quads', label: 'Quadríceps' }, { base: 'hamstrings-lateral', label: 'Posterior' }, { base: 'calves-gastroc-lateral', label: 'Panturrilha' }],
  glutes: [{ base: 'gluteus-maximus', label: 'Glúteo máx.' }, { base: 'gluteus-medius', label: 'Glúteo médio' }],
  core: [{ base: 'abs-upper', label: 'Abdômen sup.' }, { base: 'abs-lower', label: 'Abdômen inf.' }, { base: 'obliques', label: 'Oblíquos' }],
};

/** Sub-região sugerida pra um grupo: a de maior peso na meta (+ biotipo). null se não houver. */
export function suggestedSubFocus(group: string, presetId?: string, overrides?: Record<string, number>, biotype?: Biotype): string | null {
  const opts = SUBFOCUS_BY_GROUP[group];
  if (!opts || !opts.length) return null;
  let best = opts[0].base, bestW = -1;
  for (const o of opts) {
    const w = weightFor(o.base, presetId, overrides, biotype);
    if (w > bestW) { bestW = w; best = o.base; }
  }
  return bestW >= 2 ? best : null; // só sugere se a meta realmente prioriza
}

/** Peso final de uma base: preset + ajuste fino (override) + empurrão do biotipo. */
export function weightFor(base: string, presetId?: string, overrides?: Record<string, number>, biotype?: Biotype): number {
  let w: number;
  if (overrides && base in overrides) w = overrides[base];
  else {
    const g = shapeGoalById(presetId);
    const pw = g?.weights[base];
    w = pw == null ? 1 : pw;
  }
  if (biotype && BIOTYPE_NUDGE[biotype]?.[base]) w += BIOTYPE_NUDGE[biotype][base];
  return Math.max(0, Math.min(4, w));
}
