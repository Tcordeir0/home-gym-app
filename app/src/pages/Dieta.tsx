import {
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import AppPage from '../components/AppPage';
import { useStore, useActiveProfile } from '../store/store';
import { ACTIVITY, GOALS, targetsFor, bmi, bmiClass, bodyFatNavy } from '../lib/diet';
import type { Sex, Goal } from '../store/types';
import './Dieta.css';

const num = (v: string | number | null | undefined): number | null => {
  const n = parseFloat(String(v ?? ''));
  return isNaN(n) ? null : n;
};

const Dieta: React.FC = () => {
  const profile = useActiveProfile();
  const body = profile.body;
  const updateBody = useStore((s) => s.updateActiveBody);
  const setWeight = useStore((s) => s.setWeightToday);
  const latestMeasure = useStore((s) => s.latestMeasure);

  const weight = latestMeasure('weight');
  const waist = latestMeasure('waist');

  const t = targetsFor(body, weight);
  const m = weight && body.height ? bmi(weight, body.height) : null;
  const mc = m ? bmiClass(m) : null;
  const bf = body.height ? bodyFatNavy(body.sex, body.height, waist, body.neck, body.hip) : null;

  return (
    <AppPage title="Dieta">
      <IonCard className="diet-card">
        <IonCardContent>
          <h2 className="card-title">Calculadora — {profile.name}</h2>
          <p className="card-sub">Quanto comer pra bater seu objetivo. Dados ficam neste perfil.</p>

          <IonList className="diet-list" lines="full">
            <IonItem>
              <IonSelect
                label="Sexo"
                value={body.sex}
                interface="action-sheet"
                onIonChange={(e) => updateBody({ sex: e.detail.value as Sex })}
              >
                <IonSelectOption value="m">Masculino</IonSelectOption>
                <IonSelectOption value="f">Feminino</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Idade"
                type="number"
                inputmode="numeric"
                placeholder="anos"
                value={body.age ?? ''}
                onIonInput={(e) => updateBody({ age: num(e.detail.value) })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Altura (cm)"
                type="number"
                inputmode="decimal"
                placeholder="cm"
                value={body.height ?? ''}
                onIonInput={(e) => updateBody({ height: num(e.detail.value) })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Peso atual (kg)"
                type="number"
                inputmode="decimal"
                placeholder="kg"
                value={weight ?? ''}
                onIonInput={(e) => {
                  const v = num(e.detail.value);
                  if (v != null) setWeight(v);
                }}
              />
            </IonItem>
            <IonItem>
              <IonSelect
                label="Atividade"
                value={body.activity}
                interface="action-sheet"
                onIonChange={(e) => updateBody({ activity: e.detail.value })}
              >
                {ACTIVITY.map((a) => (
                  <IonSelectOption key={a.v} value={a.v}>{a.l}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect
                label="Objetivo"
                value={body.goal}
                interface="action-sheet"
                onIonChange={(e) => updateBody({ goal: e.detail.value as Goal })}
              >
                {GOALS.map((g) => (
                  <IonSelectOption key={g.v} value={g.v}>{g.l}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>

          <details className="diet-adv">
            <summary>Medidas pra % de gordura (opcional)</summary>
            <IonList className="diet-list" lines="full">
              <IonItem>
                <IonInput
                  label="Pescoço (cm)"
                  type="number"
                  inputmode="decimal"
                  placeholder="cm"
                  value={body.neck ?? ''}
                  onIonInput={(e) => updateBody({ neck: num(e.detail.value) })}
                />
              </IonItem>
              <IonItem lines="none">
                <IonInput
                  label="Quadril (cm)"
                  type="number"
                  inputmode="decimal"
                  placeholder="cm (mulheres)"
                  value={body.hip ?? ''}
                  onIonInput={(e) => updateBody({ hip: num(e.detail.value) })}
                />
              </IonItem>
            </IonList>
            <p className="diet-note">A cintura vem das suas medidas (Progresso). Quadril só no cálculo feminino.</p>
          </details>
        </IonCardContent>
      </IonCard>

      <IonCard className="diet-results">
        <IonCardContent>
          {t ? (
            <>
              <div className="meta-wrap">
                <div className="meta-label">Meta diária</div>
                <div className="meta-kcal">
                  {t.target}
                  <span className="meta-unit"> kcal</span>
                </div>
                {t.floored && <div className="meta-floor">déficit limitado a um mínimo seguro</div>}
              </div>
              <div className="dstats">
                <Stat v={t.tdee} l="manutenção (kcal)" />
                <Stat v={`${t.protein}g`} l="proteína/dia" />
              </div>
              <div className="dstats">
                {m && mc ? <Stat v={m.toFixed(1)} l={`IMC · ${mc.l}`} c={mc.c} /> : <Stat v="—" l="IMC" />}
                {bf != null ? (
                  <Stat v={`${bf.toFixed(1)}%`} l="gordura corporal" />
                ) : (
                  <div className="dstat hint">Preencha pescoço{body.sex === 'f' ? ' e quadril' : ''} + cintura</div>
                )}
              </div>
              <p className="diet-base">
                Base: <b>Mifflin-St Jeor</b> × atividade.{' '}
                {t.goalAdj === 0
                  ? 'Comendo isso você mantém o peso.'
                  : t.goalAdj < 0
                  ? 'O déficit faz emagrecer; proteína alta segura o músculo.'
                  : 'O superávit leve favorece ganho de massa.'}
              </p>
            </>
          ) : (
            <p className="diet-empty">
              Preencha <b>idade</b>, <b>altura</b> e <b>peso</b> pra ver suas metas.
            </p>
          )}
        </IonCardContent>
      </IonCard>
    </AppPage>
  );
};

const Stat: React.FC<{ v: string | number; l: string; c?: string }> = ({ v, l, c }) => (
  <div className="dstat">
    <div className="dstat-v" style={c ? { color: c } : undefined}>{v}</div>
    <div className="dstat-l">{l}</div>
  </div>
);

export default Dieta;
