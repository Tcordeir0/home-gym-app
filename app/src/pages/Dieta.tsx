import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { personCircleOutline, arrowForward } from 'ionicons/icons';
import AppPage from '../components/AppPage';
import Balanca from '../components/Balanca';
import Hidratacao from '../components/Hidratacao';
import Diary from '../components/Diary';
import DietChart from '../components/DietChart';
import DicasDia from '../components/DicasDia';
import { useStore, useActiveProfile } from '../store/store';
import { targetsFor, bmi, bmiClass, bodyFatNavy } from '../lib/diet';
import './Dieta.css';

const Dieta: React.FC = () => {
  const profile = useActiveProfile();
  const body = profile.body;
  const myMeasures = useStore((s) => s.measures[s.active]) || [];

  const latest = (f: 'weight' | 'waist') => {
    let v: number | null = null, d = '';
    myMeasures.forEach((mm) => { const x = mm[f]; if (typeof x === 'number' && mm.date >= d) { v = x; d = mm.date; } });
    return v;
  };
  const weight = latest('weight');
  const waist = latest('waist');
  const t = targetsFor(body, weight);
  const imc = weight && body.height ? bmi(weight, body.height) : null;
  const imcCls = imc ? bmiClass(imc) : null;
  const bf = body.height ? bodyFatNavy(body.sex, body.height, waist, body.neck, body.hip) : null;

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
          {t && (
            <div className="dstats">
              {imc && imcCls
                ? <div className="dstat"><div className="dstat-v" style={{ color: imcCls.c }}>{imc.toFixed(1)}</div><div className="dstat-l">IMC · {imcCls.l}</div></div>
                : <div className="dstat"><div className="dstat-v">—</div><div className="dstat-l">IMC</div></div>}
              {bf != null
                ? <div className="dstat"><div className="dstat-v">{bf.toFixed(1)}%</div><div className="dstat-l">gordura corporal</div></div>
                : <div className="dstat hint">Pescoço{body.sex === 'f' ? ' e quadril' : ''} + cintura nas Medidas (Progresso)</div>}
            </div>
          )}
          <p className="diet-base">⚙️ A <b>Calculadora</b> (sexo/idade/altura/objetivo) e a <b>anatomia</b> agora ficam no <b>Perfil</b>.</p>
        </IonCardContent>
      </IonCard>

      <DicasDia />
      <Diary />

      {/* evolução da dieta (calorias/proteína/água) — histórico não zera, fica tudo aqui */}
      <IonCard className="diet-results">
        <IonCardContent>
          <h2 className="card-title">📈 Evolução da dieta</h2>
          <DietChart />
        </IonCardContent>
      </IonCard>

      <Balanca />
      <Hidratacao />
    </AppPage>
  );
};

export default Dieta;
