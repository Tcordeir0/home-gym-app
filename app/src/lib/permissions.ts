// Pedidos de permissão (notificações) e checagem de suporte (vibração),
// para o app pedir ao ATIVAR a chavinha — não na cara dura ao abrir.
import { Capacitor } from '@capacitor/core';

/** Pede permissão de notificação. Retorna true se concedida. */
export async function requestNotifications(): Promise<boolean> {
  try {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const r = await Notification.requestPermission();
    return r === 'granted';
  } catch {
    return false;
  }
}

/** Permissão de notificação já concedida? */
export function notificationsGranted(): boolean {
  try {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  } catch {
    return false;
  }
}

/** A vibração funciona neste dispositivo? (nativo via Haptics, ou Web Vibration API) */
export function vibrationSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true; // Haptics no app nativo (iOS/Android)
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Dispara uma notificação local simples (quando permitido). */
export function notify(title: string, body?: string): void {
  try {
    if (notificationsGranted()) new Notification(title, { body, icon: '/icon-192.png' });
  } catch {
    /* ok */
  }
}
