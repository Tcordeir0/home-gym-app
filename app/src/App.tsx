import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { barbell, restaurant, trendingUp, sparkles, person } from 'ionicons/icons';
import { useStore } from './store/store';
import { setFeedbackMode } from './lib/feedback';
import Treino from './pages/Treino';
import Dieta from './pages/Dieta';
import Progresso from './pages/Progresso';
import Premios from './pages/Premios';
import Perfil from './pages/Perfil';
import LevelUp from './components/LevelUp';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/display.css';

/* Tema próprio (dark premium iOS) — sempre escuro */
import './theme/variables.css';

setupIonicReact({ mode: 'ios' });

const App: React.FC = () => {
  // Sincroniza o modo de feedback (som/vibração) com o ajuste do perfil.
  const feedback = useStore((s) => s.feedback);
  useEffect(() => { setFeedbackMode(feedback); }, [feedback]);

  // Esconde a tab bar quando o teclado abre (não deve subir junto).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kb = window.innerHeight - vv.height;
        document.body.classList.toggle('kb-open', kb > 120);
      });
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  return (
  <IonApp>
    <LevelUp />
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/treino" component={Treino} />
          <Route exact path="/dieta" component={Dieta} />
          <Route exact path="/progresso" component={Progresso} />
          <Route exact path="/premios" component={Premios} />
          <Route exact path="/perfil" component={Perfil} />
          <Route exact path="/">
            <Redirect to="/treino" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="treino" href="/treino">
            <IonIcon aria-hidden="true" icon={barbell} />
            <IonLabel>Treino</IonLabel>
          </IonTabButton>
          <IonTabButton tab="dieta" href="/dieta">
            <IonIcon aria-hidden="true" icon={restaurant} />
            <IonLabel>Dieta</IonLabel>
          </IonTabButton>
          <IonTabButton tab="progresso" href="/progresso">
            <IonIcon aria-hidden="true" icon={trendingUp} />
            <IonLabel>Progresso</IonLabel>
          </IonTabButton>
          <IonTabButton tab="premios" href="/premios">
            <IonIcon aria-hidden="true" icon={sparkles} />
            <IonLabel>Prêmios</IonLabel>
          </IonTabButton>
          <IonTabButton tab="perfil" href="/perfil">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
  );
};

export default App;
