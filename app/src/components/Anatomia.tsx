import { useMemo, useState } from 'react';
import Model, { type IExerciseData, type Muscle, type IMuscleStats } from 'react-body-highlighter';
import { useStore } from '../store/store';
import { POOL } from '../data/pool';
import { PLANS, AQUECIMENTO } from '../data/plans';
import './Anatomia.css';

// Músculos granulares (o usuário pediu separar bíceps/tríceps/antebraço/abdômen/trapézio/panturrilha).
// Só esquerdo/direito do MESMO músculo se junta — isso o próprio modelo já faz.
type Fine =
  | 'chest' | 'trapezius' | 'back' | 'shoulders'
  | 'biceps' | 'triceps' | 'forearm'
  | 'abs' | 'obliques'
  | 'quads' | 'hamstring' | 'calves' | 'glutes';

const FINE: Fine[] = ['chest', 'trapezius', 'back', 'shoulders', 'biceps', 'triceps', 'forearm', 'abs', 'obliques', 'quads', 'hamstring', 'calves', 'glutes'];

const FINE_LABEL: Record<Fine, string> = {
  chest: 'Peito', trapezius: 'Trapézio', back: 'Costas', shoulders: 'Ombro',
  biceps: 'Bíceps', triceps: 'Tríceps', forearm: 'Antebraço',
  abs: 'Abdômen', obliques: 'Oblíquos',
  quads: 'Quadríceps', hamstring: 'Posterior', calves: 'Panturrilha', glutes: 'Glúteo',
};

// nosso músculo → músculos do modelo anatômico (react-body-highlighter)
const FINE_MUSCLES: Record<Fine, Muscle[]> = {
  chest: ['chest'], trapezius: ['trapezius'], back: ['upper-back', 'lower-back'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  biceps: ['biceps'], triceps: ['triceps'], forearm: ['forearm'],
  abs: ['abs'], obliques: ['obliques'],
  quads: ['quadriceps'], hamstring: ['hamstring'], calves: ['calves'], glutes: ['gluteal'],
};
const MUSCLE_FINE: Partial<Record<Muscle, Fine>> = {};
(Object.keys(FINE_MUSCLES) as Fine[]).forEach((f) => FINE_MUSCLES[f].forEach((m) => (MUSCLE_FINE[m] = f)));

const TIPS: Record<Fine, string> = {
  chest: 'Empurrar: flexões, supino e crucifixo constroem o peito.',
  trapezius: 'Encolhimento (shrug) e face pull dão volume e postura ao trapézio.',
  back: 'Puxar: barra fixa e remada dão largura e densidade às costas.',
  shoulders: 'Desenvolvimento e elevações laterais arredondam os ombros.',
  biceps: 'Rosca direta, martelo e concentrada fecham o bíceps.',
  triceps: 'Tríceps testa, francês e mergulho são 2/3 do braço.',
  forearm: 'Rosca de punho e dead hang dão pegada e antebraço grossos.',
  abs: 'Prancha, abdominal e elevação de pernas sustentam o tronco.',
  obliques: 'Russian twist e inclinação lateral marcam os oblíquos.',
  quads: 'Agachamento e afundo são a base — não pule perna.',
  hamstring: 'Stiff e terra romeno carregam o posterior de coxa.',
  calves: 'Panturrilha em pé e no degrau, amplitude total e bem devagar.',
  glutes: 'Hip thrust e stiff ativam o glúteo com carga.',
};

// Deriva o músculo granular pelo NOME do exercício (+ grupo coarse), sem tabela por exercício.
function exToFine(nome: string, coarse: string): Fine {
  const s = (nome || '').toLowerCase();
  switch (coarse) {
    case 'chest': return 'chest';
    case 'glutes': return 'glutes';
    case 'shoulders': return 'shoulders';
    case 'back':
      if (/encolhimento|shrug|trapéz|trapez|face pull|y-raise|y raise|y no chão/.test(s)) return 'trapezius';
      return 'back';
    case 'arms':
      if (/tríceps|triceps|francês|frances|mergulho|coice|testa|fechada|kickback/.test(s)) return 'triceps';
      if (/punho|inversa|invertida|pendura|dead hang|antebraço|antebraco|wrist/.test(s)) return 'forearm';
      return 'biceps';
    case 'core':
      if (/oblíqu|obliqu|russian|woodchopper|inclinação lateral|inclinacao lateral|lateral com halter|prancha lateral|suitcase|arrasto|twist/.test(s)) return 'obliques';
      return 'abs';
    case 'legs':
      if (/panturrilha|calf|sóleo|soleo/.test(s)) return 'calves';
      if (/stiff|terra romeno|rdl|posterior|swing|good morning/.test(s)) return 'hamstring';
      return 'quads';
    default:
      return 'abs';
  }
}

// Mapeia o campo `musculo` dos treinos PADRÃO (plans.ts) — texto livre — pra um músculo granular.
function musToFine(m: string): Fine | null {
  const s = (m || '').toLowerCase();
  if (s.includes('peito')) return 'chest';
  if (s.includes('trap')) return 'trapezius';
  if (s.includes('costas') || s.includes('dorsa') || s.includes('lombar')) return 'back';
  if (s.includes('ombro') || s.includes('deltoid')) return 'shoulders';
  if (s.includes('tríceps') || s.includes('triceps')) return 'triceps';
  if (s.includes('antebra') || s.includes('punho')) return 'forearm';
  if (s.includes('bíceps') || s.includes('biceps') || s.includes('braço') || s.includes('braco')) return 'biceps';
  if (s.includes('oblíqu') || s.includes('obliqu')) return 'obliques';
  if (s.includes('core') || s.includes('abdô') || s.includes('abdom')) return 'abs';
  if (s.includes('panturrilha')) return 'calves';
  if (s.includes('posterior') || s.includes('isquio')) return 'hamstring';
  if (s.includes('glúteo') || s.includes('gluteo') || s.includes('adutor')) return 'glutes';
  if (s.includes('perna') || s.includes('quadr') || s.includes('coxa')) return 'quads';
  return null;
}

// mistura dois hex (t=0 → a, t=1 → b)
function toRGB(c: string): [number, number, number] {
  let h = c.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function mix(a: string, b: string, t: number): string {
  const A = toRGB(a), B = toRGB(b);
  return '#' + [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join('');
}

const Anatomia: React.FC = () => {
  const history = useStore((s) => s.history[s.active]) || [];
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');

  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');
  const [sel, setSel] = useState<Fine | null>(null);

  // cores do tema (lidas em runtime; re-lê quando muda o tema)
  const { bodyColor, shades } = useMemo(() => {
    const root = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const accent = (root?.getPropertyValue('--brand-lime').trim()) || '#c6ff3a';
    const base = (root?.getPropertyValue('--app-line').trim()) || '#2a2f3a';
    const body = /^#?[0-9a-f]{3,6}$/i.test(base) ? base : '#2a2f3a';
    const b = body.startsWith('#') ? body : '#2a2f3a';
    const ac = accent.startsWith('#') ? accent : '#c6ff3a';
    return {
      bodyColor: body.startsWith('#') ? body : '#' + body,
      // 5 tons normais (freq 1-5) + 1 "glow" bem claro (freq 6) p/ o músculo selecionado
      shades: [...[0.3, 0.48, 0.66, 0.83, 1].map((t) => mix(b, ac, t)), mix(ac, '#ffffff', 0.6)],
    };
  }, [theme]);

  // séries por músculo (30 dias p/ o mapa + 7 dias p/ o alvo semanal)
  const { counts, weekly, total, intensity } = useMemo(() => {
    const byName = new Map<string, Fine>();
    POOL.forEach((p) => byName.set(p.n, exToFine(p.n, p.g)));
    // exercícios dos treinos PADRÃO (plans.ts): nome no POOL? usa; senão deriva do `musculo`
    const planEx = [...Object.values(PLANS).flatMap((p) => Object.values(p.treinos).flat()), ...AQUECIMENTO];
    planEx.forEach((ex) => {
      if (!byName.has(ex.nome)) { const f = musToFine(ex.musculo); if (f) byName.set(ex.nome, f); }
    });
    const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const cutoffWk = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const c = Object.fromEntries(FINE.map((f) => [f, 0])) as Record<Fine, number>;
    const wk = Object.fromEntries(FINE.map((f) => [f, 0])) as Record<Fine, number>;
    history.forEach((h) => {
      if (h.date < cutoff) return;
      (h.exercises || []).forEach((ex) => {
        const f = byName.get(ex.nome);
        if (f) { c[f] += ex.sets?.length || 0; if (h.date >= cutoffWk) wk[f] += ex.sets?.length || 0; }
      });
    });
    const tot = FINE.reduce((a, f) => a + c[f], 0);
    const max = Math.max(1, ...FINE.map((f) => c[f]));
    const inten = {} as Record<Fine, number>;
    FINE.forEach((f) => (inten[f] = c[f] / max));
    return { counts: c, weekly: wk, total: tot, intensity: inten };
  }, [history]);

  // dados pro modelo: 1 entrada por músculo treinado, frequência = nível 1..5 (índice de cor).
  // o músculo SELECIONADO recebe freq 6 = "glow".
  const data: IExerciseData[] = useMemo(() => {
    const max = Math.max(1, ...FINE.map((f) => counts[f]));
    return FINE.filter((f) => counts[f] > 0 || f === sel).map((f) => ({
      name: FINE_LABEL[f],
      muscles: FINE_MUSCLES[f],
      frequency: f === sel ? 6 : Math.max(1, Math.ceil((counts[f] / max) * 5)),
    }));
  }, [counts, sel]);

  const weakest = useMemo(() => FINE.slice().sort((a, b) => counts[a] - counts[b])[0], [counts]);

  const onMuscle = (m: IMuscleStats) => {
    const f = MUSCLE_FINE[m.muscle];
    if (f) setSel(f === sel ? null : f);
  };

  return (
    <div className="anat">
      <div className="anat-seg">
        <button className={view === 'anterior' ? 'on' : ''} onClick={() => setView('anterior')}>Frente</button>
        <button className={view === 'posterior' ? 'on' : ''} onClick={() => setView('posterior')}>Costas</button>
      </div>

      {total === 0 ? (
        <p className="anat-empty">Registre treinos pra ver quais músculos você mais trabalhou (últimos 30 dias).</p>
      ) : null}

      <div className={'anat-model' + (sel ? ' sel' : '')}>
        <Model
          type={view}
          data={data}
          bodyColor={bodyColor}
          highlightedColors={shades}
          onClick={onMuscle}
          style={{ width: '100%', maxWidth: 250 }}
        />
      </div>

      {sel ? (
        <div className="anat-panel">
          <div className="anat-panel-top">
            <b>{FINE_LABEL[sel]}</b>
            <span>{counts[sel]} séries · {total ? Math.round((counts[sel] / total) * 100) : 0}%</span>
          </div>
          <p className="anat-week">
            📅 Essa semana: <b>{weekly[sel]} séries</b> ·{' '}
            <span className={weekly[sel] >= 10 && weekly[sel] <= 20 ? 'on-target' : weekly[sel] < 10 ? 'below' : 'above'}>
              {weekly[sel] < 10 ? 'abaixo do alvo' : weekly[sel] <= 20 ? 'no alvo 👍' : 'acima do alvo'}
            </span> (alvo 10–20)
          </p>
          <p>{TIPS[sel]}</p>
        </div>
      ) : total > 0 ? (
        <div className="anat-panel focus">
          <div className="anat-panel-top">
            <b>🎯 Foco da semana: {FINE_LABEL[weakest]}</b>
          </div>
          <p>{TIPS[weakest]}</p>
        </div>
      ) : null}

      <div className="anat-legend">
        {FINE.map((f) => (
          <button
            key={f}
            className={'anat-bar' + (sel === f ? ' on' : '')}
            onClick={() => setSel(f === sel ? null : f)}
          >
            <span className="anat-bar-l">{FINE_LABEL[f]}</span>
            <span className="anat-bar-track">
              <span className="anat-bar-fill" style={{ width: `${Math.round(intensity[f] * 100)}%`, background: shades[Math.max(0, Math.ceil(intensity[f] * 5) - 1)] }} />
            </span>
            <span className="anat-bar-n">{counts[f]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Anatomia;
