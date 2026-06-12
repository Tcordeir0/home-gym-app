// Temas do app — trocáveis no Perfil. As cores reais ficam em variables.css ([data-theme]).
export interface Theme {
  id: string;
  name: string;
  emoji: string;
  free: boolean; // grátis (Preto/Branco) ou prêmio da roleta
  exclusive?: boolean; // só o tester (TCORDEIRO/talysmatheus12) — não cai na roleta
  swatch: [string, string, string]; // bg, surface, accent (preview)
  image?: string; // wallpaper de fundo (cards viram "liquid glass")
  fx?: 'bubbles' | 'sparkles' | 'fireflies' | 'math' | 'hearts' | 'snow' | 'electric' | 'miasma' | 'enchant'; // partículas por cima da arte
}

export const THEMES: Theme[] = [
  { id: 'dark', name: 'Preto', emoji: '🖤', free: true, swatch: ['#0b0c0f', '#1c2027', '#c6ff3a'] },
  { id: 'light', name: 'Branco', emoji: '🤍', free: true, swatch: ['#ffffff', '#eef1f5', '#4f9a00'] },
  { id: 'cyber', name: 'Cyber', emoji: '🛸', free: false, swatch: ['#0a0e16', '#141b2b', '#37e6ff'] },
  { id: 'matrix', name: 'Matrix', emoji: '🟩', free: false, swatch: ['#04080a', '#0c1a0e', '#39ff88'] },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', free: false, swatch: ['#140d12', '#251621', '#ff7a4d'] },
  { id: 'grafite', name: 'Grafite', emoji: '⚙️', free: false, swatch: ['#0f1013', '#1e2128', '#e8eaee'] },
  { id: 'bloco', name: 'Bloco', emoji: '⛏️', free: false, swatch: ['#1a140d', '#241a12', '#7cc93a'], image: '/themes/bloco.jpg', fx: 'enchant' },
  { id: 'synth', name: 'Synthwave', emoji: '🌆', free: false, swatch: ['#0d0420', '#1a0b33', '#ff2fd0'] },
  { id: 'cosmos', name: 'Cosmos', emoji: '🌌', free: false, swatch: ['#060414', '#0e0a22', '#8b6bff'] },
  { id: 'ouro', name: 'Ouro', emoji: '👑', free: false, swatch: ['#0c0a06', '#16120a', '#ffd24d'] },
  { id: 'checker', name: 'Checker', emoji: '🏁', free: false, swatch: ['#06121f', '#0c1c2e', '#2ad1ff'] },
  { id: 'arcade', name: 'Arcade', emoji: '👾', free: false, swatch: ['#0a0710', '#150f1e', '#ffe14d'] },
  { id: 'aquatico_mine', name: 'Aquático', emoji: '🌊', free: false, swatch: ['#0a2735', '#0d3444', '#3fe0d0'], image: '/themes/aquatico_mine.png', fx: 'bubbles' },
  { id: 'sitio_poke', name: 'Sítio Poké', emoji: '🏕️', free: false, swatch: ['#0c1612', '#16241c', '#ffd76b'], image: '/themes/sitio_poke.png', fx: 'fireflies' },
  { id: 'math', name: 'Math', emoji: '🧮', free: false, swatch: ['#10353f', '#16454f', '#5fe0e8'], image: '/themes/math.png', fx: 'math' },
  { id: 'love', name: 'Love', emoji: '💗', free: false, swatch: ['#160a1e', '#241433', '#ff6bc4'], image: '/themes/love.png', fx: 'hearts' },
  { id: 'snow', name: 'Snow', emoji: '❄️', free: false, swatch: ['#0c1a2c', '#13283f', '#8fd0ff'], image: '/themes/snow.png', fx: 'snow' },
  { id: 'eletrico', name: 'Elétrico', emoji: '⚡', free: false, swatch: ['#0c1830', '#15294a', '#ffe14d'], image: '/themes/eletrico.png', fx: 'electric' },
  { id: 'return', name: 'Return', emoji: '🔁', free: false, swatch: ['#0a0b0c', '#16181a', '#aac47e'], image: '/themes/return.jpg', fx: 'miasma' },
  { id: 'creator', name: 'Creator', emoji: '🕷️', free: false, exclusive: true, swatch: ['#1a1230', '#241a3e', '#b06bff'], image: '/themes/creator.jpg' },
];

export const THEME_IDS = THEMES.map((t) => t.id);
export const FREE_THEMES = THEMES.filter((t) => t.free).map((t) => t.id);

/** Perfil tester (tudo liberado) — conta do Talys. */
export function isTester(name?: string): boolean {
  return (name || '').trim().toUpperCase() === 'TCORDEIRO';
}

/** Tema desbloqueado? Grátis sempre; premium precisa estar em cosmetics.themes;
 *  exclusivo só o tester; tester libera tudo. */
export function themeUnlocked(id: string, unlocked: string[], name?: string): boolean {
  if (isTester(name)) return true;
  if (THEMES.find((t) => t.id === id)?.exclusive) return false; // só o Talys
  return FREE_THEMES.includes(id) || unlocked.includes(id);
}
