import { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { THEMES } from '../data/themes';
import './ThemeFX.css';

const CHARS = '01ｱｲｳｴｵｶｷｸｹｺ日月火水木金土ＡＢＣＤＥＦ'.split('');

/** Texturas/animações por tema (chuva Matrix em canvas + overlays CSS + wallpapers). */
const ThemeFX: React.FC = () => {
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const themeObj = THEMES.find((t) => t.id === theme);
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
    <div
      className={'theme-fx fx-' + theme}
      aria-hidden="true"
      style={themeObj?.image ? { backgroundImage: `url(${themeObj.image})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}
    >
      <canvas ref={canvasRef} className="fx-matrix-canvas" />
      {themeObj?.fx === 'bubbles' && (
        <div className="fx-bubbles">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: `${(i * 61) % 100}%`,
                width: `${6 + (i % 4) * 4}px`,
                height: `${6 + (i % 4) * 4}px`,
                animationDuration: `${5 + (i % 5)}s`,
                animationDelay: `${(i * 0.7) % 6}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeFX;
