// Decorações de avatar — badge no canto do avatar. Agora são ícones pixel-art
// (ver gameicons.ts + componente PixelIcon). Prêmios da roleta, por perfil.
import { isTester } from './themes';
import { PIXEL_ICONS, type Pack } from './gameicons';

export interface Deco {
  id: string;
  name: string;
  pack?: Pack;
  free: boolean;
}

export const DECOS: Deco[] = [
  { id: 'none', name: 'Nenhuma', free: true },
  ...PIXEL_ICONS.map((i) => ({ id: i.id, name: i.name, pack: i.pack, free: false })),
];

export const FREE_DECOS = DECOS.filter((d) => d.free).map((d) => d.id);

export function decoUnlocked(id: string, unlocked: string[], name?: string): boolean {
  return isTester(name) || FREE_DECOS.includes(id) || unlocked.includes(id);
}
