import { IonCard, IonCardContent } from '@ionic/react';
import AppPage from '../components/AppPage';

const Progresso: React.FC = () => (
  <AppPage title="Progresso">
    <IonCard className="hero-card">
      <IonCardContent>
        <h2 className="card-title">Progresso</h2>
        <p className="card-sub">
          Histórico, calendário, sequência, conquistas, medidas, foto de progresso e gráficos
          animados de evolução.
        </p>
      </IonCardContent>
    </IonCard>
  </AppPage>
);

export default Progresso;
