import { IonCard, IonCardContent } from '@ionic/react';
import { useStore, useActiveProfile, todayISO } from '../store/store';
import { targetsFor, waterGoal } from '../lib/diet';
import { dietTips } from '../lib/tips';
import './DicasDia.css';

/** Coach do dia na Dieta — feedback do que comeu/bebeu (over/under). */
const DicasDia: React.FC = () => {
  const profile = useActiveProfile();
  const daily = useStore((s) => s.daily);
  const active = useStore((s) => s.active);
  const latestMeasure = useStore((s) => s.latestMeasure);

  const weight = latestMeasure('weight');
  const t = targetsFor(profile.body, weight);
  const today = daily[active]?.[todayISO()] || {};
  const food = today.food || [];
  const kcal = food.reduce((a, f) => a + (f.k * f.g) / 100, 0);
  const protein = food.reduce((a, f) => a + (f.p * f.g) / 100, 0);
  const waterMl = today.waterMl || 0;

  const tips = dietTips({
    kcal,
    protein,
    waterMl,
    targetKcal: t?.target ?? null,
    targetProtein: t?.protein ?? null,
    waterGoal: waterGoal(weight),
    hasFood: food.length > 0,
    hasWater: waterMl > 0,
  });

  if (!tips.length) return null;

  return (
    <IonCard className="diet-card">
      <IonCardContent>
        <h2 className="card-title">Dicas do dia 🧠</h2>
        <div className="tips-list">
          {tips.map((tp, i) => (
            <div key={i} className={'tip ' + tp.tone}>
              <span className="tip-emoji">{tp.emoji}</span>
              <span className="tip-text">{tp.text}</span>
            </div>
          ))}
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default DicasDia;
