// Volume landmarks (séries/semana por GRUPO muscular) — base científica do gerador inteligente.
// MEV = mínimo efetivo · MAV = faixa onde mais cresce (alvo) · MRV = teto recuperável.
// Referência: Renaissance Periodization (Dr. Mike Israetel). Valores por grupo do gerador.

export interface Landmark { mev: number; mav: [number, number]; mrv: number }

export const LANDMARKS: Record<string, Landmark> = {
  chest:     { mev: 10, mav: [12, 20], mrv: 22 },
  back:      { mev: 10, mav: [14, 22], mrv: 25 },
  legs:      { mev: 8,  mav: [12, 18], mrv: 20 },
  glutes:    { mev: 4,  mav: [8, 16],  mrv: 18 },
  shoulders: { mev: 8,  mav: [16, 22], mrv: 26 },
  arms:      { mev: 6,  mav: [10, 16], mrv: 18 },
  core:      { mev: 0,  mav: [12, 20], mrv: 25 },
};
const DEFAULT_LM: Landmark = { mev: 8, mav: [12, 18], mrv: 20 };

export function landmark(group: string): Landmark {
  return LANDMARKS[group] || DEFAULT_LM;
}

/** Séries-alvo na SEMANA pro grupo: foco mira o TOPO do MAV (cresce mais), o resto o MEIO do MAV. */
export function weeklyTarget(group: string, isFocus: boolean): number {
  const L = landmark(group);
  return isFocus ? L.mav[1] : Math.round((L.mav[0] + L.mav[1]) / 2);
}

/** Classifica o volume semanal vs as faixas (pra barra na Anatomia). */
export function classifyVolume(group: string, sets: number): 'below' | 'on' | 'above' {
  const L = landmark(group);
  if (sets < L.mev) return 'below'; // 🟡 abaixo do mínimo
  if (sets > L.mrv) return 'above'; // 🔴 acima do recuperável
  return 'on'; // 🟢 produtivo (MEV..MRV)
}

/** k dias entre n, o MAIS espaçados possível (evita dias consecutivos → respeita ~48h). 0-based.
 *  Frequência de FOCO recomendada: 3× só com 5 dias; 2× com 3–4 dias (sempre não-consecutivo). */
export function spacedDays(n: number, k: number): number[] {
  const days = Math.max(1, n);
  const want = Math.max(1, Math.min(k, days));
  if (want === 1) return [0];
  const out: number[] = [];
  for (let i = 0; i < want; i++) out.push(Math.round((i * (days - 1)) / (want - 1)));
  return [...new Set(out)];
}

/** Frequência de foco que mantém o espaçamento: 3× com ≥5 dias, senão 2×. */
export function focusFrequency(n: number): number {
  return n >= 5 ? 3 : Math.min(2, n);
}

/** Pares de dias (2 sessões/semana) com folga: gap ≥2 quando dá (n≥4), senão ≥1.
 *  Cicla por grupo pra distribuir os músculos pelos dias sem amontoar. */
export function spacedPairs(n: number): [number, number][] {
  const minGap = n >= 4 ? 2 : 1;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i + minGap; j < n; j++) out.push([i, j]);
  return out.length ? out : [[0, Math.min(1, Math.max(0, n - 1))]];
}
