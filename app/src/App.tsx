import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import type { Session } from '@supabase/supabase-js';
import { barbell, restaurant, trendingUp, sparkles, person } from 'ionicons/icons';
import { useStore } from './store/store';
import { setFeedbackMode, setVolume, initAudio } from './lib/feedback';
import { syncReminder, disarmReminder } from './lib/reminders';
import { supabase } from './lib/supabase';
import { syncOnLogin, startSync, stopSync } from './lib/sync';
import { deviceId } from './lib/device';
import { THEMES } from './data/themes';
import Auth from './pages/Auth';
import ProfileSelect from './pages/ProfileSelect';
import Treino from './pages/Treino';
import Dieta from './pages/Dieta';
import Progresso from './pages/Progresso';
import Premios from './pages/Premios';
import Perfil from './pages/Perfil';
import LevelUp from './components/LevelUp';
import WhatsNew from './components/WhatsNew';
import ThemeFX from './components/ThemeFX';
import ErrorBoundary from './components/ErrorBoundary';

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
  // Sessão do Supabase (gate de login). undefined = carregando.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Sync com o Supabase: ao logar, puxa o estado e passa a empurrar mudanças.
  // Segura no splash até o sync inicial terminar (nunca mostra dados de outra conta).
  const uid = session?.user?.id;
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    if (uid) {
      setSyncing(true);
      syncOnLogin().finally(() => { startSync(); setSyncing(false); });
    } else {
      stopSync();
    }
  }, [uid]);

  // Perfil reivindicado por ESTE aparelho (anti-trapaça). Se não tiver, mostra
  // a tela de escolha de perfil. Se tiver, abre sempre nele.
  const users = useStore((s) => s.users);
  const activeId = useStore((s) => s.active);
  const setActive = useStore((s) => s.setActive);
  const myDev = deviceId();
  const claimed = users.find((u) => u.claimedDevice === myDev);
  // Abre no perfil reivindicado SÓ quando ele aparece/muda (login, claim, troca de
  // conta). Depois disso o usuário pode trocar pra VER outros perfis (modo leitura).
  useEffect(() => {
    if (claimed) setActive(claimed.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimed?.id]);

  // Sincroniza o modo de feedback (som/vibração) com o ajuste do perfil.
  const feedback = useStore((s) => s.feedback);
  useEffect(() => { setFeedbackMode(feedback); }, [feedback]);
  // liga os listeners que reativam o áudio ao voltar/tocar (iOS mata o som no lock)
  useEffect(() => { initAudio(); }, []);
  // volume dos sons é POR PERFIL (cada um regula o seu).
  const profVolume = useStore((s) => s.users.find((u) => u.id === s.active)?.volume);
  useEffect(() => { setVolume(profVolume ?? 0.7); }, [profVolume]);

  // Lembrete diário de treino: arma o timer e dá o nudge ao abrir/voltar pro app.
  const notifyOn = useStore((s) => s.notifyOn);
  const reminder = useStore((s) => s.reminder);
  useEffect(() => {
    syncReminder();
    const onVis = () => { if (document.visibilityState === 'visible') syncReminder(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); disarmReminder(); };
  }, [notifyOn, reminder.on, reminder.time]);

  // Aplica o tema do perfil ativo + accent pela cor do perfil (nos temas grátis).
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const color = useStore((s) => s.users.find((u) => u.id === s.active)?.color || '#c6ff3a');
  const photoOff = useStore((s) => !!s.users.find((u) => u.id === s.active)?.cosmetics?.photoOff);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // liquid glass em TODOS os temas premium (menos Preto/Branco)
    if (theme !== 'dark' && theme !== 'light') root.setAttribute('data-glass', '1');
    else root.removeAttribute('data-glass');
    // a cor do perfil vira o accent em TODOS os temas (no Branco escurece pra ler bem);
    // a textura/animação do tema mantém a cor-assinatura própria.
    const accent = theme === 'light' ? darken(color, 0.62) : color;
    root.style.setProperty('--brand-lime', accent);
    root.style.setProperty('--ion-color-primary', accent);
    root.style.setProperty('--ion-color-primary-contrast', contrastOf(accent));
  }, [theme, color, photoOff]);

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

  // Carregando a sessão → splash curto da marca.
  if (session === undefined) {
    return (
      <IonApp>
        <ThemeFX />
        <div className="app-splash">
          <span className="brand">HOME <span className="brand-hl">GYM</span></span>
          <IonSpinner name="crescent" />
        </div>
      </IonApp>
    );
  }
  // Sem sessão → tela de login/registro.
  if (!session) {
    return (
      <IonApp>
        <ThemeFX />
        <Auth />
      </IonApp>
    );
  }
  // Logado mas ainda sincronizando o estado da conta → splash (evita flash de dados errados).
  if (syncing) {
    return (
      <IonApp>
        <ThemeFX />
        <div className="app-splash">
          <span className="brand">HOME <span className="brand-hl">GYM</span></span>
          <IonSpinner name="crescent" />
        </div>
      </IonApp>
    );
  }
  // Este aparelho ainda não escolheu um perfil → tela de escolha.
  if (!claimed) {
    return (
      <IonApp>
        <ThemeFX />
        <ProfileSelect />
      </IonApp>
    );
  }

  return (
  <IonApp>
    <ThemeFX />
    <LevelUp />
    <WhatsNew />
    <ErrorBoundary>
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
    </ErrorBoundary>
  </IonApp>
  );
};

export default App;
