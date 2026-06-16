import { useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonToast, useIonRouter } from '@ionic/react';
import { motion } from 'framer-motion';
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

type Seg = string; // 'A'..'E' | 'warm'
const WORKOUT_LETTERS = ['A', 'B', 'C', 'D', 'E'];
// rótulos padrão derivados (A–E) — sem hardcoded incompleto
const DEFAULT_LABELS: Record<string, string> = { warm: 'Aquec.', ...Object.fromEntries(WORKOUT_LETTERS.map((k) => [k, `Treino ${k}`])) };

const Treino: React.FC = () => {
  const profile = useActiveProfile();
  const router = useIonRouter();
  const custom = profile.treinos as Record<string, Exercise[]> | undefined;
  // perfil novo (nunca gerou treino) → tela guiada em vez de um plano genérico
  const hasPlan = !!(custom && custom.A);
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

  // segmentos = treinos presentes (A..E) + aquecimento (opcional)
  const workoutSegs = WORKOUT_LETTERS.filter((k) => plan.treinos[k]?.length);
  const warmOn = profile.warmupOn !== false;
  const segs: Seg[] = warmOn ? [...workoutSegs, 'warm'] : workoutSegs;
  // se o segmento ativo sumiu (ex.: trocou pra 3 dias), volta pro A
  const safeSeg: Seg = segs.includes(seg) ? seg : (segs[0] || 'A');

  const swaps = useStore((s) => s.swaps[s.active]);
  const baseExs: Exercise[] = (safeSeg === 'warm' ? AQUECIMENTO : plan.treinos[safeSeg]) || [];
  // aplica trocas de exercício salvas (mesma ênfase) por posição
  const exercises: Exercise[] = safeSeg === 'warm' ? baseExs : baseExs.map((ex, i) => swaps?.[`${safeSeg}:${i}`] || ex);
  const labels = plan.labels || DEFAULT_LABELS;

  // nome descritivo do dia (ex.: "Glúteos + Posterior"); cai pro foco quando o rótulo é genérico
  const generic = !labels[safeSeg] || labels[safeSeg] === `Treino ${safeSeg}`;
  const dayName =
    safeSeg === 'warm'
      ? labels.warm && labels.warm !== 'Aquec.' ? labels.warm : 'Prepara o corpo'
      : generic ? `Foco: ${plan.focus}` : (labels[safeSeg] as string);

  // progresso do treino atual
  let done = 0;
  let total = 0;
  exercises.forEach((ex, i) => {
    total += ex.series;
    done += rowsFor(setlog as never, active, safeSeg, i, ex.series).filter((r) => r.done).length;
  });
  const pct = total ? Math.round((done / total) * 100) : 0;

  const onComplete = () => {
    const r = completeWorkout(safeSeg, exercises);
    if (r === 'dup') setToast('Você já registrou este treino hoje 💪');
    else if (r === 'empty') setToast('Marque ao menos uma série feita');
    else { fxSuccess(); setToast('Treino concluído! Pontos creditados 🎉'); }
  };

  return (
    <AppPage title="Treino" brand accessory={<><Social /><LevelBadge /></>}>
      <TreinoBanner />

      {!hasPlan ? (
        <div className="treino-onboard">
          <div className="treino-onboard-emoji">🏋️</div>
          <h2 className="treino-onboard-h">Monte seu primeiro treino</h2>
          <p className="treino-onboard-p">
            Você ainda não tem uma ficha. No <b>Perfil → Montar treino</b> você escolhe
            <b> equipamento</b>, <b>foco</b> e quantos <b>dias</b> por semana — e o app gera seu
            A–E automático, já com os acessórios da sua <b>meta de shape</b>.
          </p>
          <motion.button whileTap={{ scale: 0.97 }} className="ds-btn ds-btn--primary treino-onboard-btn" onClick={() => router.push('/perfil', 'forward')}>
            ⚙️ Montar treino agora
          </motion.button>
          <p className="treino-onboard-sub">
            🍽️ Na aba <b>Dieta</b>: preencha <b>sexo, idade e altura</b> no Perfil pra ver suas metas
            (calorias, proteína, IMC). Depois é só registrar o que comeu e a água do dia.
          </p>
        </div>
      ) : (
      <>
      <IonSegment
        className="treino-seg"
        value={safeSeg}
        onIonChange={(e) => setSeg(e.detail.value as Seg)}
        scrollable
      >
        {segs.map((k) => (
          <IonSegmentButton key={k} value={k}>
            <IonLabel>{k === 'warm' ? 'Aquec.' : `Treino ${k}`}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>

      <div className="treino-top">
        <span className="treino-focus">{dayName}</span>
        {safeSeg !== 'warm' && <span className="treino-pct">{pct}%</span>}
      </div>
      {safeSeg !== 'warm' && (
        <div className="treino-bar">
          <span style={{ width: pct + '%' }} />
        </div>
      )}

      {exercises.map((ex, i) => (
        <ExerciseCard key={safeSeg + i} ex={ex} treino={safeSeg} exIdx={i} onDemo={setDemo} />
      ))}

      {/* Cardio integrado ao treino (faz parte do A–E; não aparece no aquecimento) */}
      {safeSeg !== 'warm' && <Cardio onDone={(l) => setToast(l + ' registrado! +30 pts 🎉')} />}

      {safeSeg !== 'warm' && (
        <motion.button whileTap={{ scale: 0.97 }} className="ds-btn ds-btn--primary treino-done" onClick={onComplete}>
          Concluir Treino {safeSeg}
        </motion.button>
      )}

      <p className="treino-gen-hint">⚙️ Pra montar treino por equipamento, vá no <b>Perfil › Montar treino</b>.</p>
      </>
      )}

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
