// Feedback de som (Web Audio, sem assets) + vibração, respeitando o ajuste do perfil.
// No app nativo (iOS/Android) a vibração usa Capacitor Haptics — navigator.vibrate
// NÃO existe no iOS, por isso o feedback só funcionava no Android web antes.
import type { Feedback } from '../store/types';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const native = Capacitor.isNativePlatform();

let mode: Feedback = 'none';
export function setFeedbackMode(m: Feedback) { mode = m || 'none'; }

// volume mestre (0–1), por perfil — sincronizado pelo App a partir do perfil ativo.
let volume = 0.7;
export function setVolume(v: number) { volume = Math.max(0, Math.min(1, v)); }
export function getVolume() { return volume; }

const soundOn = () => mode === 'both' || mode === 'sound';
const vibrateOn = () => mode === 'both' || mode === 'vibrate';

let actx: (AudioContext | null) = null;
// volume bem mais alto que antes (era 0.05 — quase inaudível) + envelope (ataque/decay)
// pra um som limpo, e tipo 'triangle' (mais cheio/audível que 'sine').
function beep(freq: number, dur: number, vol = 0.3) {
  if (!soundOn()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    actx = actx || new AC();
    if (actx.state === 'suspended') actx.resume();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime;
    const v = Math.max(0.0002, vol * volume); // aplica o volume mestre do perfil
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012); // ataque rápido
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur); // decay
    o.start(t);
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

/** Marcar série feita — tique curto e nítido. */
export function fxTick() { beep(900, 0.06, 0.26); buzz(12, 'light'); }
/** Treino concluído — acorde ascendente triunfante (C–E–G–C). */
export function fxSuccess() {
  beep(523, 0.13, 0.32);
  setTimeout(() => beep(659, 0.13, 0.32), 90);
  setTimeout(() => beep(784, 0.14, 0.34), 180);
  setTimeout(() => beep(1047, 0.26, 0.34), 270);
  buzz([18, 40, 28], 'success');
}
/** Recompensa (resgate/roleta) — brilho cintilante. */
export function fxReward() {
  beep(784, 0.1, 0.3);
  setTimeout(() => beep(1047, 0.12, 0.32), 85);
  setTimeout(() => beep(1319, 0.22, 0.32), 175);
  buzz([14, 26, 14], 'medium');
}
