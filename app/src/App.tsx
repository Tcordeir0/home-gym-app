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

const FREE_THEMES = ['dark', 'light'];
function rgbOf(hex: string) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
function contrastOf(hex: string) {
  const [r, g, b] = rgbOf(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#0b0c0f' : '#ffffff';
}
function darken(hex: string, f: number) {
  const [r, g, b] = rgbOf(hex);
  const h = (n: number) => Math.round(n * f).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

const App: React.FC = () => {
  // Sincroniza o modo de feedback (som/vibração) com o ajuste do perfil.
  const feedback = useStore((s) => s.feedback);
  useEffect(() => { setFeedbackMode(feedback); }, [feedback]);

  // Aplica o tema do perfil ativo + accent pela cor do perfil (nos temas grátis).
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const color = useStore((s) => s.users.find((u) => u.id === s.active)?.color || '#c6ff3a');
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (FREE_THEMES.includes(theme)) {
      // Preto: cor como está. Branco: escurece pra ler bem no fundo claro.
      const accent = theme === 'light' ? darken(color, 0.62) : color;
      root.style.setProperty('--brand-lime', accent);
      root.style.setProperty('--ion-color-primary', accent);
      root.style.setProperty('--ion-color-primary-contrast', contrastOf(accent));
    } else {
      // premium: usa o accent assinatura do tema (do CSS)
      root.style.removeProperty('--brand-lime');
      root.style.removeProperty('--ion-color-primary');
      root.style.removeProperty('--ion-color-primary-contrast');
    }
  }, [theme, color]);

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
