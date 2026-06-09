import { useMemo, useState } from 'react';
import {
  IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import LineChart from './LineChart';
import { useStore } from '../store/store';
import './Graficos.css';

const MED_FIELDS = [
  { key: 'weight', label: 'Peso', unit: 'kg' },
  { key: 'arm', label: 'Braço', unit: 'cm' },
  { key: 'chest', label: 'Peito', unit: 'cm' },
  { key: 'waist', label: 'Cintura', unit: 'cm' },
] as const;

type MedKey = (typeof MED_FIELDS)[number]['key'];

const Graficos: React.FC = () => {
  const measures = useStore((s) => s.measures[s.active]) || [];
  const history = useStore((s) => s.history[s.active]) || [];

  const [tab, setTab] = useState<'medidas' | 'carga'>('medidas');
  const [medField, setMedField] = useState<MedKey>('weight');
  const [exName, setExName] = useState('');

  const medSeries = useMemo(
    () =>
      measures
        .filter((m) => typeof m[medField] === 'number')
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((m) => ({ x: m.date, y: m[medField] as number })),
    [measures, medField],
  );
  const medUnit = MED_FIELDS.find((f) => f.key === medField)?.unit || '';

  // exercícios que já têm kg registrado
  const exNames = useMemo(() => {
    const set = new Set<string>();
    history.forEach((e) =>
      (e.exercises || []).forEach((x) => {
        if (x.sets.some((s) => typeof s.kg === 'number' && s.kg)) set.add(x.nome);
      }),
    );
    return [...set].sort();
  }, [history]);

  const curEx = exName && exNames.includes(exName) ? exName : exNames[0] || '';

  const loadSeries = useMemo(() => {
    const out: { x: string; y: number }[] = [];
    history
      .slice()
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .forEach((e) => {
        const ex = (e.exercises || []).find((x) => x.nome === curEx);
        if (!ex) return;
        const kgs = ex.sets.map((s) => s.kg).filter((k): k is number => typeof k === 'number' && !!k);
        if (kgs.length) out.push({ x: e.date, y: Math.max(...kgs) });
      });
    return out;
  }, [history, curEx]);

  return (
    <IonCard className="prog-card">
      <IonCardContent>
        <h2 className="card-title">Gráficos</h2>
        <IonSegment
          className="gr-seg"
          value={tab}
          onIonChange={(e) => setTab((e.detail.value as 'medidas' | 'carga') || 'medidas')}
        >
          <IonSegmentButton value="medidas"><IonLabel>Medidas</IonLabel></IonSegmentButton>
          <IonSegmentButton value="carga"><IonLabel>Carga</IonLabel></IonSegmentButton>
        </IonSegment>

        {tab === 'medidas' ? (
          <>
            <div className="gr-chips">
              {MED_FIELDS.map((f) => (
                <button
                  key={f.key}
                  className={'gr-chip' + (medField === f.key ? ' on' : '')}
                  onClick={() => setMedField(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <LineChart series={medSeries} unit={medUnit} />
          </>
        ) : exNames.length ? (
          <>
            <IonSelect
              className="gr-select"
              value={curEx}
              interface="action-sheet"
              aria-label="Exercício"
              onIonChange={(e) => setExName(e.detail.value)}
            >
              {exNames.map((n) => (
                <IonSelectOption key={n} value={n}>{n}</IonSelectOption>
              ))}
            </IonSelect>
            <LineChart series={loadSeries} unit="kg" />
          </>
        ) : (
          <p className="gr-empty">Registre treinos com <b>kg</b> nas séries pra ver a evolução de carga aqui.</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default Graficos;
