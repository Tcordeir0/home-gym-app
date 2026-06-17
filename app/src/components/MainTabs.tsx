import { memo } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { barbell, restaurant, trendingUp, sparkles, person } from 'ionicons/icons';
import { useStore, ownsActive } from '../store/store';
import Treino from '../pages/Treino';
import Dieta from '../pages/Dieta';
import Progresso from '../pages/Progresso';
import Premios from '../pages/Premios';
import Perfil from '../pages/Perfil';

/**
 * Casca de navegação (router + tabs) ISOLADA do App.
 *
 * Por que separar: o App assina muitas fatias do store (tema, sync, feedback, volume,
 * visibility…) e re-renderiza a cada mudança. Se isso atingisse o IonRouterOutlet no meio
 * de uma transição de aba, o StackManager do Ionic perdia o controle de qual página esconder
 * e DUAS páginas ficavam visíveis sobrepostas (bug "as páginas bugam entre si").
 *
 * memo() + assinar SÓ `owns` faz este componente re-renderizar apenas quando o modo
 * leitura muda — o churn de re-render do App não chega mais no outlet.
 */
const MainTabs: React.FC = memo(function MainTabs() {
  // modo leitura: vendo o perfil de OUTRO (não reivindicado por este aparelho).
  // Nele só aparece a aba Progresso e nada é interativo.
  const owns = useStore(ownsActive);

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          {/* no modo leitura (!owns) as abas restritas redirecionam pro Progresso */}
          <Route exact path="/treino" render={() => (owns ? <Treino /> : <Redirect to="/progresso" />)} />
          <Route exact path="/dieta" render={() => (owns ? <Dieta /> : <Redirect to="/progresso" />)} />
          <Route exact path="/progresso" render={() => <Progresso />} />
          <Route exact path="/premios" render={() => (owns ? <Premios /> : <Redirect to="/progresso" />)} />
          <Route exact path="/perfil" render={() => (owns ? <Perfil /> : <Redirect to="/progresso" />)} />
          <Route exact path="/" render={() => <Redirect to={owns ? '/treino' : '/progresso'} />} />
        </IonRouterOutlet>
        {/* no modo leitura só existe o Progresso → esconde a barra inteira (fica em tela cheia) */}
        <IonTabBar slot="bottom" className={owns ? undefined : 'tabbar-hidden'}>
          {owns && (
            <IonTabButton tab="treino" href="/treino">
              <IonIcon aria-hidden="true" icon={barbell} />
              <IonLabel>Treino</IonLabel>
            </IonTabButton>
          )}
          {owns && (
            <IonTabButton tab="dieta" href="/dieta">
              <IonIcon aria-hidden="true" icon={restaurant} />
              <IonLabel>Dieta</IonLabel>
            </IonTabButton>
          )}
          <IonTabButton tab="progresso" href="/progresso">
            <IonIcon aria-hidden="true" icon={trendingUp} />
            <IonLabel>Progresso</IonLabel>
          </IonTabButton>
          {owns && (
            <IonTabButton tab="premios" href="/premios">
              <IonIcon aria-hidden="true" icon={sparkles} />
              <IonLabel>Prêmios</IonLabel>
            </IonTabButton>
          )}
          {owns && (
            <IonTabButton tab="perfil" href="/perfil">
              <IonIcon aria-hidden="true" icon={person} />
              <IonLabel>Perfil</IonLabel>
            </IonTabButton>
          )}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
});

export default MainTabs;
