import { THEMES } from '../data/themes';
import './PillFX.css';

const RUNES = 'ᚠᚢᚦᚨᚱ'.split('');
const MATH = ['π', '√', '∑', '∞', '7'];
const MAT = ['0', '1', 'ｱ', 'ﾘ', 'ﾂ', '7'];
// posições espalhadas (left%, top%) pra preencher a pílula inteira (não só a base)
const POS: [number, number][] = [[16, 24], [40, 14], [60, 40], [80, 22], [28, 58], [70, 64]];
// temas cujo fx é ANIMAÇÃO DE FUNDO (não partícula) — reaplicada via CSS no pill
const BG_THEMES = new Set(['cyber', 'sunset', 'synth', 'cosmos', 'ouro', 'checker', 'arcade']);

/** Mini-animação do tema do perfil, dentro da pílula. Cada tema mostra o SEU fx. */
const PillFX: React.FC<{ theme?: string | null }> = ({ theme }) => {
  const t = THEMES.find((x) => x.id === theme);
  if (!t) return null;
  const fx = t.fx;

  // mãos da Satella (Chá)
  if (fx === 'hands') {
    return (
      <span className="pill-fx pfx-hands" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <img key={i} className="pf p-hand" src="/satella-hand.svg" alt="" style={{ left: `${12 + i * 33}%`, width: '16px', animationDelay: `-${i * 0.6}s` }} />
        ))}
      </span>
    );
  }
  // miasma (Return)
  if (fx === 'miasma') {
    return (
      <span className="pill-fx pfx-miasma" aria-hidden="true">
        <span className="pf p-pulse" />
        {POS.slice(0, 3).map(([x, y], i) => <span key={i} className="pf p-wisp" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${i * 0.7}s` }} />)}
      </span>
    );
  }
  // elétrico — raios + faíscas
  if (fx === 'electric') {
    return (
      <span className="pill-fx pfx-electric" aria-hidden="true">
        {[18, 52, 82].map((x, i) => (
          <svg key={'b' + i} className="pf p-bolt" viewBox="0 0 12 28" style={{ left: `${x}%`, height: `${60 + (i % 2) * 25}%`, animationDelay: `-${i * 0.5}s` }}>
            <path d="M7 0 L2 15 L6 15 L4 28 L11 12 L7 12 Z" />
          </svg>
        ))}
        {POS.slice(0, 4).map(([x, y], i) => <span key={'s' + i} className="pf p-spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${i * 0.3}s` }} />)}
      </span>
    );
  }
  // Creator (Talys) — fagulhas roxas subindo + estrelas douradas
  if (fx === 'creator') {
    return (
      <span className="pill-fx pfx-creator" aria-hidden="true">
        {POS.slice(0, 4).map(([x, y], i) => <span key={'s' + i} className="pf p-cspark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `-${i * 0.5}s` }} />)}
        {POS.slice(2, 5).map(([x, y], i) => <span key={'g' + i} className="pf p-cstar" style={{ left: `${(x + 8) % 92}%`, top: `${Math.max(8, y - 10)}%`, animationDelay: `-${i * 0.4}s` }} />)}
      </span>
    );
  }
  // partículas espalhadas (runas, símbolos, corações, bolhas, neve, vaga-lumes)
  if (fx === 'enchant' || fx === 'math' || fx === 'hearts' || fx === 'bubbles' || fx === 'snow' || fx === 'fireflies') {
    const n = fx === 'fireflies' ? 5 : 6;
    const items = POS.slice(0, n).map(([x, y], i) => {
      const d = `-${(i * 0.55).toFixed(2)}s`;
      if (fx === 'enchant') return <span key={i} className="pf p-rune" style={{ left: `${x}%`, top: `${y}%`, fontSize: `${9 + (i % 2) * 3}px`, animationDelay: d }}>{RUNES[i % RUNES.length]}</span>;
      if (fx === 'math') return <span key={i} className="pf p-rune math" style={{ left: `${x}%`, top: `${y}%`, fontSize: '10px', animationDelay: d }}>{MATH[i % MATH.length]}</span>;
      if (fx === 'hearts') return <span key={i} className="pf p-heart" style={{ left: `${x}%`, top: `${y}%`, fontSize: '10px', animationDelay: d }}>♥</span>;
      if (fx === 'bubbles') return <span key={i} className="pf p-bubble" style={{ left: `${x}%`, top: `${y}%`, width: `${4 + (i % 3) * 2}px`, height: `${4 + (i % 3) * 2}px`, animationDelay: d }} />;
      if (fx === 'snow') return <span key={i} className="pf p-flake" style={{ left: `${x}%`, top: `${y}%`, animationDelay: d }} />;
      return <span key={i} className="pf p-fly" style={{ left: `${x}%`, top: `${y}%`, animationDelay: d }} />;
    });
    return <span className={'pill-fx pfx-' + fx} aria-hidden="true">{items}</span>;
  }
  // matrix — chuva digital verde
  if (t.id === 'matrix') {
    return (
      <span className="pill-fx pfx-matrix" aria-hidden="true">
        {POS.map(([x, y], i) => <span key={i} className="pf p-matrix" style={{ left: `${x}%`, top: `${y}%`, fontSize: '11px', animationDelay: `-${i * 0.45}s` }}>{MAT[i % MAT.length]}</span>)}
      </span>
    );
  }
  // temas com animação de FUNDO (cyber/sunset/synth/cosmos/ouro/checker/arcade)
  if (BG_THEMES.has(t.id)) return <span className={'pill-fx bg-' + t.id} aria-hidden="true" />;

  return null;
};

export default PillFX;
