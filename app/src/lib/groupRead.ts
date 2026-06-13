// Marca, por dispositivo, quando cada grupo foi lido pela última vez (não-lidas).
// Local (localStorage) — não precisa de coluna 'seen' no backend pra isso.
const KEY = 'hgt_grp_read';

export function getGroupRead(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function markGroupRead(gid: string): void {
  const m = getGroupRead();
  m[gid] = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ok */ }
}
