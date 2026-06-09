import { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import './ThemeFX.css';

const CHARS = '01ｱｲｳｴｵｶｷｸｹｺ日月火水木金土ＡＢＣＤＥＦ'.split('');

/** Texturas/animações por tema (chuva Matrix em canvas + overlays CSS). */
const ThemeFX: React.FC = () => {
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (theme !== 'matrix' || reduce || !ctx) {
      ctx?.clearRect(0, 0, c.width, c.height);
      return;
    }
    let raf = 0;
    const fs = 14;
    const setSize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    setSize();
    let drops = Array.from({ length: Math.floor(c.width / fs) }, () => Math.floor(Math.random() * (c.height / fs)));
    const draw = () => {
      ctx.fillStyle = 'rgba(3,16,10,0.10)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00ff66';
      ctx.font = fs + 'px monospace';
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * fs, drops[i] * fs);
        if (drops[i] * fs > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { setSize(); drops = Array.from({ length: Math.floor(c.width / fs) }, () => Math.floor(Math.random() * (c.height / fs))); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [theme]);

  return (
    <div className={'theme-fx fx-' + theme} aria-hidden="true">
      <canvas ref={canvasRef} className="fx-matrix-canvas" />
    </div>
  );
};

export default ThemeFX;
