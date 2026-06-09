// Feedback de som (Web Audio, sem assets) + vibração, respeitando o ajuste do perfil.
import type { Feedback } from '../store/types';

let mode: Feedback = 'both';
export function setFeedbackMode(m: Feedback) { mode = m || 'both'; }

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

function buzz(p: number | number[]) {
  if (!vibrateOn()) return;
  try { navigator.vibrate?.(p); } catch { /* ok */ }
}

/** Marcar série feita — tique curto. */
export function fxTick() { beep(660, 0.06); buzz(10); }
/** Treino concluído — acorde de sucesso. */
export function fxSuccess() { beep(523, 0.1); setTimeout(() => beep(784, 0.16), 95); buzz([18, 40, 28]); }
/** Recompensa (resgate/roleta) — brilho. */
export function fxReward() { beep(880, 0.09); setTimeout(() => beep(1175, 0.13), 80); buzz([14, 26, 14]); }
