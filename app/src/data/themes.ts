// Temas do app — trocáveis no Perfil. As cores reais ficam em variables.css ([data-theme]).
export interface Theme {
  id: string;
  name: string;
  emoji: string;
  free: boolean; // grátis (Preto/Branco) ou prêmio da roleta
  swatch: [string, string, string]; // bg, surface, accent (preview)
}

export const THEMES: Theme[] = [
  { id: 'dark', name: 'Preto', emoji: '🖤', free: true, swatch: ['#0b0c0f', '#1c2027', '#c6ff3a'] },
  { id: 'light', name: 'Branco', emoji: '🤍', free: true, swatch: ['#ffffff', '#eef1f5', '#4f9a00'] },
  { id: 'cyber', name: 'Cyber', emoji: '🛸', free: false, swatch: ['#0a0e16', '#141b2b', '#37e6ff'] },
  { id: 'matrix', name: 'Matrix', emoji: '🟩', free: false, swatch: ['#04080a', '#0c1a0e', '#39ff88'] },
  { id: 'sunset', name: 'Sunset', emoji: '🌅', free: false, swatch: ['#140d12', '#251621', '#ff7a4d'] },
  { id: 'grafite', name: 'Grafite', emoji: '⚙️', free: false, swatch: ['#0f1013', '#1e2128', '#e8eaee'] },
];

export const THEME_IDS = THEMES.map((t) => t.id);
export const FREE_THEMES = THEMES.filter((t) => t.free).map((t) => t.id);

/** Perfil tester (tudo liberado) — conta do Talys. */
export function isTester(name?: string): boolean {
  return (name || '').trim().toUpperCase() === 'TCORDEIRO';
}

/** Tema desbloqueado? Grátis sempre; premium precisa estar em cosmetics.themes; tester libera tudo. */
export function themeUnlocked(id: string, unlocked: string[], name?: string): boolean {
  return isTester(name) || FREE_THEMES.includes(id) || unlocked.includes(id);
}
