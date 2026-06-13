import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, chevronDown, trophyOutline, trendingUp, swapHorizontalOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import type { Exercise } from '../data/types';
import { useStore, rowsFor } from '../store/store';
import { alternativesFor } from '../lib/generator';
import { e1RM } from '../lib/stats';
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
  const prevSets = useStore((s) => s.prevSets);
  const exPR = useStore((s) => s.exPR);
  const prefillSets = useStore((s) => s.prefillSets);
  const swapExercise = useStore((s) => s.swapExercise);
  const equip = useStore((s) => s.users.find((u) => u.id === s.active)?.equipment || []);

  const [openTip, setOpenTip] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const alts = openSwap ? alternativesFor(ex.nome, equip) : [];
  const rows = rowsFor(setlog as never, active, treino, exIdx, ex.series);
  const doneCount = rows.filter((s) => s.done).length;
  const prev = prevSets(ex.nome);
  const pr = exPR(ex.nome);

  // pré-preenche os campos com a ÚLTIMA vez (só quando tudo vazio) — base pra progredir
  useEffect(() => {
    const allEmpty = rows.every((r) => !r.kg && !r.reps && !r.done);
    if (allEmpty && prev.length) prefillSets(treino, exIdx, ex.series, prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, treino, exIdx, prev.length]);

  // melhor 1RM estimado do que está na tela agora (digitado) → 1RM ao vivo + bater recorde
  const liveTop = rows.reduce((m, r) => {
    const v = e1RM(parseFloat(r.kg) || 0, parseInt(r.reps, 10) || 0);
    return v > m ? v : m;
  }, 0);
  const beatingPR = liveTop > 0 && (!pr || liveTop > pr.e1rm);

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
        <button className="ex-tip-btn" onClick={() => setOpenSwap((v) => !v)}>
          <IonIcon icon={swapHorizontalOutline} /> Trocar
        </button>
      </div>
      {openTip && <p className="ex-tip">{ex.dica}</p>}
      {openSwap && (
        <div className="ex-swap">
          {alts.length === 0 ? (
            <p className="ex-swap-empty">Sem variação equivalente pro teu equipamento.</p>
          ) : (
            alts.map((a) => (
              <button key={a.nome} className="ex-swap-opt" onClick={() => { swapExercise(treino, exIdx, a); setOpenSwap(false); }}>
                <span className="ex-swap-n">{a.nome}</span>
                <span className="ex-swap-r">{a.series}×{a.reps}</span>
              </button>
            ))
          )}
        </div>
      )}

      {(pr || liveTop > 0) && (
        <div className="ex-stats">
          {pr && (
            <span className="ex-stat">
              <IonIcon icon={trophyOutline} /> Recorde <b>{pr.kg}kg×{pr.reps}</b>
              <small> · 1RM ~{pr.e1rm}kg</small>
            </span>
          )}
          {liveTop > 0 && !beatingPR && (
            <span className="ex-stat live"><IonIcon icon={trendingUp} /> 1RM agora ~{liveTop}kg</span>
          )}
          {beatingPR && (
            <span className="ex-pr-flag"><IonIcon icon={trendingUp} /> Batendo o recorde! ~{liveTop}kg</span>
          )}
        </div>
      )}

      <div className="ex-sets">
        {rows.map((s, i) => {
          const p = prev[i];
          return (
            <div className={'set-row' + (s.done ? ' done' : '')} key={i}>
              <span className="set-n">{i + 1}</span>
              <input
                className="set-in"
                inputMode="decimal"
                placeholder={p?.kg ? String(p.kg) : 'kg'}
                value={s.kg}
                onChange={(e) => setSetField(treino, exIdx, i, 'kg', e.target.value, ex.series)}
              />
              <span className="set-x">×</span>
              <input
                className="set-in"
                inputMode="numeric"
                placeholder={p?.reps ? String(p.reps) : 'reps'}
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
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseCard;
