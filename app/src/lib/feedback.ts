// Feedback de som (Web Audio, sem assets) + vibração, respeitando o ajuste do perfil.
// No app nativo (iOS/Android) a vibração usa Capacitor Haptics — navigator.vibrate
// NÃO existe no iOS, por isso o feedback só funcionava no Android web antes.
import type { Feedback } from '../store/types';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const native = Capacitor.isNativePlatform();

let mode: Feedback = 'none';
export function setFeedbackMode(m: Feedback) { mode = m || 'none'; }

const soundOn = () => mode === 'both' || mode === 'sound';
const vibrateOn = () => mode === 'both' || mode === 'vibrate';

let actx: (AudioContext | null) = null;
function beep(freq: number, dur: number, vol = 0.05) {
  if (!soundOn()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    actx = actx || new AC();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime;
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.stop(t + dur + 0.02);
  } catch { /* ok */ }
}

/** Vibra: Haptics nativo (iOS/Android) ou Web Vibration API (Android web). */
function buzz(p: number | number[], style: 'light' | 'medium' | 'success' = 'light') {
  if (!vibrateOn()) return;
  if (native) {
    if (style === 'success') Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    else Haptics.impact({ style: style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
    return;
  }
  try { navigator.vibrate?.(p); } catch { /* ok */ }
}

/** Vibração de teste, chamada ao ATIVAR a chavinha (pra sentir na hora). */
export function fxBuzzTest() {
  if (native) { Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}); return; }
  try { navigator.vibrate?.([20, 40, 30]); } catch { /* ok */ }
}

/** Marcar série feita — tique curto. */
export function fxTick() { beep(660, 0.06); buzz(10, 'light'); }
/** Treino concluído — acorde de sucesso. */
export function fxSuccess() { beep(523, 0.1); setTimeout(() => beep(784, 0.16), 95); buzz([18, 40, 28], 'success'); }
/** Recompensa (resgate/roleta) — brilho. */
export function fxReward() { beep(880, 0.09); setTimeout(() => beep(1175, 0.13), 80); buzz([14, 26, 14], 'medium'); }
