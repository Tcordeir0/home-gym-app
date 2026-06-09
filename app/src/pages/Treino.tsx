import { useState } from 'react';
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import AppPage from '../components/AppPage';
import ExerciseCard from '../components/ExerciseCard';
import DemoSheet from '../components/DemoSheet';
import { useActiveProfile } from '../store/store';
import { PLANS, AQUECIMENTO } from '../data/plans';
import type { Exercise } from '../data/types';
import './Treino.css';

type Seg = 'A' | 'B' | 'C' | 'warm';

const Treino: React.FC = () => {
  const profile = useActiveProfile();
  const plan = PLANS[profile.id] || PLANS['u1'];
  const [seg, setSeg] = useState<Seg>('A');
  const [demo, setDemo] = useState<Exercise | null>(null);

  const exercises: Exercise[] = seg === 'warm' ? AQUECIMENTO : plan.treinos[seg];
  const labels = plan.labels || { A: 'Treino A', B: 'Treino B', C: 'Treino C', warm: 'Aquec.' };

  return (
    <AppPage title="Treino" brand>
      <IonSegment
        className="treino-seg"
        value={seg}
        onIonChange={(e) => setSeg(e.detail.value as Seg)}
        scrollable
      >
        {(['A', 'B', 'C', 'warm'] as Seg[]).map((k) => (
          <IonSegmentButton key={k} value={k}>
            <IonLabel>{k === 'warm' ? 'Aquec.' : labels[k] || `Treino ${k}`}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>

      <p className="treino-focus">
        {seg === 'warm' ? 'Prepara o corpo · mobilidade geral' : `Foco: ${plan.focus}`}
      </p>

      {exercises.map((ex, i) => (
        <ExerciseCard key={seg + i} ex={ex} onDemo={setDemo} />
      ))}

      <DemoSheet ex={demo} onClose={() => setDemo(null)} />
    </AppPage>
  );
};

export default Treino;
