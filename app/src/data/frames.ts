// Aros de avatar estilo Discord (Nitro). Cada aro é um anel animado em CSS
// (classe .av-frame-<id> em variables.css). Prêmios da roleta, por perfil.
import { isTester, OWNER_EMAIL } from './themes';

export interface Frame {
  id: string;
  name: string;
  free: boolean;
  account?: string; // liberado p/ todos os perfis desta conta (email) — não cai na roleta
  // duas cores que representam o aro no seletor (swatch radial)
  swatch: [string, string];
}

export const FRAMES: Frame[] = [
  { id: 'none', name: 'Sem aro', free: true, swatch: ['#2a2f3a', '#2a2f3a'] },
  { id: 'electric', name: 'Eletricidade', free: true, swatch: ['#8ec8ff', '#ffe14d'] },
  { id: 'tridente', name: 'Tridente', free: true, swatch: ['#fff3c4', '#c89b2a'] },
  { id: 'mine', name: 'Minecraft', free: false, swatch: ['#7cc93a', '#6b4a24'] },
  { id: 'cha', name: 'Pecados', free: false, account: OWNER_EMAIL, swatch: ['#caa6ff', '#2a1840'] },
  { id: 'pokeball', name: 'Pokébola', free: false, swatch: ['#e23b3b', '#f4f6f8'] },
  { id: 'return', name: 'Return', free: false, swatch: ['#c0392b', '#1a0e10'] },
  { id: 'neon', name: 'Neon', free: false, swatch: ['#00e5ff', '#c800ff'] },
  { id: 'gold', name: 'Ouro', free: false, swatch: ['#ffe27a', '#b8860b'] },
  { id: 'rainbow', name: 'Arco-íris', free: false, swatch: ['#ff4d4d', '#3ad1ff'] },
  { id: 'fire', name: 'Fogo', free: false, swatch: ['#ffd166', '#ff3b30'] },
  { id: 'ice', name: 'Gelo', free: false, swatch: ['#bdecff', '#3aa0ff'] },
  { id: 'toxic', name: 'Tóxico', free: false, swatch: ['#c6ff3a', '#1f9e2e'] },
  { id: 'royal', name: 'Real', free: false, swatch: ['#c084fc', '#ffd166'] },
  { id: 'ocean', name: 'Oceano', free: false, swatch: ['#3ad1ff', '#1d4ed8'] },
  { id: 'ember', name: 'Brasa', free: false, swatch: ['#ff8a3a', '#7a1010'] },
  // ===== Aros temáticos dos temas novos =====
  { id: 'hollow', name: 'Cavaleiro', free: false, swatch: ['#aef6ff', '#1a4a6e'] },
  { id: 'aranha', name: 'Teia', free: false, swatch: ['#ff3b3b', '#1a1a1a'] },
  { id: 'code', name: 'Terminal', free: false, swatch: ['#39ff88', '#0a8a4a'] },
  { id: 'vice', name: 'Vice', free: false, swatch: ['#ff4da6', '#37e6ff'] },
  { id: 'miami', name: 'Retrowave', free: false, swatch: ['#ff5cc8', '#7a5cff'] },
  { id: 'bruxa', name: 'Inveja', free: false, swatch: ['#ff5b8a', '#b06bff'] },
  { id: 'sete', name: 'Os Sete', free: false, swatch: ['#d62b3a', '#1e3a8a'] },
  { id: 'pi', name: 'Infinito', free: false, swatch: ['#e23b3b', '#1a1a1a'] },
];

export const FREE_FRAMES = FRAMES.filter((f) => f.free).map((f) => f.id);

export function frameUnlocked(id: string, unlocked: string[], name?: string): boolean {
  return isTester(name) || FREE_FRAMES.includes(id) || unlocked.includes(id);
}
