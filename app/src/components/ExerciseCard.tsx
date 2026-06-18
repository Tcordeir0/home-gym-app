import { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, chevronDown, trophyOutline, trendingUp, swapHorizontalOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import type { Exercise } from '../data/types';
import { useStore, rowsFor } from '../store/store';
import { alternativesFor, isBodyweight } from '../lib/generator';
import { emphasisOf } from '../lib/emphasis';
import { e1RM } from '../lib/stats';
import { fxTick } from '../lib/feedback';
import './ExerciseCard.css';

interface Props {
  ex: Exercise;
  treino: string;
  exIdx: number;
  onDemo: (ex: Exercise) => void;
  locked?: boolean; // rotação guiada: treino concluído na rodada → só leitura
}

const ExerciseCard: React.FC<Props> = ({ ex, treino, exIdx, onDemo, locked }) => {
  const active = useStore((s) => s.active);
  const setlog = useStore((s) => s.setlog);
  const setSetField = useStore((s) => s.setSetField);
  const toggleSetDone = useStore((s) => s.toggleSetDone);
  const cycleSetRir = useStore((s) => s.cycleSetRir);
  const prevSets = useStore((s) => s.prevSets);
  const exPR = useStore((s) => s.exPR);
  const prefillSets = useStore((s) => s.prefillSets);
  const swapExercise = useStore((s) => s.swapExercise);
  const equip = useStore((s) => s.users.find((u) => u.id === s.active)?.equipment || []);
  const restOn = useStore((s) => s.users.find((u) => u.id === s.active)?.restTimer?.on);
  const latestMeasure = useStore((s) => s.latestMeasure);

  // exercício corporal (sem carga): o app usa o PESO DO PERFIL no lugar de pedir kg na mão.
  const bw = isBodyweight(ex.nome);
  const bodyWeight = bw ? latestMeasure('weight') : null;

  const [openTip, setOpenTip] = useState(false);
  const [openSwap, setOpenSwap] = useState(false);
  const alts = openSwap ? alternativesFor(ex.nome, equip) : [];
  const rows = rowsFor(setlog as never, active, treino, exIdx, ex.series);
  const doneCount = rows.filter((s) => s.done).length;
  const prev = prevSets(ex.nome);
  const pr = exPR(ex.nome);
  const emp = emphasisOf(ex.nome);

  // pré-preenche os campos (só quando tudo vazio): a ÚLTIMA vez quando há histórico;
  // senão, em exercício corporal, já põe o peso do perfil como carga (base pra progredir).
  useEffect(() => {
    const allEmpty = rows.every((r) => !r.kg && !r.reps && !r.done);
    if (!allEmpty) return;
    if (prev.length) prefillSets(treino, exIdx, ex.series, prev);
    else if (bw && bodyWeight) prefillSets(treino, exIdx, ex.series, Array.from({ length: ex.series }, () => ({ kg: bodyWeight, reps: 0 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, treino, exIdx, prev.length, bw, bodyWeight]);

  // melhor 1RM estimado do que está na tela agora (digitado) → 1RM ao vivo + bater recorde
  const liveTop = rows.reduce((m, r) => {
    const v = e1RM(parseFloat(r.kg) || 0, parseInt(r.reps, 10) || 0);
    return v > m ? v : m;
  }, 0);
  const beatingPR = liveTop > 0 && (!pr || liveTop > pr.e1rm);

  // Sugestão de progressão (overload): a partir da ÚLTIMA sessão (prev) + faixa de reps alvo.
  // Se na última você bateu as reps prescritas em todas as séries → sobe a carga (+2,5 kg);
  // senão, mantém a carga e mira fechar as reps. Em exercício corporal, progride em reps.
  const fmtKg = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));
  const topReps = Math.max(0, ...(String(ex.reps).match(/\d+/g) || []).map(Number));
  const target = (() => {
    if (!prev.length || !topReps || doneCount === rows.length) return null;
    const hit = prev.every((p) => p.reps >= topReps); // bateu a prescrição na última vez
    if (bw) return hit ? `Alvo: ${topReps + 1} reps — supere a última` : `Alvo: feche as ${topReps} reps`;
    const best = prev.reduce((m, p) => (p.kg > m.kg ? p : m), prev[0]);
    if (best.kg <= 0) return null;
    if (hit) return `Alvo: ${fmtKg(Math.round((best.kg + 2.5) * 2) / 2)} kg × ${topReps} (+2,5 kg)`;
    return `Alvo: ${fmtKg(best.kg)} kg × ${topReps} — feche as reps`;
  })();

  return (
    <div className={'ex-card' + (doneCount === rows.length ? ' complete' : '') + (locked ? ' locked' : '')}>
      <div className="ex-head">
        <div className="ex-info">
          <h3 className="ex-name">{ex.nome}</h3>
          <span className="ex-muscle">{ex.musculo}{emp ? <span className="ex-emph"> · {emp.label}</span> : null}{bw ? <span className="ex-emph"> · peso do corpo</span> : null}</span>
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
            <p className="ex-swap-empty">Sem variação equivalente pra essa ênfase.</p>
          ) : (
            alts.map((a) => (
              <div key={a.nome} className={'ex-swap-opt' + (a.owned ? '' : ' borrow')}>
                <button className="ex-swap-pick" onClick={() => { swapExercise(treino, exIdx, a); setOpenSwap(false); }}>
                  <span className="ex-swap-n">
                    {a.nome}
                    <span className="ex-swap-tags">
                      {emphasisOf(a.nome) && <span className="ex-swap-emph">{emphasisOf(a.nome)!.label}</span>}
                      {!a.owned && <span className="ex-swap-eq">{a.equipLabel}</span>}
                    </span>
                  </span>
                  <span className="ex-swap-r">{a.series}×{a.reps}</span>
                </button>
                <button className="ex-swap-demo" aria-label={'Ver demonstração de ' + a.nome} onClick={() => onDemo(a)}>
                  <IonIcon icon={eyeOutline} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 1RM/recorde não faz sentido em exercício corporal (o "peso" é o corpo) — esconde */}
      {!bw && (pr || liveTop > 0) && (
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

      {target && (
        <div className="ex-target"><IonIcon icon={trendingUp} /> {target}</div>
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
                placeholder={p?.kg ? String(p.kg) : bodyWeight ? String(bodyWeight) : 'kg'}
                value={s.kg}
                onChange={(e) => setSetField(treino, exIdx, i, 'kg', e.target.value, ex.series)}
                readOnly={locked}
              />
              <span className="set-x">×</span>
              <input
                className="set-in"
                inputMode="numeric"
                placeholder={p?.reps ? String(p.reps) : 'reps'}
                value={s.reps}
                onChange={(e) => setSetField(treino, exIdx, i, 'reps', e.target.value, ex.series)}
                readOnly={locked}
              />
              <motion.button
                whileTap={{ scale: 0.88 }}
                className="set-done"
                aria-label="Marcar série"
                disabled={locked}
                onClick={() => { if (locked) return; if (!s.done) { fxTick(); if (restOn) window.dispatchEvent(new CustomEvent('hg:set-done')); } toggleSetDone(treino, exIdx, i, ex.series); }}
              >
                ✓
              </motion.button>
              {/* RIR (reps em reserva) só aparece DEPOIS de marcar — é quando faz sentido avaliar a série */}
              {s.done && (
                <button
                  className={'set-rir' + (s.rir !== undefined ? ` on rir-${s.rir <= 1 ? 'hard' : s.rir >= 3 ? 'easy' : 'mid'}` : '')}
                  disabled={locked}
                  aria-label="Reps em reserva (RIR) — quão perto da falha"
                  title="RIR: reps que ainda sobravam (0 = falha total). Toque pra ciclar."
                  onClick={() => { if (!locked) cycleSetRir(treino, exIdx, i, ex.series); }}
                >
                  {s.rir !== undefined ? `RIR ${s.rir}` : 'RIR'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseCard;
