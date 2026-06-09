import { useState } from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import './Medidas.css';

const FIELDS = [
  { key: 'arm', label: 'Braço' },
  { key: 'chest', label: 'Peito' },
  { key: 'waist', label: 'Cintura' },
] as const;

type FieldKey = (typeof FIELDS)[number]['key'];

const Medidas: React.FC = () => {
  const arr = useStore((s) => s.measures[s.active]) || [];
  const setMeasureField = useStore((s) => s.setMeasureField);
  const [vals, setVals] = useState<Record<string, string>>({});

  const seriesOf = (key: FieldKey) =>
    arr
      .filter((m) => typeof m[key] === 'number')
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((m) => m[key] as number);

  const latestOf = (key: FieldKey) => {
    const s = seriesOf(key);
    return s.length ? s[s.length - 1] : null;
  };
  const deltaOf = (key: FieldKey) => {
    const s = seriesOf(key);
    return s.length >= 2 ? s[s.length - 1] - s[s.length - 2] : null;
  };

  const anyFilled = FIELDS.some((f) => (vals[f.key] || '').trim() !== '');

  const save = () => {
    FIELDS.forEach((f) => {
      const n = parseFloat((vals[f.key] || '').replace(',', '.'));
      if (!isNaN(n) && n > 0) setMeasureField(f.key, n);
    });
    setVals({});
  };

  return (
    <IonCard className="prog-card">
      <IonCardContent>
        <h2 className="card-title">Medidas corporais</h2>
        <p className="card-sub">Braço, peito e cintura (cm). O peso fica na aba Dieta.</p>

        <div className="med-tiles">
          {FIELDS.map((f) => {
            const cur = latestOf(f.key);
            const d = deltaOf(f.key);
            return (
              <div key={f.key} className="med-tile">
                <span className="med-v">
                  {cur != null ? cur : '—'}
                  {cur != null && <small> cm</small>}
                </span>
                <span className="med-l">{f.label}</span>
                {d != null && d !== 0 && (
                  <span className={'med-d ' + (d < 0 ? 'down' : 'up')}>
                    {d > 0 ? '+' : ''}{d.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="med-form">
          {FIELDS.map((f) => (
            <input
              key={f.key}
              className="med-in"
              type="number"
              inputMode="decimal"
              placeholder={f.label}
              value={vals[f.key] || ''}
              onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} className="med-save" disabled={!anyFilled} onClick={save}>
          Salvar medidas de hoje
        </motion.button>
      </IonCardContent>
    </IonCard>
  );
};

export default Medidas;
