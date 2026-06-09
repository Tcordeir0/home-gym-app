import { IonButton } from '@ionic/react';
import { useStore } from '../store/store';
import { totalPoints, levelInfo } from '../lib/stats';
import './LevelBadge.css';

const R = 19;
const C = 2 * Math.PI * R;

/** Anel de nível compacto no header, ligado ao XP do perfil ativo. Toca → Progresso. */
const LevelBadge: React.FC = () => {
  const active = useStore((s) => s.active);
  const scores = useStore((s) => s.scores);
  const pts = totalPoints({ scores }, active);
  const lvl = levelInfo(pts);

  return (
    <IonButton className="lvl-badge" fill="clear" routerLink="/progresso" aria-label={`Nível ${lvl.level} — ${lvl.pct}% para o próximo`}>
      <span className="lvlb-wrap">
        <svg viewBox="0 0 44 44" width="38" height="38">
          <circle cx="22" cy="22" r={R} className="lvlb-bg" />
          <circle
            cx="22" cy="22" r={R} className="lvlb-fg"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - lvl.pct / 100)}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <span className="lvlb-num">{lvl.level}</span>
      </span>
    </IonButton>
  );
};

export default LevelBadge;
