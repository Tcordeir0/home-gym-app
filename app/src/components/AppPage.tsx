import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from '@ionic/react';
import type { ReactNode } from 'react';
import ProfileBar from './ProfileBar';

interface Props {
  title: string;
  brand?: boolean;
  /** Elemento opcional no canto superior direito do header (ex.: anel de nível no Treino). */
  accessory?: ReactNode;
  children?: ReactNode;
}

/** Casca de página estilo iOS: large title que colapsa ao rolar. */
const AppPage: React.FC<Props> = ({ title, brand, accessory, children }) => (
  <IonPage>
    <IonHeader translucent>
      <IonToolbar>
        <IonTitle>{brand ? 'Home Gym' : title}</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent fullscreen>
      <IonHeader collapse="condense">
        <IonToolbar>
          <IonTitle size="large">
            {brand ? (
              <span className="brand">
                HOME <span className="brand-hl">GYM</span>
              </span>
            ) : (
              title
            )}
          </IonTitle>
          {accessory && (
            <IonButtons slot="end" className="header-accessory">
              {accessory}
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <ProfileBar />
      <div className="page-body">{children}</div>
    </IonContent>
  </IonPage>
);

export default AppPage;
