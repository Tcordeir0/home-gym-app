import { useMemo, useState } from 'react';
import {
  IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel, IonSelect, IonSelectOption,
} from '@ionic/react';
import LineChart from './LineChart';
import DietChart from './DietChart';
import { useStore, todayISO } from '../store/store';
import { e1RM } from '../lib/stats';
import { weeklySetsByGroup } from '../lib/deload';
import { landmark } from '../lib/volume';
import { GROUP_LABEL, GEN_ROTATION } from '../data/pool';
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

  const [tab, setTab] = useState<'medidas' | 'carga' | 'volume' | 'dieta'>('medidas');
  const [medField, setMedField] = useState<MedKey>('weight');
  const [exName, setExName] = useState('');
  const [loadMetric, setLoadMetric] = useState<'e1rm' | 'max'>('e1rm');
  const [range, setRange] = useState<'semana' | 'mes' | 'ano' | 'tudo'>('mes');
  const [volGroup, setVolGroup] = useState('chest');

  // VOLUME semanal (séries/semana) do grupo escolhido, últimas 12 semanas → tendência
  // vs as faixas MEV/MAV/MRV (a aba "carga" já cobre 1RM por exercício).
  const volSeries = useMemo(() => {
    const N = 12;
    const buckets = weeklySetsByGroup(history, todayISO(), N);
    const base = new Date();
    const pts: { x: string; y: number }[] = [];
    for (let w = N - 1; w >= 0; w--) {
      const d = new Date(base); d.setDate(d.getDate() - w * 7);
      const x = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      pts.push({ x, y: buckets[w][volGroup] || 0 });
    }
    const first = pts.findIndex((p) => p.y > 0); // corta semanas zeradas antes de começar
    return first < 0 ? [] : pts.slice(first);
  }, [history, volGroup]);
  const volLm = landmark(volGroup);

  // recorte do período (semana/mês/ano/tudo) — filtra todas as séries por data
  const cutoff = useMemo(() => {
    if (range === 'tudo') return '';
    const days = range === 'semana' ? 7 : range === 'mes' ? 31 : 365;
    const d = new Date(); d.setDate(d.getDate() - days + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }, [range]);
  const inRange = (ds: string) => !cutoff || ds >= cutoff;

  const medSeries = useMemo(
    () =>
      measures
        .filter((m) => typeof m[medField] === 'number' && inRange(m.date))
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((m) => ({ x: m.date, y: m[medField] as number })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measures, medField, cutoff],
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
        if (!inRange(e.date)) return;
        const ex = (e.exercises || []).find((x) => x.nome === curEx);
        if (!ex) return;
        // 1RM estimado: melhor (kg × reps) do dia; máx: maior kg do dia
        const vals = ex.sets
          .map((s) => (loadMetric === 'e1rm' ? e1RM(s.kg || 0, s.reps || 0) : s.kg || 0))
          .filter((v) => v > 0);
        if (vals.length) out.push({ x: e.date, y: Math.max(...vals) });
      });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, curEx, loadMetric, cutoff]);

  return (
    <IonCard className="prog-card">
      <IonCardContent>
        <h2 className="card-title">Gráficos</h2>
        <IonSegment
          className="gr-seg"
          value={tab}
          onIonChange={(e) => setTab((e.detail.value as 'medidas' | 'carga' | 'volume' | 'dieta') || 'medidas')}
        >
          <IonSegmentButton value="medidas"><IonLabel>Medidas</IonLabel></IonSegmentButton>
          <IonSegmentButton value="carga"><IonLabel>Carga</IonLabel></IonSegmentButton>
          <IonSegmentButton value="volume"><IonLabel>Volume</IonLabel></IonSegmentButton>
          <IonSegmentButton value="dieta"><IonLabel>Dieta</IonLabel></IonSegmentButton>
        </IonSegment>

        {/* período: semana / mês / ano / tudo — não se aplica ao Volume (sempre 12 semanas) */}
        {tab !== 'volume' && (
          <div className="ds-seg gr-period">
            {([['semana', 'Semana'], ['mes', 'Mês'], ['ano', 'Ano'], ['tudo', 'Tudo']] as const).map(([k, label]) => (
              <button key={k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{label}</button>
            ))}
          </div>
        )}

        {tab === 'dieta' ? (
          <DietChart cutoff={cutoff} />
        ) : tab === 'medidas' ? (
          <>
            <div className="gr-chips">
              {MED_FIELDS.map((f) => (
                <button
                  key={f.key}
                  className={'ds-chip' + (medField === f.key ? ' on' : '')}
                  onClick={() => setMedField(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <LineChart series={medSeries} unit={medUnit} />
          </>
        ) : tab === 'volume' ? (
          <>
            <div className="gr-chips">
              {GEN_ROTATION.map((g) => (
                <button key={g} className={'ds-chip' + (volGroup === g ? ' on' : '')} onClick={() => setVolGroup(g)}>
                  {GROUP_LABEL[g] || g}
                </button>
              ))}
            </div>
            <LineChart series={volSeries} unit=" séries" />
            <p className="gr-note">
              Séries/semana de <b>{GROUP_LABEL[volGroup]}</b> (12 sem). Alvo <b>MAV {volLm.mav[0]}–{volLm.mav[1]}</b> · mínimo MEV {volLm.mev} · teto MRV {volLm.mrv}. Dentro do MAV = crescimento; acima do MRV por muito tempo = fadiga (hora de deload).
            </p>
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
            <div className="gr-chips">
              <button className={'ds-chip' + (loadMetric === 'e1rm' ? ' on' : '')} onClick={() => setLoadMetric('e1rm')}>1RM estimado</button>
              <button className={'ds-chip' + (loadMetric === 'max' ? ' on' : '')} onClick={() => setLoadMetric('max')}>Carga máx</button>
            </div>
            <LineChart series={loadSeries} unit="kg" />
            {loadMetric === 'e1rm' && <p className="gr-note">1RM estimado pela fórmula de Epley (kg × reps). Subir essa linha = progresso real, mesmo trocando o nº de repetições.</p>}
          </>
        ) : (
          <p className="gr-empty">Registre treinos com <b>kg</b> nas séries pra ver a evolução de carga aqui.</p>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default Graficos;
