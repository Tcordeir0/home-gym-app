import { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons } from '@ionic/react';
import type { ReactNode } from 'react';
import type { ScrollDetail } from '@ionic/core';
import ProfileBar from './ProfileBar';
import './AppPage.css';

interface Props {
  title: string;
  brand?: boolean;
  /** Elemento opcional no canto superior direito do header (ex.: anel de nível no Treino). */
  accessory?: ReactNode;
  children?: ReactNode;
}

/** Casca de página estilo iOS: large title que colapsa ao rolar.
 *  A barra de cima fica TRANSPARENTE no topo (só o large title aparece) e vira
 *  uma barra frosted com o nome da página assim que o usuário rola. */
const AppPage: React.FC<Props> = ({ title, brand, accessory, children }) => {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e: CustomEvent<ScrollDetail>) => {
    const s = e.detail.scrollTop > 44;
    setScrolled((prev) => (prev === s ? prev : s));
  };

  return (
    <IonPage>
      <IonHeader className={'app-topbar' + (scrolled ? ' is-scrolled' : '')}>
        <IonToolbar>
          <IonTitle>{brand ? 'Home Gym' : title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen scrollEvents onIonScroll={onScroll}>
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
};

export default AppPage;
