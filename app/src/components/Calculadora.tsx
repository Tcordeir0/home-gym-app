import { IonCard, IonCardContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import { useStore, useActiveProfile } from '../store/store';
import { ACTIVITY, GOALS } from '../lib/diet';
import { goalsForGender, BIOTYPES, defaultShape, shapeGoalById, SUBFOCUS_BY_GROUP, weightFor } from '../data/shapeGoals';
import { GROUP_LABEL } from '../data/pool';
import type { Sex, Goal, Biotype } from '../store/types';
import '../pages/Dieta.css';
import './Calculadora.css';

const num = (v: string | number | null | undefined): number | null => {
  const n = parseFloat(String(v ?? ''));
  return isNaN(n) ? null : n;
};

/** Calculadora corporal (sexo/idade/altura/peso/atividade/objetivo) — vive no PERFIL.
 *  O sexo aqui define o boneco da Anatomia (Progresso). As metas (kcal/IMC/gordura)
 *  aparecem na aba DIETA, pra não duplicar. */
const Calculadora: React.FC = () => {
  const profile = useActiveProfile();
  const body = profile.body;
  const updateBody = useStore((s) => s.updateActiveBody);
  const updateProfile = useStore((s) => s.updateProfile);
  const setWeight = useStore((s) => s.setWeightToday);
  const myMeasures = useStore((s) => s.measures[s.active]) || [];

  // meta de shape (filtrada pelo sexo) + a escolhida (default por gênero)
  const goals = goalsForGender(body.sex);
  const shapeId = profile.shapeGoal?.preset || defaultShape(body.sex);
  const overrides = profile.shapeGoal?.overrides || {};
  // trocar o preset mantém os ajustes finos atuais
  const setShape = (preset: string) => updateProfile(profile.id, { shapeGoal: { preset, overrides } });
  const setOverride = (base: string, val: number) => updateProfile(profile.id, { shapeGoal: { preset: shapeId, overrides: { ...overrides, [base]: val } } });
  const resetOverrides = () => updateProfile(profile.id, { shapeGoal: { preset: shapeId } });
  const levelOf = (base: string) => Math.min(3, Math.max(1, overrides[base] ?? Math.round(weightFor(base, shapeId, undefined, body.biotype))));

  const latest = (f: 'weight' | 'waist') => {
    let v: number | null = null, d = '';
    myMeasures.forEach((m) => { const x = m[f]; if (typeof x === 'number' && m.date >= d) { v = x; d = m.date; } });
    return v;
  };
  const weight = latest('weight');

  return (
    <>
      <IonCard className="diet-card">
        <IonCardContent>
          <h2 className="card-title">Calculadora — {profile.name}</h2>
          <p className="card-sub">Quanto comer pra bater seu objetivo. O <b>sexo</b> também define o boneco da Anatomia.</p>

          <IonList className="diet-list" lines="full">
            <IonItem>
              <IonSelect label="Sexo" value={body.sex} interface="action-sheet"
                onIonChange={(e) => updateBody({ sex: e.detail.value as Sex })}>
                <IonSelectOption value="m">Masculino</IonSelectOption>
                <IonSelectOption value="f">Feminino</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput label="Idade" type="number" inputmode="numeric" placeholder="anos"
                value={body.age ?? ''} onIonInput={(e) => updateBody({ age: num(e.detail.value) })} />
            </IonItem>
            <IonItem>
              <IonInput label="Altura (cm)" type="number" inputmode="decimal" placeholder="cm"
                value={body.height ?? ''} onIonInput={(e) => updateBody({ height: num(e.detail.value) })} />
            </IonItem>
            <IonItem>
              <IonInput label="Peso atual (kg)" type="number" inputmode="decimal" placeholder="kg"
                value={weight ?? ''} onIonInput={(e) => { const v = num(e.detail.value); if (v != null) setWeight(v); }} />
            </IonItem>
            <IonItem>
              <IonSelect label="Atividade" value={body.activity} interface="action-sheet"
                onIonChange={(e) => updateBody({ activity: e.detail.value })}>
                {ACTIVITY.map((a) => <IonSelectOption key={a.v} value={a.v}>{a.l}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonSelect label="Objetivo" value={body.goal} interface="action-sheet"
                onIonChange={(e) => updateBody({ goal: e.detail.value as Goal })}>
                {GOALS.map((g) => <IonSelectOption key={g.v} value={g.v}>{g.l}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
            <IonItem lines="none">
              <IonSelect label="Biotipo" value={body.biotype || 'meso'} interface="action-sheet"
                onIonChange={(e) => updateBody({ biotype: e.detail.value as Biotype })}>
                {BIOTYPES.map((b) => <IonSelectOption key={b.id} value={b.id}>{b.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          </IonList>

          <details className="diet-adv">
            <summary className="ds-expander">Medidas pra % de gordura (opcional)</summary>
            <IonList className="diet-list" lines="full">
              <IonItem>
                <IonInput label="Pescoço (cm)" type="number" inputmode="decimal" placeholder="cm"
                  value={body.neck ?? ''} onIonInput={(e) => updateBody({ neck: num(e.detail.value) })} />
              </IonItem>
              <IonItem lines="none">
                <IonInput label="Quadril (cm)" type="number" inputmode="decimal" placeholder="cm (mulheres)"
                  value={body.hip ?? ''} onIonInput={(e) => updateBody({ hip: num(e.detail.value) })} />
              </IonItem>
            </IonList>
            <p className="diet-note">A cintura vem das suas medidas (Progresso). Quadril só no cálculo feminino.</p>
          </details>
        </IonCardContent>
      </IonCard>

      {/* Meta de shape — guia o sub-foco no Montar treino + o gap na Anatomia */}
      <IonCard className="diet-card">
        <IonCardContent>
          <h2 className="card-title">🎯 Meta de shape</h2>
          <p className="card-sub">O corpo que você quer — guia a sugestão de foco no treino e o "gap" na Anatomia.</p>
          <div className="shape-grid">
            {goals.map((g) => (
              <button key={g.id} className={'ds-chip ds-chip--block' + (shapeId === g.id ? ' on' : '')} onClick={() => setShape(g.id)}>
                <span className="shape-emoji">{g.emoji}</span>
                <span className="shape-name">{g.name}</span>
              </button>
            ))}
          </div>
          <p className="shape-desc">{shapeGoalById(shapeId)?.desc}</p>
          <p className="diet-note">Biotipo <b>{BIOTYPES.find((b) => b.id === (body.biotype || 'meso'))?.name}</b>: {BIOTYPES.find((b) => b.id === (body.biotype || 'meso'))?.desc}</p>

          <details className="diet-adv">
            <summary className="ds-expander">⚙️ Ajustar prioridades (avançado)</summary>
            <p className="diet-note">Suba ou baixe a prioridade de cada parte. Isso afeta a sugestão de sub-foco e o gap na Anatomia.</p>
            {Object.entries(SUBFOCUS_BY_GROUP).map(([g, subs]) => (
              <div key={g} className="tune-group">
                <div className="tune-g-name">{GROUP_LABEL[g] || g}</div>
                {subs.map((s) => (
                  <div key={s.base} className="tune-row">
                    <span className="tune-label">{s.label}</span>
                    <div className="tune-levels">
                      {[1, 2, 3].map((v) => (
                        <button key={v} className={'tune-lv' + (levelOf(s.base) === v ? ' on' : '')} onClick={() => setOverride(s.base, v)}>
                          {['', 'Normal', 'Importante', 'Máx'][v]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button className="tune-reset" onClick={resetOverrides}>↺ Resetar pros padrões da meta</button>
          </details>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default Calculadora;
