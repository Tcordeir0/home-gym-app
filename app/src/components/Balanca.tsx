import { useState, useEffect } from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { motion } from 'framer-motion';
import LineChart from './LineChart';
import { useStore, useActiveProfile } from '../store/store';

const fmtNum = (n: number) => (Math.round(n * 10) / 10).toString();

const Balanca: React.FC = () => {
  const profile = useActiveProfile();
  const measuresArr = useStore((s) => s.measures[s.active]) || []; // reativo: re-renderiza ao salvar
  const setWeight = useStore((s) => s.setWeightToday);
  const series = measuresArr
    .filter((m) => typeof m.weight === 'number')
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((m) => ({ x: m.date, y: m.weight as number }));
  const cur = series.length ? series[series.length - 1].y : null;
  const prev = series.length > 1 ? series[series.length - 2].y : null;
  const goal = profile.body.goal;
  const [val, setVal] = useState('');

  useEffect(() => { if (cur != null) setVal(String(cur)); }, [cur]);

  let delta = null;
  if (cur != null && prev != null && cur !== prev) {
    const diff = cur - prev;
    const good = goal === 'maintain' ? null : (diff < 0) === (goal === 'lose' || goal === 'losefast');
    const c = good == null ? 'var(--app-muted)' : good ? 'var(--brand-lime)' : '#ff6b6b';
    delta = (
      <span className="bal-delta" style={{ color: c }}>
        {diff > 0 ? '▲ +' : '▼ '}{fmtNum(diff)} kg
      </span>
    );
  }

  const pesar = () => {
    const v = parseFloat(val);
    if (!isNaN(v) && v > 0) setWeight(v);
  };

  return (
    <IonCard className="diet-card">
      <IonCardContent>
        <h2 className="card-title">⚖️ Balança</h2>
        {cur != null ? (
          <div className="bal-cur">
            {fmtNum(cur)}<span className="bal-unit">kg</span> {delta}
          </div>
        ) : (
          <p className="card-sub">Registre seu peso pra acompanhar a evolução.</p>
        )}
        <LineChart series={series} unit="kg" />
        <div className="bal-row">
          <input
            className="set-in bal-in"
            inputMode="decimal"
            placeholder="kg de hoje"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <motion.button whileTap={{ scale: 0.95 }} className="bal-go" onClick={pesar}>
            Pesar
          </motion.button>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default Balanca;
