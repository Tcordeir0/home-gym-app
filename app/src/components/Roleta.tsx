import { useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { star, snow, colorPalette, sparkles, diamond } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { PRIZES, type Prize } from '../data/roulette';
import './Roleta.css';

const N = PRIZES.length;
const SEG = 360 / N;
const SEG_BG = ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)'];

function iconFor(p: Prize) {
  if (p.kind === 'freeze') return snow;
  if (p.kind === 'theme') return colorPalette;
  if (p.kind === 'deco') return sparkles;
  return p.value >= 50 ? diamond : star;
}

const GRAD = `conic-gradient(${PRIZES.map((_, i) => `${SEG_BG[i % 2]} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(',')})`;

interface Props {
  spins: number;
  onSpin: () => { prize: Prize; index: number } | null;
  onResult: (prize: Prize) => void;
}

const Roleta: React.FC<Props> = ({ spins, onSpin, onResult }) => {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotRef = useRef(0);

  const spin = () => {
    if (spinning || spins <= 0) return;
    const spun = onSpin();
    if (!spun) return;
    const { prize, index } = spun;
    setSpinning(true);
    const target = index * SEG + SEG / 2; // centro do segmento (do topo, horário)
    const finalRot = rotRef.current + 360 * 5;
    const cur = ((finalRot % 360) + 360) % 360;
    const need = ((-target % 360) + 360) % 360;
    let adj = need - cur;
    if (adj < 0) adj += 360;
    rotRef.current = finalRot + adj;
    setRot(rotRef.current);
    window.setTimeout(() => { setSpinning(false); onResult(prize); }, 3700);
  };

  return (
    <div className="rol2">
      <div className="rol2-stage">
        <div className="rol2-pointer" />
        <div className="rol2-wheel" style={{ transform: `rotate(${rot}deg)`, background: GRAD }}>
          {PRIZES.map((p, i) => (
            <span key={i} className="rol2-ico" style={{ transform: `rotate(${i * SEG + SEG / 2}deg) translateY(-86px)` }}>
              <IonIcon icon={iconFor(p)} />
            </span>
          ))}
          <span className="rol2-hub" />
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.96 }} className="rol2-go" disabled={spinning || spins <= 0} onClick={spin}>
        {spins > 0 ? (spinning ? 'Girando…' : `Girar · ${spins} ${spins === 1 ? 'giro' : 'giros'}`) : 'Sem giros — junte 100 pts'}
      </motion.button>
    </div>
  );
};

export default Roleta;
