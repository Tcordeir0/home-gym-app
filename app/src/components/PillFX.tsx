import { THEMES } from '../data/themes';
import './PillFX.css';

const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹ'.split('');
const MATH = ['π', '√', '∑', '∞', '7', 'x²'];

/** Mini-animação do tema do perfil, dentro da pílula (recortada na forma dela).
 *  Reflete o fx do tema: mãos da Satella (Chá), runas (Bloco), bolhas, neve, etc. */
const PillFX: React.FC<{ theme?: string | null }> = ({ theme }) => {
  const fx = THEMES.find((t) => t.id === theme)?.fx;
  if (!fx) return null;

  let parts: React.ReactNode = null;
  if (fx === 'hands') {
    parts = [0, 1, 2].map((i) => (
      <img key={i} className="pf p-hand" src="/satella-hand.svg" alt="" style={{ left: `${14 + i * 33}%`, width: '13px', animationDelay: `-${i * 0.6}s` }} />
    ));
  } else if (fx === 'enchant') {
    parts = [0, 1, 2, 3].map((i) => (
      <span key={i} className="pf p-rune" style={{ left: `${10 + i * 24}%`, fontSize: `${9 + (i % 2) * 3}px`, animationDelay: `-${i * 0.7}s` }}>{RUNES[i]}</span>
    ));
  } else if (fx === 'math') {
    parts = [0, 1, 2].map((i) => (
      <span key={i} className="pf p-rune math" style={{ left: `${16 + i * 30}%`, fontSize: '10px', animationDelay: `-${i * 0.8}s` }}>{MATH[i]}</span>
    ));
  } else if (fx === 'hearts') {
    parts = [0, 1, 2].map((i) => (
      <span key={i} className="pf p-heart" style={{ left: `${18 + i * 30}%`, fontSize: '10px', animationDelay: `-${i * 0.9}s` }}>♥</span>
    ));
  } else if (fx === 'bubbles') {
    parts = [0, 1, 2, 3].map((i) => (
      <span key={i} className="pf p-bubble" style={{ left: `${12 + i * 24}%`, width: `${4 + (i % 3) * 2}px`, height: `${4 + (i % 3) * 2}px`, animationDelay: `-${i * 0.7}s` }} />
    ));
  } else if (fx === 'snow') {
    parts = [0, 1, 2, 3].map((i) => (
      <span key={i} className="pf p-flake" style={{ left: `${12 + i * 24}%`, animationDelay: `-${i * 0.6}s` }} />
    ));
  } else if (fx === 'fireflies') {
    parts = [0, 1, 2].map((i) => (
      <span key={i} className="pf p-fly" style={{ left: `${20 + i * 28}%`, top: `${30 + (i % 2) * 30}%`, animationDelay: `-${i * 0.5}s` }} />
    ));
  } else if (fx === 'electric') {
    parts = [0, 1, 2].map((i) => (
      <span key={i} className="pf p-spark" style={{ left: `${20 + i * 28}%`, top: `${25 + (i % 2) * 35}%`, animationDelay: `-${i * 0.4}s` }} />
    ));
  } else if (fx === 'miasma') {
    parts = (
      <>
        <span className="pf p-pulse" />
        {[0, 1].map((i) => <span key={i} className="pf p-wisp" style={{ left: `${28 + i * 38}%`, animationDelay: `-${i * 0.8}s` }} />)}
      </>
    );
  }

  return <span className={'pill-fx pfx-' + fx} aria-hidden="true">{parts}</span>;
};

export default PillFX;
