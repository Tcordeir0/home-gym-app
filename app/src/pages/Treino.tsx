import { useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonToast } from '@ionic/react';
import { motion } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import AppPage from '../components/AppPage';
import ExerciseCard from '../components/ExerciseCard';
import DemoSheet from '../components/DemoSheet';
import Cardio from '../components/Cardio';
import LevelBadge from '../components/LevelBadge';
import Social from '../components/Social';
import TreinoBanner from '../components/TreinoBanner';
import { fxSuccess } from '../lib/feedback';
import { useStore, useActiveProfile, rowsFor } from '../store/store';
import { PLANS, AQUECIMENTO } from '../data/plans';
import type { Exercise } from '../data/types';
import './Treino.css';

type Seg = 'A' | 'B' | 'C' | 'warm';
const DEFAULT_LABELS = { A: 'Treino A', B: 'Treino B', C: 'Treino C', warm: 'Aquec.' };

const Treino: React.FC = () => {
  const profile = useActiveProfile();
  const custom = profile.treinos as Record<string, Exercise[]> | undefined;
  const plan =
    custom && custom.A
      ? { focus: profile.focus || 'Geral', labels: (profile.labels as Record<string, string>) || DEFAULT_LABELS, treinos: custom }
      : PLANS[profile.id] || PLANS['u1'];
  const active = useStore((s) => s.active);
  const setlog = useStore((s) => s.setlog);
  const completeWorkout = useStore((s) => s.completeWorkout);
  const [seg, setSeg] = useState<Seg>('A');
  const [demo, setDemo] = useState<Exercise | null>(null);
  const [toast, setToast] = useState('');
  const [listRef] = useAutoAnimate<HTMLDivElement>();

  const exercises: Exercise[] = seg === 'warm' ? AQUECIMENTO : plan.treinos[seg];
  const labels = plan.labels || { A: 'Treino A', B: 'Treino B', C: 'Treino C', warm: 'Aquec.' };

  // nome descritivo do dia (ex.: "Glúteos + Posterior"); cai pro foco quando o rótulo é genérico
  const generic = !labels[seg] || labels[seg] === `Treino ${seg}`;
  const dayName =
    seg === 'warm'
      ? labels.warm && labels.warm !== 'Aquec.' ? labels.warm : 'Prepara o corpo'
      : generic ? `Foco: ${plan.focus}` : (labels[seg] as string);

  // progresso do treino atual
  let done = 0;
  let total = 0;
  exercises.forEach((ex, i) => {
    total += ex.series;
    done += rowsFor(setlog as never, active, seg, i, ex.series).filter((r) => r.done).length;
  });
  const pct = total ? Math.round((done / total) * 100) : 0;

  const onComplete = () => {
    const r = completeWorkout(seg, exercises);
    if (r === 'dup') setToast('Você já registrou este treino hoje 💪');
    else if (r === 'empty') setToast('Marque ao menos uma série feita');
    else { fxSuccess(); setToast('Treino concluído! Pontos creditados 🎉'); }
  };

  return (
    <AppPage title="Treino" brand accessory={<><Social /><LevelBadge /></>}>
      <TreinoBanner />
      <IonSegment
        className="treino-seg"
        value={seg}
        onIonChange={(e) => setSeg(e.detail.value as Seg)}
        scrollable
      >
        {(['A', 'B', 'C', 'warm'] as Seg[]).map((k) => (
          <IonSegmentButton key={k} value={k}>
            <IonLabel>{k === 'warm' ? 'Aquec.' : `Treino ${k}`}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>

      <Cardio onDone={(l) => setToast(l + ' registrado! +30 pts 🎉')} />

      <div className="treino-top">
        <span className="treino-focus">{dayName}</span>
        {seg !== 'warm' && <span className="treino-pct">{pct}%</span>}
      </div>
      {seg !== 'warm' && (
        <div className="treino-bar">
          <span style={{ width: pct + '%' }} />
        </div>
      )}

      <div ref={listRef}>
        {exercises.map((ex, i) => (
          <ExerciseCard key={seg + i} ex={ex} treino={seg} exIdx={i} onDemo={setDemo} />
        ))}
      </div>

      {seg !== 'warm' && (
        <motion.button whileTap={{ scale: 0.97 }} className="treino-done" onClick={onComplete}>
          Concluir Treino {seg}
        </motion.button>
      )}

      <p className="treino-gen-hint">⚙️ Pra montar treino por equipamento, vá no <b>Perfil › Montar treino</b>.</p>

      <DemoSheet ex={demo} onClose={() => setDemo(null)} />
      <IonToast
        isOpen={!!toast}
        message={toast}
        duration={2400}
        onDidDismiss={() => setToast('')}
        position="top"
      />
    </AppPage>
  );
};

export default Treino;
