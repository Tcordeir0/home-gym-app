import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, chevronDown, flame } from 'ionicons/icons';
import { motion } from 'framer-motion';
import type { Exercise } from '../data/types';
import { useStore, rowsFor } from '../store/store';
import { fxTick } from '../lib/feedback';
import './ExerciseCard.css';

interface Props {
  ex: Exercise;
  treino: string;
  exIdx: number;
  onDemo: (ex: Exercise) => void;
}

const ExerciseCard: React.FC<Props> = ({ ex, treino, exIdx, onDemo }) => {
  const active = useStore((s) => s.active);
  const setlog = useStore((s) => s.setlog);
  const setSetField = useStore((s) => s.setSetField);
  const toggleSetDone = useStore((s) => s.toggleSetDone);
  const lastBestSet = useStore((s) => s.lastBestSet);

  const [openTip, setOpenTip] = useState(false);
  const rows = rowsFor(setlog as never, active, treino, exIdx, ex.series);
  const doneCount = rows.filter((s) => s.done).length;
  const last = lastBestSet(ex.nome);

  return (
    <div className={'ex-card' + (doneCount === rows.length ? ' complete' : '')}>
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
        <button className="ex-demo-btn" onClick={() => onDemo(ex)}>
          <IonIcon icon={eyeOutline} /> Demo
        </button>
      </div>
      {openTip && <p className="ex-tip">{ex.dica}</p>}

      {last && last.kg > 0 && (
        <p className="ex-last">
          <IonIcon icon={flame} /> Última vez: <b>{last.kg}kg × {last.reps}</b> — supera!
        </p>
      )}

      <div className="ex-sets">
        {rows.map((s, i) => (
          <div className={'set-row' + (s.done ? ' done' : '')} key={i}>
            <span className="set-n">{i + 1}</span>
            <input
              className="set-in"
              inputMode="decimal"
              placeholder={last && last.kg > 0 ? String(last.kg) : 'kg'}
              value={s.kg}
              onChange={(e) => setSetField(treino, exIdx, i, 'kg', e.target.value, ex.series)}
            />
            <span className="set-x">×</span>
            <input
              className="set-in"
              inputMode="numeric"
              placeholder={last && last.reps > 0 ? String(last.reps) : 'reps'}
              value={s.reps}
              onChange={(e) => setSetField(treino, exIdx, i, 'reps', e.target.value, ex.series)}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="set-done"
              aria-label="Marcar série"
              onClick={() => { if (!s.done) fxTick(); toggleSetDone(treino, exIdx, i, ex.series); }}
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
