import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { POOL, GROUP_LABEL } from '../data/pool';
import './Anatomia.css';

type Group = 'chest' | 'back' | 'legs' | 'glutes' | 'shoulders' | 'arms' | 'core';
const GROUPS: Group[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'glutes'];

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

// formas do corpo (viewBox 220x470). t=rect|ell, g=grupo muscular, mod=ajuste por sexo
type Shape =
  | { t: 'rect'; g: Group; x: number; y: number; w: number; h: number; rx: number; mod?: 'sh' | 'waist' | 'hip' }
  | { t: 'ell'; g: Group; cx: number; cy: number; rx: number; ry: number; mod?: 'sh' | 'waist' | 'hip' };

const FRONT: Shape[] = [
  { t: 'ell', g: 'shoulders', cx: 70, cy: 98, rx: 19, ry: 15, mod: 'sh' },
  { t: 'ell', g: 'shoulders', cx: 150, cy: 98, rx: 19, ry: 15, mod: 'sh' },
  { t: 'rect', g: 'chest', x: 66, y: 106, w: 34, h: 32, rx: 12 },
  { t: 'rect', g: 'chest', x: 120, y: 106, w: 34, h: 32, rx: 12 },
  { t: 'rect', g: 'arms', x: 44, y: 102, w: 20, h: 64, rx: 10 },
  { t: 'rect', g: 'arms', x: 156, y: 102, w: 20, h: 64, rx: 10 },
  { t: 'rect', g: 'arms', x: 42, y: 168, w: 18, h: 58, rx: 9 },
  { t: 'rect', g: 'arms', x: 160, y: 168, w: 18, h: 58, rx: 9 },
  { t: 'rect', g: 'core', x: 80, y: 142, w: 60, h: 84, rx: 16, mod: 'waist' },
  { t: 'rect', g: 'legs', x: 76, y: 230, w: 28, h: 108, rx: 13 },
  { t: 'rect', g: 'legs', x: 116, y: 230, w: 28, h: 108, rx: 13 },
  { t: 'rect', g: 'legs', x: 80, y: 344, w: 22, h: 74, rx: 11 },
  { t: 'rect', g: 'legs', x: 118, y: 344, w: 22, h: 74, rx: 11 },
];

const BACK: Shape[] = [
  { t: 'ell', g: 'shoulders', cx: 70, cy: 98, rx: 19, ry: 15, mod: 'sh' },
  { t: 'ell', g: 'shoulders', cx: 150, cy: 98, rx: 19, ry: 15, mod: 'sh' },
  { t: 'rect', g: 'back', x: 70, y: 102, w: 80, h: 64, rx: 18 },
  { t: 'rect', g: 'back', x: 84, y: 168, w: 52, h: 44, rx: 14, mod: 'waist' },
  { t: 'rect', g: 'arms', x: 44, y: 102, w: 20, h: 64, rx: 10 },
  { t: 'rect', g: 'arms', x: 156, y: 102, w: 20, h: 64, rx: 10 },
  { t: 'rect', g: 'arms', x: 42, y: 168, w: 18, h: 58, rx: 9 },
  { t: 'rect', g: 'arms', x: 160, y: 168, w: 18, h: 58, rx: 9 },
  { t: 'rect', g: 'glutes', x: 80, y: 214, w: 28, h: 44, rx: 16, mod: 'hip' },
  { t: 'rect', g: 'glutes', x: 112, y: 214, w: 28, h: 44, rx: 16, mod: 'hip' },
  { t: 'rect', g: 'legs', x: 76, y: 262, w: 28, h: 82, rx: 13 },
  { t: 'rect', g: 'legs', x: 116, y: 262, w: 28, h: 82, rx: 13 },
  { t: 'rect', g: 'legs', x: 80, y: 350, w: 22, h: 66, rx: 11 },
  { t: 'rect', g: 'legs', x: 118, y: 350, w: 22, h: 66, rx: 11 },
];

const C = 110; // eixo central do corpo
// escala uma coordenada/largura em torno do centro (silhueta masc/fem)
function scaleX(v: number, f: number) { return C + (v - C) * f; }
function modFactor(mod: Shape['mod'], sex: 'm' | 'f') {
  if (sex === 'm' || !mod) return 1;
  return mod === 'sh' ? 0.84 : mod === 'waist' ? 0.86 : 1.2; // ombro estreito, cintura fina, quadril largo
}

const Anatomia: React.FC = () => {
  const history = useStore((s) => s.history[s.active]) || [];
  const theme = useStore((s) => s.users.find((u) => u.id === s.active)?.cosmetics?.theme || 'dark');
  const profSex = useStore((s) => s.users.find((u) => u.id === s.active)?.body?.sex) || 'm';

  const [view, setView] = useState<'front' | 'back'>('front');
  const [sex, setSex] = useState<'m' | 'f'>(profSex === 'f' ? 'f' : 'm');
  const [sel, setSel] = useState<Group | null>(null);

  // cor de destaque do tema atual (lida em runtime; re-lê quando muda o tema)
  const accent = useMemo(() => {
    if (typeof document === 'undefined') return '#c6ff3a';
    return getComputedStyle(document.documentElement).getPropertyValue('--brand-lime').trim() || '#c6ff3a';
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

  // músculo mais negligenciado (foco da semana)
  const weakest = useMemo(() => {
    return GROUPS.slice().sort((a, b) => counts[a] - counts[b])[0];
  }, [counts]);

  const shapes = view === 'front' ? FRONT : BACK;

  return (
    <div className="anat">
      <div className="anat-segs">
        <div className="anat-seg">
          <button className={view === 'front' ? 'on' : ''} onClick={() => setView('front')}>Frente</button>
          <button className={view === 'back' ? 'on' : ''} onClick={() => setView('back')}>Costas</button>
        </div>
        <div className="anat-seg">
          <button className={sex === 'm' ? 'on' : ''} onClick={() => setSex('m')}>♂</button>
          <button className={sex === 'f' ? 'on' : ''} onClick={() => setSex('f')}>♀</button>
        </div>
      </div>

      {total === 0 ? (
        <p className="anat-empty">Registre treinos pra ver quais músculos você mais trabalhou (últimos 30 dias).</p>
      ) : null}

      <svg className="anat-svg" viewBox="0 0 220 470" role="img" aria-label="Mapa muscular">
        {/* cabeça + pescoço (neutros) */}
        <ellipse className="anat-base" cx={C} cy={36} rx={24} ry={27} />
        <rect className="anat-base" x={100} y={58} width={20} height={14} rx={6} />
        {shapes.map((sp, i) => {
          const f = modFactor(sp.mod, sex);
          const op = 0.12 + intensity[sp.g] * 0.85;
          const on = sel === sp.g;
          const common = {
            className: 'anat-m' + (on ? ' sel' : ''),
            style: { fill: accent, fillOpacity: op } as React.CSSProperties,
            onClick: () => setSel(sp.g === sel ? null : sp.g),
          };
          if (sp.t === 'ell') {
            return <ellipse key={i} {...common} cx={scaleX(sp.cx, f)} cy={sp.cy} rx={sp.rx * (sp.mod === 'sh' ? f : 1)} ry={sp.ry} />;
          }
          const x2 = scaleX(sp.x, f);
          const w2 = scaleX(sp.x + sp.w, f) - x2;
          return <rect key={i} {...common} x={x2} y={sp.y} width={w2} height={sp.h} rx={sp.rx} />;
        })}
      </svg>

      {/* painel do músculo selecionado OU foco da semana */}
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

      {/* legenda: barras por grupo */}
      <div className="anat-legend">
        {GROUPS.map((g) => (
          <button
            key={g}
            className={'anat-bar' + (sel === g ? ' on' : '')}
            onClick={() => setSel(g === sel ? null : g)}
          >
            <span className="anat-bar-l">{GROUP_LABEL[g]}</span>
            <span className="anat-bar-track">
              <span className="anat-bar-fill" style={{ width: `${Math.round(intensity[g] * 100)}%`, background: accent }} />
            </span>
            <span className="anat-bar-n">{counts[g]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Anatomia;
