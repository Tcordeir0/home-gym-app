// Loja + moeda CREATINA. Tudo configurável num lugar só (sem valores hardcoded espalhados).
import { THEMES, type Theme } from './themes';
import { FRAMES, type Frame } from './frames';
import { DECOS, type Deco } from './decos';

/** Símbolo da moeda: ₡ (colón) — um C com traço, "€ mas com C". */
export const CREATINA = '₡';
/** Conversão automática e balanceada: 1 ponto = 1 creatina. Os pontos NÃO são gastos. */
export const CREATINAS_PER_POINT = 1;

export type ShopKind = 'theme' | 'frame' | 'deco';

// Preços por categoria — fonte única. Temas com wallpaper valem mais (premium).
export function priceForTheme(t: Theme): number { return t.image ? 1500 : 700; }
export function priceForFrame(_f: Frame): number { return 600; }
export function priceForDeco(_d: Deco): number { return 300; }

/** CREATOR é EXCLUSIVO do Talys da conta talysmatheus12 — nunca aparece pra mais ninguém. */
export function creatorAllowed(email?: string, profileName?: string): boolean {
  return (email || '').trim().toLowerCase() === 'talysmatheus12@gmail.com'
    && (profileName || '').trim().toUpperCase() === 'TALYS';
}

// Itens à venda: exclui grátis, account-gated (liberados pela conta) e exclusivos (Creator).
export function shopThemes(): Theme[] { return THEMES.filter((t) => !t.free && !t.account && !t.exclusive); }
export function shopFrames(): Frame[] { return FRAMES.filter((f) => !f.free && !f.account); }
export function shopDecos(): Deco[] { return DECOS.filter((d) => !d.free); }
