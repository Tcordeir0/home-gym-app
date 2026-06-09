import { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { THEMES } from '../data/themes';
import './ThemeFX.css';

const CHARS = '01ｱｲｳｴｵｶｷｸｹｺ日月火水木金土ＡＢＣＤＥＦ'.split('');
const MATH = ['+', '−', '×', '÷', '=', 'π', '√', '∞', '%', '∑', '2', '7', '∫', 'x²', 'θ', 'φ'];

/** Texturas/animações por tema (chuva Matrix em canvas + overlays CSS + wallpapers). */
const ThemeFX: React.FC = () => {
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const photoOff = useStore((s) => !!s.users.find((u) => u.id === s.active)?.cosmetics?.photoOff);
  const themeObj = THEMES.find((t) => t.id === theme);
  const showImage = !!themeObj?.image && !photoOff;
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
      style={showImage ? { backgroundImage: `url(${themeObj!.image})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}
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
      {themeObj?.fx === 'fireflies' && (
        <div className="fx-flies">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="firefly"
              style={{
                left: `${(i * 53 + 7) % 100}%`,
                top: `${(i * 37 + 11) % 95}%`,
                animationDuration: `${4 + (i % 5)}s`,
                animationDelay: `${(i * 0.5) % 5}s`,
              }}
            />
          ))}
        </div>
      )}
      {themeObj?.fx === 'math' && (
        <div className="fx-math">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="math-sym"
              style={{
                left: `${(i * 47 + 5) % 96}%`,
                top: `${(i * 41 + 9) % 92}%`,
                fontSize: `${14 + (i % 4) * 6}px`,
                animationDuration: `${5 + (i % 5)}s`,
                animationDelay: `${(i * 0.4) % 5}s`,
              }}
            >
              {MATH[i % MATH.length]}
            </span>
          ))}
        </div>
      )}
      {themeObj?.fx === 'hearts' && (
        <div className="fx-hearts">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="heart"
              style={{
                left: `${(i * 61 + 4) % 98}%`,
                fontSize: `${12 + (i % 4) * 6}px`,
                animationDuration: `${5 + (i % 5)}s`,
                animationDelay: `${(i * 0.6) % 6}s`,
              }}
            >
              ♥
            </span>
          ))}
        </div>
      )}
      {themeObj?.fx === 'snow' && (
        <div className="fx-snow">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="flake"
              style={{
                left: `${(i * 29 + 3) % 100}%`,
                width: `${3 + (i % 3) * 2}px`,
                height: `${3 + (i % 3) * 2}px`,
                animationDuration: `${3 + (i % 4)}s`,
                animationDelay: `${(i * 0.3) % 5}s`,
                ['--drift' as string]: `${((i % 5) - 2) * 14}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeFX;
