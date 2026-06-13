import { useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { THEMES } from '../data/themes';
import './ThemeFX.css';

const CHARS = '01ｱｲｳｴｵｶｷｸｹｺ日月火水木金土ＡＢＣＤＥＦ'.split('');
const MATH = ['+', '−', '×', '÷', '=', 'π', '√', '∞', '%', '∑', '2', '7', '∫', 'x²', 'θ', 'φ'];
// glifos rúnicos (estilo Alfabeto Galáctico) — partículas da mesa de encantamento
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛜᛞᛟᚷᛝᛡ'.split('');

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
      {themeObj?.fx === 'electric' && (
        <div className="fx-electric">
          {/* raios que piscam em posições/escalas diferentes */}
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={'b' + i}
              className="bolt"
              viewBox="0 0 40 220"
              style={{
                left: `${[12, 34, 56, 74, 88][i]}%`,
                height: `${36 + (i % 3) * 10}vh`,
                transform: `rotate(${(i % 2 ? 1 : -1) * (6 + i * 2)}deg)`,
                animationDelay: `${(i * 1.3) % 6}s`,
                animationDuration: `${2.6 + (i % 3)}s`,
              }}
            >
              <path d="M22 0 L8 88 L24 92 L6 220 L34 96 L18 92 L30 0 Z" />
            </svg>
          ))}
          {/* faíscas elétricas brilhando */}
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={'s' + i}
              className="spark"
              style={{
                left: `${(i * 43 + 6) % 98}%`,
                top: `${(i * 31 + 8) % 94}%`,
                animationDuration: `${1.4 + (i % 4) * 0.5}s`,
                animationDelay: `${(i * 0.27) % 4}s`,
              }}
            />
          ))}
        </div>
      )}
      {themeObj?.fx === 'miasma' && (
        <div className="fx-miasma">
          {/* pulso vermelho — o "aperto no coração" do Return by Death */}
          <div className="miasma-pulse" />
          {/* banco de fumaça denso subindo do chão */}
          <div className="miasma-floor" />
          {/* baforadas de fumaça billowing (sobem, incham, giram e derivam) */}
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="wisp"
              style={{
                left: `${(i * 47 + 4) % 99}%`,
                width: `${70 + (i % 5) * 46}px`,
                height: `${70 + (i % 5) * 46}px`,
                animationDuration: `${9 + (i % 6)}s`,
                animationDelay: `-${(i * 0.55) % 11}s`,
                ['--sway' as string]: `${((i % 5) - 2) * 26}px`,
                ['--spin' as string]: `${(i % 2 ? 1 : -1) * (20 + (i % 4) * 18)}deg`,
              }}
            />
          ))}
        </div>
      )}
      {themeObj?.fx === 'enchant' && (
        <div className="fx-enchant">
          {/* glifos do alfabeto galáctico subindo e brilhando — mesa de encantamento */}
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="rune"
              style={{
                left: `${(i * 37 + 4) % 97}%`,
                fontSize: `${13 + (i % 4) * 7}px`,
                animationDuration: `${5 + (i % 5)}s`,
                animationDelay: `${(i * 0.42) % 6}s`,
                ['--drift' as string]: `${((i % 5) - 2) * 16}px`,
              }}
            >
              {RUNES[i % RUNES.length]}
            </span>
          ))}
        </div>
      )}
      {themeObj?.fx === 'hands' && (
        <div className="fx-hands">
          {/* a massa escura de onde as mãos emergem (Satella) */}
          <div className="hands-pool" />
          {/* mãos emergindo das 4 bordas e se CONTORCENDO (base° + sway de rotação) */}
          {([
            { e: 'b', n: 10, base: 0 },
            { e: 't', n: 7, base: 180 },
            { e: 'l', n: 6, base: 90 },
            { e: 'r', n: 6, base: -90 },
          ] as const).flatMap((cfg) =>
            Array.from({ length: cfg.n }).map((_, i) => {
              const sway = 7 + (i % 3) * 6;
              const along = ((i * 53 + 7) % 90) + 4; // % ao longo da borda
              const horiz = cfg.e === 'b' || cfg.e === 't';
              return (
                <img
                  key={cfg.e + i}
                  className={'shand reach ' + cfg.e}
                  src="/satella-hand.svg"
                  alt=""
                  style={{
                    [horiz ? 'left' : 'top']: `${along}%`,
                    width: `${40 + (i % 4) * 22}px`,
                    ['--r0' as string]: `${cfg.base - sway}deg`,
                    ['--r1' as string]: `${cfg.base + sway}deg`,
                    animationDuration: `${2.6 + (i % 4) * 0.7}s`,
                    animationDelay: `-${(i * 0.43) % 5}s`,
                  }}
                />
              );
            }),
          )}
          {/* 愛している — a frase marcada da Satella, sussurrada no fundo */}
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={'t' + i}
              className="aishiteru"
              style={{
                left: `${12 + i * 23}%`,
                fontSize: `${15 + (i % 3) * 9}px`,
                animationDuration: `${9 + (i % 4)}s`,
                animationDelay: `-${(i * 1.7) % 8}s`,
              }}
            >
              愛している
            </span>
          ))}
        </div>
      )}
      {themeObj?.fx === 'creator' && (
        <div className="fx-creator">
          {/* o "reluzente" — brilho varrendo a tela */}
          <div className="creator-shimmer" />
          {/* fagulhas roxas de criação subindo (o builder/Talys) */}
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={'s' + i}
              className="cspark"
              style={{
                left: `${(i * 53 + 5) % 97}%`,
                width: `${4 + (i % 4) * 3}px`,
                height: `${4 + (i % 4) * 3}px`,
                animationDuration: `${6 + (i % 5)}s`,
                animationDelay: `${(i * 0.5) % 7}s`,
              }}
            />
          ))}
          {/* estrelas douradas piscando (ambição/cosmos, casa com o tridente) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={'g' + i}
              className="cstar"
              style={{
                left: `${(i * 61 + 9) % 96}%`,
                top: `${(i * 37 + 7) % 92}%`,
                animationDuration: `${2.5 + (i % 4)}s`,
                animationDelay: `${(i * 0.4) % 5}s`,
              }}
            />
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
      {themeObj?.fx === 'glitch' && themeObj.image && (
        <div className="fx-glitch" style={{ ['--wp' as string]: `url("${themeObj.image}")` }}>
          {/* tipo 1: split cromático RGB (2 cópias do wallpaper tintadas) */}
          <div className="glx-r" />
          <div className="glx-c" />
          {/* tipo 2: tearing — fatias do wallpaper deslocadas */}
          <div className="glx-slices"><i /><i /><i /><i /></div>
          {/* tipo 3: ruído/static */}
          <div className="glx-noise" />
          {/* tipo 4: signal roll/jump (scanlines + salto) */}
          <div className="glx-roll" />
        </div>
      )}
      {themeObj?.fx === 'butterflies' && (
        <div className="fx-butterflies">
          {Array.from({ length: 13 }).map((_, i) => (
            <span
              key={i}
              className="bfly"
              style={{
                left: `${(i * 53 + 6) % 96}%`,
                ['--sz' as string]: `${0.7 + (i % 4) * 0.18}`,
                ['--flap' as string]: `${0.22 + (i % 3) * 0.05}s`,
                animationDuration: `${8 + (i % 5)}s`,
                animationDelay: `-${(i * 0.7) % 9}s`,
              }}
            >
              <span className="w l" />
              <span className="w r" />
            </span>
          ))}
        </div>
      )}
      {themeObj?.fx === 'witch' && (
        <>
          {/* fantasma glitchado da Echidna (aparece/some piscando, verde-branco) */}
          <div className="fx-witchghost" style={{ ['--ghost' as string]: 'url("/themes/bruxa-ghost.png")' }}>
            <div className="ghost g1" />
            <div className="ghost g2" />
          </div>
          {/* borboletas verde-branco com brilho verde-lima */}
          <div className="fx-butterflies green">
            {Array.from({ length: 13 }).map((_, i) => (
              <span
                key={i}
                className="bfly"
                style={{
                  left: `${(i * 53 + 6) % 96}%`,
                  ['--sz' as string]: `${0.7 + (i % 4) * 0.18}`,
                  ['--flap' as string]: `${0.22 + (i % 3) * 0.05}s`,
                  animationDuration: `${8 + (i % 5)}s`,
                  animationDelay: `-${(i * 0.7) % 9}s`,
                }}
              >
                <span className="w l" />
                <span className="w r" />
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeFX;
