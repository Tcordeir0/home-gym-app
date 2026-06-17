import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/store';
import { fxTick } from '../lib/feedback';
import './RestTimer.css';

// Timer de descanso entre séries. Opcional (ligado no Perfil). Dispara ao marcar uma série
// (evento 'hg:set-done' emitido pelo ExerciseCard) e conta regressivo; vibra + bipa no fim.
const RestTimer: React.FC = () => {
  const cfg = useStore((s) => s.users.find((u) => u.id === s.active)?.restTimer);
  const [left, setLeft] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef(0); // duração total do ciclo atual (estável p/ a barra; +15s soma aqui)
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  const stop = () => { if (tick.current) { clearInterval(tick.current); tick.current = null; } };
  const run = (sec: number) => {
    stop();
    totalRef.current = sec;
    setLeft(sec);
    tick.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { stop(); try { navigator.vibrate?.([120, 60, 120]); } catch { /* sem vibração */ } fxTick(); return 0; }
        return l - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const onDone = () => { const c = cfgRef.current; if (c?.on) run(c.sec); };
    window.addEventListener('hg:set-done', onDone);
    return () => { window.removeEventListener('hg:set-done', onDone); stop(); };
  }, []);

  if (left <= 0) return null;
  const mm = Math.floor(left / 60), ss = left % 60;
  const pct = Math.min(100, Math.round((left / (totalRef.current || left)) * 100));
  return (
    <div className="rest-timer" role="timer">
      <div className="rest-bar" style={{ width: pct + '%' }} />
      <button className="ds-btn ds-btn--ghost rest-act" onClick={() => { stop(); setLeft(0); }}>Pular</button>
      <div className="rest-mid">
        <span className="rest-label">Descanso</span>
        <span className="rest-time">{mm}:{String(ss).padStart(2, '0')}</span>
      </div>
      <button className="ds-btn ds-btn--ghost rest-act" onClick={() => { setLeft((l) => l + 15); totalRef.current += 15; }}>+15s</button>
    </div>
  );
};

export default RestTimer;
