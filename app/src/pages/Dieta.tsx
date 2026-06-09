import { IonCard, IonCardContent } from '@ionic/react';
import AppPage from '../components/AppPage';

const Dieta: React.FC = () => (
  <AppPage title="Dieta">
    <IonCard className="hero-card">
      <IonCardContent>
        <h2 className="card-title">Dieta</h2>
        <p className="card-sub">
          Calculadora de calorias, IMC + % gordura, balança, hidratação, diário de alimentos
          (BR+PT) e foto do prato com IA. Tudo por perfil.
        </p>
      </IonCardContent>
    </IonCard>
  </AppPage>
);

export default Dieta;
