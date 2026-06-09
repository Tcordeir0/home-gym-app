import { IonCard, IonCardContent } from '@ionic/react';
import AppPage from '../components/AppPage';

const Premios: React.FC = () => (
  <AppPage title="Prêmios">
    <IonCard className="hero-card">
      <IonCardContent>
        <h2 className="card-title">Prêmios</h2>
        <p className="card-sub">
          Nível e XP, desafios da semana, roletas, temas com arte única e decorações de avatar.
        </p>
      </IonCardContent>
    </IonCard>
  </AppPage>
);

export default Premios;
