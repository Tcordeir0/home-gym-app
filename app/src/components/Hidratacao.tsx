import { useState } from 'react';
import { IonCard, IonCardContent, IonAlert } from '@ionic/react';
import { motion } from 'framer-motion';
import { useStore, useActiveProfile, todayISO } from '../store/store';
import { waterGoal } from '../lib/diet';

const COPO = 250;

const Hidratacao: React.FC = () => {
  const profile = useActiveProfile();
  const daily = useStore((s) => s.daily);
  const active = useStore((s) => s.active);
  const latestMeasure = useStore((s) => s.latestMeasure);
  const addWater = useStore((s) => s.addWaterToday);
  const updateProfile = useStore((s) => s.updateProfile);
  const [editBottle, setEditBottle] = useState(false);
  const [other, setOther] = useState(false);

  const bottle = profile.bottleMl || 500;
  const weight = latestMeasure('weight');
  const goal = waterGoal(weight);
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
          <motion.button whileTap={{ scale: 0.94 }} className="hid-btn garrafa" onClick={() => addWater(bottle)}>
            🍶 +1 garrafa<small>{bottle}ml</small>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="hid-btn minus" onClick={() => addWater(-COPO)}>
            −
          </motion.button>
        </div>

        <div className="hid-cfg">
          <button className="hid-link" onClick={() => setEditBottle(true)}>✎ Tamanho da garrafa ({bottle}ml)</button>
          <button className="hid-link" onClick={() => setOther(true)}>+ outro (ml)</button>
        </div>
        {over && <p className="hid-done">Hidratação batida hoje! 💧</p>}

        <IonAlert
          isOpen={editBottle}
          onDidDismiss={() => setEditBottle(false)}
          header="Tamanho da sua garrafa"
          subHeader="Em ml (ex: 600, 1000, 2000)"
          inputs={[{ name: 'ml', type: 'number', value: String(bottle), placeholder: 'ml', min: 1 }]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Salvar',
              handler: (d) => {
                const v = parseInt(d.ml, 10);
                if (v > 0) updateProfile(profile.id, { bottleMl: v });
              },
            },
          ]}
        />
        <IonAlert
          isOpen={other}
          onDidDismiss={() => setOther(false)}
          header="Adicionar água"
          subHeader="Quantos ml você bebeu?"
          inputs={[{ name: 'ml', type: 'number', placeholder: 'ml (ex: 1000)' }]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Adicionar',
              handler: (d) => {
                const v = parseInt(d.ml, 10);
                if (v > 0) addWater(v);
              },
            },
          ]}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default Hidratacao;
