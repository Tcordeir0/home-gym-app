// Decorações de avatar — badge no canto do avatar. Prêmios da roleta (por perfil).
import { isTester } from './themes';

export interface Deco {
  id: string;
  name: string;
  emoji: string;
  free: boolean;
}

export const DECOS: Deco[] = [
  { id: 'none', name: 'Nenhuma', emoji: '', free: true },
  { id: 'fire', name: 'Fogo', emoji: '🔥', free: false },
  { id: 'crown', name: 'Coroa', emoji: '👑', free: false },
  { id: 'star', name: 'Estrela', emoji: '⭐', free: false },
  { id: 'bolt', name: 'Raio', emoji: '⚡', free: false },
  { id: 'gem', name: 'Gema', emoji: '💎', free: false },
  { id: 'rocket', name: 'Foguete', emoji: '🚀', free: false },
  { id: 'trophy', name: 'Troféu', emoji: '🏆', free: false },
  { id: 'devil', name: 'Diabo', emoji: '😈', free: false },
  { id: 'alien', name: 'Alien', emoji: '👽', free: false },
  { id: 'heart', name: 'Coração', emoji: '❤️', free: false },
  { id: 'skull', name: 'Caveira', emoji: '💀', free: false },
];

export const FREE_DECOS = DECOS.filter((d) => d.free).map((d) => d.id);

export function decoUnlocked(id: string, unlocked: string[], name?: string): boolean {
  return isTester(name) || FREE_DECOS.includes(id) || unlocked.includes(id);
}

export function decoEmoji(id?: string | null): string {
  if (!id) return '';
  return DECOS.find((d) => d.id === id)?.emoji || '';
}
