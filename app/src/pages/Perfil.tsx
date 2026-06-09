import { IonCard, IonCardContent } from '@ionic/react';
import AppPage from '../components/AppPage';

const Perfil: React.FC = () => (
  <AppPage title="Perfil">
    <IonCard className="hero-card">
      <IonCardContent>
        <h2 className="card-title">Perfil</h2>
        <p className="card-sub">
          Editar perfil (nome, foto, cor, equipamento), conta e ajustes, sincronização,
          notificações e agenda. Perfil ativo por aparelho.
        </p>
      </IonCardContent>
    </IonCard>
  </AppPage>
);

export default Perfil;
