import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from '@ionic/react';
import type { ReactNode } from 'react';
import ProfileBar from './ProfileBar';
import LevelBadge from './LevelBadge';

interface Props {
  title: string;
  brand?: boolean;
  children?: ReactNode;
}

/** Casca de página estilo iOS: large title que colapsa ao rolar. */
const AppPage: React.FC<Props> = ({ title, brand, children }) => (
  <IonPage>
    <IonHeader translucent>
      <IonToolbar>
        <IonTitle>{brand ? 'Home Gym' : title}</IonTitle>
        <IonButtons slot="end">
          <LevelBadge />
        </IonButtons>
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
        </IonToolbar>
      </IonHeader>
      <ProfileBar />
      <div className="page-body">{children}</div>
    </IonContent>
  </IonPage>
);

export default AppPage;
