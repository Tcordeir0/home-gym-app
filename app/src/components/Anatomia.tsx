import { useMemo, useState } from 'react';
import Model, { type IExerciseData, type Muscle, type IMuscleStats } from 'react-body-highlighter';
import { useStore } from '../store/store';
import { POOL, GROUP_LABEL } from '../data/pool';
import './Anatomia.css';

type Group = 'chest' | 'back' | 'legs' | 'glutes' | 'shoulders' | 'arms' | 'core';
const GROUPS: Group[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes'];

// nossos grupos → músculos do modelo anatômico (react-body-highlighter)
const GROUP_MUSCLES: Record<Group, Muscle[]> = {
  chest: ['chest'],
  back: ['trapezius', 'upper-back', 'lower-back'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  arms: ['biceps', 'triceps', 'forearm'],
  core: ['abs', 'obliques'],
  legs: ['quadriceps', 'hamstring', 'calves'],
  glutes: ['gluteal'],
};
const MUSCLE_GROUP: Partial<Record<Muscle, Group>> = {};
(Object.keys(GROUP_MUSCLES) as Group[]).forEach((g) => GROUP_MUSCLES[g].forEach((m) => (MUSCLE_GROUP[m] = g)));

// dica de coach por grupo (PT-BR)
const TIPS: Record<Group, string> = {
  chest: 'Empurrar: flexões, supino e paralelas constroem o peito.',
  back: 'Puxar: barra fixa e remada dão largura e densidade às costas.',
  shoulders: 'Desenvolvimento e elevações laterais arredondam os ombros.',
  arms: 'Rosca + tríceps no fim do treino fecham o braço.',
  core: 'Prancha e abdominais 3x/semana sustentam o tronco.',
  legs: 'Agachamento e afundo são a base — não pule perna.',
  glutes: 'Hip thrust e stiff ativam o glúteo com carga.',
};

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
  const [sel, setSel] = useState<Group | null>(null);

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

  // séries por grupo nos últimos 30 dias
  const { counts, total, intensity } = useMemo(() => {
    const byName = new Map<string, Group>();
    POOL.forEach((p) => byName.set(p.n, p.g as Group));
    const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const c: Record<Group, number> = { chest: 0, back: 0, legs: 0, glutes: 0, shoulders: 0, arms: 0, core: 0 };
    history.forEach((h) => {
      if (h.date < cutoff) return;
      (h.exercises || []).forEach((ex) => {
        const g = byName.get(ex.nome);
        if (g) c[g] += ex.sets?.length || 0;
      });
    });
    const tot = GROUPS.reduce((a, g) => a + c[g], 0);
    const max = Math.max(1, ...GROUPS.map((g) => c[g]));
    const inten = {} as Record<Group, number>;
    GROUPS.forEach((g) => (inten[g] = c[g] / max));
    return { counts: c, total: tot, intensity: inten };
  }, [history]);

  // dados pro modelo: 1 entrada por grupo treinado, frequência = nível 1..5 (índice de cor).
  // o grupo SELECIONADO recebe freq 6 = "glow" (mostra que está sendo apertado).
  const data: IExerciseData[] = useMemo(() => {
    const max = Math.max(1, ...GROUPS.map((g) => counts[g]));
    return GROUPS.filter((g) => counts[g] > 0 || g === sel).map((g) => ({
      name: GROUP_LABEL[g],
      muscles: GROUP_MUSCLES[g],
      frequency: g === sel ? 6 : Math.max(1, Math.ceil((counts[g] / max) * 5)),
    }));
  }, [counts, sel]);

  const weakest = useMemo(() => GROUPS.slice().sort((a, b) => counts[a] - counts[b])[0], [counts]);

  const onMuscle = (m: IMuscleStats) => {
    const g = MUSCLE_GROUP[m.muscle];
    if (g) setSel(g === sel ? null : g);
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
            <b>{GROUP_LABEL[sel]}</b>
            <span>{counts[sel]} séries · {total ? Math.round((counts[sel] / total) * 100) : 0}%</span>
          </div>
          <p>{TIPS[sel]}</p>
        </div>
      ) : total > 0 ? (
        <div className="anat-panel focus">
          <div className="anat-panel-top">
            <b>🎯 Foco da semana: {GROUP_LABEL[weakest]}</b>
          </div>
          <p>{TIPS[weakest]}</p>
        </div>
      ) : null}

      <div className="anat-legend">
        {GROUPS.map((g) => (
          <button
            key={g}
            className={'anat-bar' + (sel === g ? ' on' : '')}
            onClick={() => setSel(g === sel ? null : g)}
          >
            <span className="anat-bar-l">{GROUP_LABEL[g]}</span>
            <span className="anat-bar-track">
              <span className="anat-bar-fill" style={{ width: `${Math.round(intensity[g] * 100)}%`, background: shades[Math.max(0, Math.ceil(intensity[g] * 5) - 1)] }} />
            </span>
            <span className="anat-bar-n">{counts[g]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Anatomia;
