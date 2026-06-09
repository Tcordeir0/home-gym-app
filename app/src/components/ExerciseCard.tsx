import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, chevronDown } from 'ionicons/icons';
import { motion } from 'framer-motion';
import type { Exercise } from '../data/types';
import { DEMOS } from '../data/demos';
import './ExerciseCard.css';

interface SetRow {
  kg: string;
  reps: string;
  done: boolean;
}

interface Props {
  ex: Exercise;
  onDemo: (ex: Exercise) => void;
}

const ExerciseCard: React.FC<Props> = ({ ex, onDemo }) => {
  const [sets, setSets] = useState<SetRow[]>(
    Array.from({ length: ex.series }, () => ({ kg: '', reps: '', done: false }))
  );
  const [openTip, setOpenTip] = useState(false);
  const hasDemo = !!DEMOS[ex.nome];
  const doneCount = sets.filter((s) => s.done).length;

  const upd = (i: number, patch: Partial<SetRow>) =>
    setSets((arr) => arr.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  return (
    <div className={'ex-card' + (doneCount === sets.length ? ' complete' : '')}>
      <div className="ex-head">
        <div className="ex-info">
          <h3 className="ex-name">{ex.nome}</h3>
          <span className="ex-muscle">{ex.musculo}</span>
        </div>
        <span className="ex-reps">
          {ex.series}<span className="x">×</span>{ex.reps}
        </span>
      </div>

      <div className="ex-actions">
        <button className="ex-tip-btn" onClick={() => setOpenTip((v) => !v)}>
          <IonIcon icon={chevronDown} className={'chev' + (openTip ? ' open' : '')} /> Dica
        </button>
        {hasDemo && (
          <button className="ex-demo-btn" onClick={() => onDemo(ex)}>
            <IonIcon icon={eyeOutline} /> Demo
          </button>
        )}
      </div>
      {openTip && <p className="ex-tip">{ex.dica}</p>}

      <div className="ex-sets">
        {sets.map((s, i) => (
          <div className={'set-row' + (s.done ? ' done' : '')} key={i}>
            <span className="set-n">{i + 1}</span>
            <input
              className="set-in"
              inputMode="decimal"
              placeholder="kg"
              value={s.kg}
              onChange={(e) => upd(i, { kg: e.target.value })}
            />
            <span className="set-x">×</span>
            <input
              className="set-in"
              inputMode="numeric"
              placeholder="reps"
              value={s.reps}
              onChange={(e) => upd(i, { reps: e.target.value })}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="set-done"
              aria-label="Marcar série"
              onClick={() => upd(i, { done: !s.done })}
            >
              ✓
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseCard;
