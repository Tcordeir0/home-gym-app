import { useIonRouter } from '@ionic/react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { totalPoints, levelInfo } from '../lib/stats';
import './LevelBadge.css';

const R = 26;
const C = 2 * Math.PI * R;

/** Anel de nível (resumo do progresso) — só no Treino, por perfil. Toca → Progresso. */
const LevelBadge: React.FC = () => {
  const router = useIonRouter();
  const active = useStore((s) => s.active);
  const scores = useStore((s) => s.scores);
  const pts = totalPoints({ scores }, active);
  const lvl = levelInfo(pts);

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      className="lvl-badge"
      onClick={() => router.push('/progresso', 'none')}
      aria-label={`Nível ${lvl.level} — ${lvl.pct}% para o próximo`}
    >
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <circle cx="30" cy="30" r="29" className="lvlb-disc" />
        <circle cx="30" cy="30" r={R} className="lvlb-bg" />
        <circle
          cx="30" cy="30" r={R} className="lvlb-fg"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - lvl.pct / 100)}
          transform="rotate(-90 30 30)"
        />
      </svg>
      <span className="lvlb-num">{lvl.level}</span>
      <span className="lvlb-cap">nível</span>
    </motion.button>
  );
};

export default LevelBadge;
