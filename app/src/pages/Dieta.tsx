import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { personCircleOutline, arrowForward } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import Balanca from '../components/Balanca';
import Hidratacao from '../components/Hidratacao';
import Diary from '../components/Diary';
import DicasDia from '../components/DicasDia';
import { useStore, useActiveProfile } from '../store/store';
import { targetsFor } from '../lib/diet';
import './Dieta.css';

const Dieta: React.FC = () => {
  const profile = useActiveProfile();
  const body = profile.body;
  const myMeasures = useStore((s) => s.measures[s.active]) || [];

  const weight = (() => {
    let v: number | null = null, d = '';
    myMeasures.forEach((m) => { const x = m.weight; if (typeof x === 'number' && m.date >= d) { v = x; d = m.date; } });
    return v;
  })();
  const t = targetsFor(body, weight);

  return (
    <AppPage title="Dieta">
      {/* Resumo da meta (a Calculadora completa fica no Perfil) */}
      <IonCard className="diet-results">
        <IonCardContent>
          {t ? (
            <div className="meta-row">
              <div className="meta-wrap">
                <div className="meta-label">Meta diária</div>
                <div className="meta-kcal">{t.target}<span className="meta-unit"> kcal</span></div>
                <div className="meta-sub">manutenção {t.tdee} · proteína {t.protein}g/dia</div>
              </div>
              <IonButton className="meta-cfg" fill="clear" size="small" routerLink="/perfil">
                <IonIcon slot="start" icon={personCircleOutline} /> Ajustar <IonIcon slot="end" icon={arrowForward} />
              </IonButton>
            </div>
          ) : (
            <div className="meta-row">
              <p className="diet-empty">Configure <b>sexo, idade, altura e objetivo</b> no Perfil pra ver suas metas.</p>
              <IonButton className="meta-cfg" fill="clear" size="small" routerLink="/perfil">
                <IonIcon slot="start" icon={personCircleOutline} /> Abrir <IonIcon slot="end" icon={arrowForward} />
              </IonButton>
            </div>
          )}
          <p className="diet-base">⚙️ A <b>Calculadora</b> (sexo/idade/altura/objetivo) e a <b>anatomia</b> agora ficam no <b>Perfil</b>.</p>
        </IonCardContent>
      </IonCard>

      <DicasDia />
      <Diary />
      <Balanca />
      <Hidratacao />
    </AppPage>
  );
};

export default Dieta;
