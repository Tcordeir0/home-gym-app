// Roleta de prêmios — ganha pontos ou congeladores. 1 giro a cada 100 pts.
export interface Prize {
  id: string;
  label: string;
  emoji: string;
  kind: 'pts' | 'freeze' | 'theme' | 'deco' | 'frame';
  value: number;
  weight: number;
}

// Pesos: itens (tema/cosmético/aro) têm MUITO mais chance que pontos —
// os pontos ajudam pouco e o que diverte é desbloquear coisa nova.
export const PRIZES: Prize[] = [
  { id: 'theme', label: 'Tema novo!', emoji: '🎨', kind: 'theme', value: 0, weight: 24 },
  { id: 'frame', label: 'Aro novo!', emoji: '⭕', kind: 'frame', value: 0, weight: 24 },
  { id: 'deco', label: 'Decoração!', emoji: '✨', kind: 'deco', value: 0, weight: 22 },
  { id: 'p10', label: '+10 pts', emoji: '⭐', kind: 'pts', value: 10, weight: 9 },
  { id: 'p30', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 9 },
  { id: 'p50', label: '+50 pts', emoji: '💎', kind: 'pts', value: 50, weight: 7 },
  { id: 'p5', label: '+5 pts', emoji: '🍀', kind: 'pts', value: 5, weight: 5 },
];

/** Sorteia um prêmio por peso. */
export function pickPrize(): Prize {
  const total = PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r < 0) return p;
  }
  return PRIZES[0];
}
