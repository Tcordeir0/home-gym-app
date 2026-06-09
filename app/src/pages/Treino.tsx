import { IonCard, IonCardContent } from '@ionic/react';
import AppPage from '../components/AppPage';

const Treino: React.FC = () => (
  <AppPage title="Treino" brand>
    <IonCard className="hero-card">
      <IonCardContent>
        <h2 className="card-title">Treino</h2>
        <p className="card-sub">
          Fichas A/B/C + aquecimento, séries com kg × reps, progressão, cardio e gerador de treino.
          Migrando do v1 contra o PARITY.md — sem perder nada.
        </p>
      </IonCardContent>
    </IonCard>
  </AppPage>
);

export default Treino;
