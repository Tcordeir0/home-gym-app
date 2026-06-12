// Identidade estável deste APARELHO (pra "claim" de perfil por dispositivo).
const KEY = 'hgt_device_id';

export function deviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'dev-anon';
  }
}
