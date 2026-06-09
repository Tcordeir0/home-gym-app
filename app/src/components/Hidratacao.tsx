import { IonCard, IonCardContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { useStore, useActiveProfile, todayISO } from '../store/store';

const COPO = 250;
const GARRAFA = 500;

const Hidratacao: React.FC = () => {
  const profile = useActiveProfile();
  const daily = useStore((s) => s.daily);
  const active = useStore((s) => s.active);
  const latestMeasure = useStore((s) => s.latestMeasure);
  const addWater = useStore((s) => s.addWaterToday);

  const weight = latestMeasure('weight');
  // meta calculada: 35 ml por kg (mín 2L); senão 2L
  const goal = weight ? Math.max(2000, Math.round((weight * 35) / 50) * 50) : 2000;
  const ml = daily?.[active]?.[todayISO()]?.waterMl || 0;
  const pct = Math.min(100, Math.round((ml / goal) * 100));
  const over = ml > goal;
  const copos = Math.round(ml / COPO);

  return (
    <IonCard className="diet-card">
      <IonCardContent>
        <div className="hid-head">
          <h2 className="card-title">💧 Hidratação</h2>
          <span className="hid-sum">
            {(ml / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L · {copos} copos
          </span>
        </div>
        <div className="hid-bar">
          <span style={{ width: pct + '%', background: over ? '#34d399' : undefined }} />
        </div>
        <p className="hid-goal">
          Meta calculada pelo seu peso (~35ml/kg).{' '}
          {over ? 'Passou da meta — mandou bem! 💪' : `Faltam ${((goal - ml) / 1000).toFixed(1)}L`}
        </p>
        <div className="hid-btns">
          <motion.button whileTap={{ scale: 0.94 }} className="hid-btn" onClick={() => addWater(COPO)}>
            🥛 +1 copo<small>250ml</small>
          </motion.button>
          <motion.button whileTap={{ scale: 0.94 }} className="hid-btn garrafa" onClick={() => addWater(GARRAFA)}>
            🍶 +1 garrafa<small>500ml</small>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="hid-btn minus" onClick={() => addWater(-COPO)}>
            −
          </motion.button>
        </div>
        {profile && over && (
          <p className="hid-done">Hidratação batida hoje! 💧</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default Hidratacao;
