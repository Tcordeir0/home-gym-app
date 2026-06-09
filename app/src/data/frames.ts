// Aros de avatar estilo Discord (Nitro). Cada aro é um anel animado em CSS
// (classe .av-frame-<id> em variables.css). Prêmios da roleta, por perfil.
import { isTester } from './themes';

export interface Frame {
  id: string;
  name: string;
  free: boolean;
  // duas cores que representam o aro no seletor (swatch radial)
  swatch: [string, string];
}

export const FRAMES: Frame[] = [
  { id: 'none', name: 'Sem aro', free: true, swatch: ['#2a2f3a', '#2a2f3a'] },
  { id: 'neon', name: 'Neon', free: false, swatch: ['#00e5ff', '#c800ff'] },
  { id: 'gold', name: 'Ouro', free: false, swatch: ['#ffe27a', '#b8860b'] },
  { id: 'rainbow', name: 'Arco-íris', free: false, swatch: ['#ff4d4d', '#3ad1ff'] },
  { id: 'fire', name: 'Fogo', free: false, swatch: ['#ffd166', '#ff3b30'] },
  { id: 'ice', name: 'Gelo', free: false, swatch: ['#bdecff', '#3aa0ff'] },
  { id: 'toxic', name: 'Tóxico', free: false, swatch: ['#c6ff3a', '#1f9e2e'] },
  { id: 'royal', name: 'Real', free: false, swatch: ['#c084fc', '#ffd166'] },
  { id: 'ocean', name: 'Oceano', free: false, swatch: ['#3ad1ff', '#1d4ed8'] },
  { id: 'ember', name: 'Brasa', free: false, swatch: ['#ff8a3a', '#7a1010'] },
];

export const FREE_FRAMES = FRAMES.filter((f) => f.free).map((f) => f.id);

export function frameUnlocked(id: string, unlocked: string[], name?: string): boolean {
  return isTester(name) || FREE_FRAMES.includes(id) || unlocked.includes(id);
}
