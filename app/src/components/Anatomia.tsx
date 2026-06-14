import { useMemo, useState } from 'react';
import Body, { type Slug, type ExtendedBodyPart } from 'react-muscle-highlighter';
import type { BodyState } from 'body-muscles';
import MaleBody from './MaleBody';
import { emphasisOf } from '../lib/emphasis';
import { useStore } from '../store/store';
import { POOL } from '../data/pool';
import { PLANS, AQUECIMENTO } from '../data/plans';
import './Anatomia.css';

// Músculos granulares (o usuário pediu separar bíceps/tríceps/antebraço/abdômen/trapézio/panturrilha
// + dorsal/lombar). Boneco masculino/feminino conforme o sexo da Calculadora (Profile.body.sex).
type Fine =
  | 'chest' | 'trapezius' | 'back' | 'lombar' | 'shoulders'
  | 'biceps' | 'triceps' | 'forearm'
  | 'abs' | 'obliques'
  | 'quads' | 'hamstring' | 'calves' | 'glutes';

const FINE: Fine[] = ['chest', 'trapezius', 'back', 'lombar', 'shoulders', 'biceps', 'triceps', 'forearm', 'abs', 'obliques', 'quads', 'hamstring', 'calves', 'glutes'];

const FINE_LABEL: Record<Fine, string> = {
  chest: 'Peito', trapezius: 'Trapézio', back: 'Dorsal', lombar: 'Lombar', shoulders: 'Ombro',
  biceps: 'Bíceps', triceps: 'Tríceps', forearm: 'Antebraço',
  abs: 'Abdômen', obliques: 'Oblíquos',
  quads: 'Quadríceps', hamstring: 'Posterior', calves: 'Panturrilha', glutes: 'Glúteo',
};

// nosso músculo → slug do modelo (react-muscle-highlighter)
const FINE_SLUG: Record<Fine, Slug> = {
  chest: 'chest', trapezius: 'trapezius', back: 'upper-back', lombar: 'lower-back', shoulders: 'deltoids',
  biceps: 'biceps', triceps: 'triceps', forearm: 'forearm',
  abs: 'abs', obliques: 'obliques',
  quads: 'quadriceps', hamstring: 'hamstring', calves: 'calves', glutes: 'gluteal',
};
const SLUG_FINE: Partial<Record<Slug, Fine>> = {};
(Object.keys(FINE_SLUG) as Fine[]).forEach((f) => (SLUG_FINE[FINE_SLUG[f]] = f));

// nosso músculo → regiões da vulovix (modelo MASCULINO, com cabeças). Bases sem lado;
// expandidas pra -left/-right na hora de montar o estado.
const FINE_VULOVIX: Record<Fine, string[]> = {
  chest: ['chest-upper', 'chest-lower'],
  trapezius: ['traps-upper', 'traps-mid', 'traps-lower'],
  back: ['lats-upper', 'lats-mid', 'lats-lower'],
  lombar: ['lower-back-erectors', 'lower-back-ql'],
  shoulders: ['shoulder-front', 'shoulder-side', 'deltoid-rear'],
  biceps: ['biceps'],
  triceps: ['triceps-long', 'triceps-lateral'],
  forearm: ['forearm-flexors', 'forearm-extensors'],
  abs: ['abs-upper', 'abs-lower'],
  obliques: ['obliques'],
  quads: ['quads'],
  hamstring: ['hamstrings-lateral', 'hamstrings-medial'],
  calves: ['calves-gastroc-lateral', 'calves-gastroc-medial', 'calves-soleus'],
  glutes: ['gluteus-maximus', 'gluteus-medius'],
};
const VULOVIX_BASE_FINE: Record<string, Fine> = {};
(Object.keys(FINE_VULOVIX) as Fine[]).forEach((f) => FINE_VULOVIX[f].forEach((b) => (VULOVIX_BASE_FINE[b] = f)));
const vulovixBase = (id: string) => id.replace(/-(left|right)$/, '');

// rótulo PT-BR de cada sub-região (pra descrição "qual parte do músculo")
const BASE_LABEL: Record<string, string> = {
  'chest-upper': 'Peito superior', 'chest-lower': 'Peito inferior',
  'traps-upper': 'Trapézio superior', 'traps-mid': 'Trapézio médio', 'traps-lower': 'Trapézio inferior',
  'lats-upper': 'Dorsal superior', 'lats-mid': 'Dorsal médio', 'lats-lower': 'Dorsal inferior',
  'lower-back-erectors': 'Eretores da espinha', 'lower-back-ql': 'Quadrado lombar',
  'shoulder-front': 'Deltoide frontal', 'shoulder-side': 'Deltoide lateral', 'deltoid-rear': 'Deltoide posterior',
  'biceps': 'Bíceps', 'triceps-long': 'Tríceps · cabeça longa', 'triceps-lateral': 'Tríceps · cabeça lateral',
  'forearm-flexors': 'Antebraço · flexores', 'forearm-extensors': 'Antebraço · extensores',
  'abs-upper': 'Abdômen superior', 'abs-lower': 'Abdômen inferior', 'obliques': 'Oblíquos',
  'quads': 'Quadríceps', 'adductors': 'Adutores',
  'hamstrings-lateral': 'Posterior · lateral', 'hamstrings-medial': 'Posterior · medial',
  'calves-gastroc-lateral': 'Panturrilha · gastroc. lateral', 'calves-gastroc-medial': 'Panturrilha · gastroc. medial', 'calves-soleus': 'Panturrilha · sóleo',
  'gluteus-maximus': 'Glúteo máximo', 'gluteus-medius': 'Glúteo médio',
};

// Exercícios que desenvolvem uma sub-região. Primeiro os de ÊNFASE específica; se não houver,
// cai pros exercícios do MÚSCULO-PAI (nunca fica vazio). Nomes únicos, no máximo 8.
function exercisesForBase(base: string): string[] {
  const specific: string[] = [];
  for (const p of POOL) {
    const e = emphasisOf(p.n);
    if (e?.bases.includes(base) && !specific.includes(p.n)) specific.push(p.n);
  }
  if (specific.length) return specific.slice(0, 8);
  // fallback: exercícios do músculo-pai (garante lista não-vazia)
  const fine = VULOVIX_BASE_FINE[base];
  if (!fine) return [];
  const general: string[] = [];
  for (const p of POOL) {
    if (exToFine(p.n, p.g) === fine && !general.includes(p.n)) general.push(p.n);
    if (general.length >= 8) break;
  }
  return general;
}

const TIPS: Record<Fine, string> = {
  chest: 'Empurrar: flexões, supino e crucifixo constroem o peito.',
  trapezius: 'Encolhimento (shrug) e face pull dão volume e postura ao trapézio.',
  back: 'Puxar: barra fixa e remada dão largura e densidade ao dorsal.',
  lombar: 'Superman e stiff fortalecem a lombar — base pra tudo.',
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
      if (/lombar|superman|hiperexten|good morning/.test(s)) return 'lombar';
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
  if (s.includes('lombar')) return 'lombar';
  if (s.includes('costas') || s.includes('dorsa')) return 'back';
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
  const profile = useStore((s) => s.users.find((u) => u.id === s.active));
  const theme = profile?.cosmetics?.theme || 'dark';
  // sexo da Calculadora define o boneco (m → masculino, f → feminino)
  const gender: 'male' | 'female' = profile?.body?.sex === 'f' ? 'female' : 'male';

  const [view, setView] = useState<'front' | 'back'>('front');
  const [sel, setSel] = useState<Fine | null>(null);
  const [selBase, setSelBase] = useState<string | null>(null); // sub-região escolhida (ex.: 'chest-upper')

  // cores do tema (lidas em runtime; re-lê quando muda o tema)
  const { bodyColor, shades, maleColors } = useMemo(() => {
    const root = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const accent = (root?.getPropertyValue('--brand-lime').trim()) || '#c6ff3a';
    const base = (root?.getPropertyValue('--app-line').trim()) || '#2a2f3a';
    const body = /^#?[0-9a-f]{3,6}$/i.test(base) ? base : '#2a2f3a';
    const b = body.startsWith('#') ? body : '#2a2f3a';
    const ac = accent.startsWith('#') ? accent : '#c6ff3a';
    // rampa de 11 tons (intensity 0-10) p/ o modelo masculino (vulovix) no tom do TEMA:
    // 0 = neutro (inativo), 1..10 = accent escuro → accent cheio (heatmap na cor do tema)
    const lo = mix(ac, '#141414', 0.58);
    const mc = ['#8b94a3'];
    for (let i = 1; i <= 10; i++) mc.push(mix(lo, ac, (i - 1) / 9));
    return {
      bodyColor: body.startsWith('#') ? body : '#' + body,
      // 5 tons normais (intensity 1-5) + 1 "glow" claro (intensity 6) p/ o músculo selecionado
      shades: [...[0.3, 0.48, 0.66, 0.83, 1].map((t) => mix(b, ac, t)), mix(ac, '#ffffff', 0.6)],
      maleColors: mc,
    };
  }, [theme]);

  // séries por músculo (30 dias p/ o mapa + 7 dias p/ o alvo semanal)
  const { counts, weekly, total, intensity, baseCounts } = useMemo(() => {
    const byName = new Map<string, Fine>();
    POOL.forEach((p) => byName.set(p.n, exToFine(p.n, p.g)));
    const planEx = [...Object.values(PLANS).flatMap((p) => Object.values(p.treinos).flat()), ...AQUECIMENTO];
    planEx.forEach((ex) => {
      if (!byName.has(ex.nome)) { const f = musToFine(ex.musculo); if (f) byName.set(ex.nome, f); }
    });
    const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const cutoffWk = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const c = Object.fromEntries(FINE.map((f) => [f, 0])) as Record<Fine, number>;
    const wk = Object.fromEntries(FINE.map((f) => [f, 0])) as Record<Fine, number>;
    const bc: Record<string, number> = {}; // séries por SUB-REGIÃO (vulovix) — via ênfase do exercício
    history.forEach((h) => {
      if (h.date < cutoff) return;
      (h.exercises || []).forEach((ex) => {
        const f = byName.get(ex.nome);
        if (!f) return;
        const n = ex.sets?.length || 0;
        c[f] += n; if (h.date >= cutoffWk) wk[f] += n;
        // a ênfase manda a série pra sub-região certa (peito superior etc.); senão, todo o músculo
        const emp = emphasisOf(ex.nome);
        const bases = emp?.bases?.length ? emp.bases : FINE_VULOVIX[f];
        bases.forEach((b) => { bc[b] = (bc[b] || 0) + n; });
      });
    });
    const tot = FINE.reduce((a, f) => a + c[f], 0);
    const max = Math.max(1, ...FINE.map((f) => c[f]));
    const inten = {} as Record<Fine, number>;
    FINE.forEach((f) => (inten[f] = c[f] / max));
    return { counts: c, weekly: wk, total: tot, intensity: inten, baseCounts: bc };
  }, [history]);

  // dados pro modelo: 1 entrada por músculo treinado, intensity = nível 1..5 (índice de cor).
  // o músculo SELECIONADO recebe intensity 6 = "glow".
  const data: ExtendedBodyPart[] = useMemo(() => {
    const max = Math.max(1, ...FINE.map((f) => counts[f]));
    return FINE.filter((f) => counts[f] > 0 || f === sel).map((f) => ({
      slug: FINE_SLUG[f],
      intensity: f === sel ? 6 : Math.max(1, Math.ceil((counts[f] / max) * 5)),
    }));
  }, [counts, sel]);

  // estado pro modelo MASCULINO (vulovix): intensidade 0-10 por região (heatmap nativo) + seleção
  const maleState: BodyState = useMemo(() => {
    const bases = Object.keys(baseCounts);
    const max = Math.max(1, ...bases.map((b) => baseCounts[b]));
    const st: BodyState = {};
    const paint = (base: string, intensity: number, selected: boolean) => {
      st[base + '-left'] = { intensity, selected };
      st[base + '-right'] = { intensity, selected };
    };
    // sub-regiões treinadas (heatmap por ênfase: peito superior ≠ inferior)
    bases.forEach((b) => {
      const c = baseCounts[b];
      // se há sub-região escolhida, só ela "brilha"; senão, o músculo-pai inteiro
      const selected = selBase ? b === selBase : VULOVIX_BASE_FINE[b] === sel;
      const intensity = c > 0 ? Math.min(10, Math.max(2, Math.round((c / max) * 8) + 2)) : (selected ? 1 : 0);
      paint(b, intensity, selected);
    });
    // músculo/sub-região selecionado sem treino: ainda acende
    if (selBase && !(selBase in baseCounts)) paint(selBase, 1, true);
    else if (sel && !selBase) FINE_VULOVIX[sel].forEach((b) => { if (!(b in baseCounts)) paint(b, 1, true); });
    return st;
  }, [baseCounts, sel, selBase]);

  const weakest = useMemo(() => FINE.slice().sort((a, b) => counts[a] - counts[b])[0], [counts]);

  // seleção: por GRUPO (legenda/feminino) zera a sub-região; clique no boneco masculino vai direto na sub-região
  const pickFine = (f: Fine | null) => { setSelBase(null); setSel((cur) => (f === cur ? null : f)); };
  const pickBase = (base: string) => {
    const f = VULOVIX_BASE_FINE[base];
    if (!f) return;
    setSel(f);
    setSelBase((cur) => (cur === base ? null : base));
  };
  const onPart = (b: ExtendedBodyPart) => { if (b.slug && SLUG_FINE[b.slug]) pickFine(SLUG_FINE[b.slug]!); };
  const onMaleMuscle = (id: string) => pickBase(vulovixBase(id));

  return (
    <div className="anat">
      <div className="anat-seg">
        <button className={view === 'front' ? 'on' : ''} onClick={() => setView('front')}>Frente</button>
        <button className={view === 'back' ? 'on' : ''} onClick={() => setView('back')}>Costas</button>
      </div>

      {total === 0 ? (
        <p className="anat-empty">Registre treinos pra ver quais músculos você mais trabalhou (últimos 30 dias).</p>
      ) : null}

      <div className={'anat-model' + (sel ? ' sel' : '')}>
        {gender === 'male' ? (
          <MaleBody view={view} bodyState={maleState} onMuscle={onMaleMuscle} colors={maleColors} />
        ) : (
          <Body
            data={data}
            side={view}
            gender="female"
            colors={shades}
            defaultFill={bodyColor}
            border="none"
            onBodyPartPress={onPart}
            scale={1.1}
          />
        )}
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

          {/* partes do músculo — escolher uma sub-região (ex.: peito superior) */}
          {FINE_VULOVIX[sel].length > 1 && (
            <div className="anat-subs">
              {FINE_VULOVIX[sel].map((b) => (
                <button
                  key={b}
                  className={'anat-sub' + (selBase === b ? ' on' : '')}
                  onClick={() => pickBase(b)}
                >
                  {BASE_LABEL[b] || b}
                </button>
              ))}
            </div>
          )}

          {/* exercícios que desenvolvem a parte escolhida */}
          {selBase && (
            <div className="anat-exos">
              <b className="anat-exos-h">💪 {BASE_LABEL[selBase] || selBase} — exercícios que desenvolvem:</b>
              {exercisesForBase(selBase).length ? (
                <div className="anat-exos-list">
                  {exercisesForBase(selBase).map((n) => <span key={n} className="anat-exo">{n}</span>)}
                </div>
              ) : (
                <p className="anat-exos-empty">Sem exercício específico no catálogo ainda pra essa parte.</p>
              )}
            </div>
          )}
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
            onClick={() => pickFine(f)}
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
