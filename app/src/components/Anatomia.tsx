import { useMemo, useState, useRef } from 'react';
import { IonActionSheet, IonIcon, useIonViewWillLeave } from '@ionic/react';
import { eyeOutline, arrowBackOutline, shareOutline } from 'ionicons/icons';
import DemoSheet from './DemoSheet';
import type { Exercise } from '../data/types';
import Body, { type Slug, type ExtendedBodyPart } from 'react-muscle-highlighter';
import type { BodyState } from 'body-muscles';
import MaleBody from './MaleBody';
import { shareAnatomy } from '../lib/shareCard';
import { emphasisOf } from '../lib/emphasis';
import { weightFor, shapeGoalById, defaultShape } from '../data/shapeGoals';
import { useStore, todayISO } from '../store/store';
import { POOL, GROUP_LABEL } from '../data/pool';
import { PLANS, AQUECIMENTO } from '../data/plans';
import './Anatomia.css';

// Músculos granulares (o usuário pediu separar bíceps/tríceps/antebraço/abdômen/trapézio/panturrilha
// + dorsal/lombar). Boneco masculino/feminino conforme o sexo da Calculadora (Profile.body.sex).
type Fine =
  | 'chest' | 'trapezius' | 'back' | 'lombar' | 'shoulders'
  | 'biceps' | 'triceps' | 'forearm'
  | 'abs' | 'obliques' | 'serratus'
  | 'quads' | 'hamstring' | 'calves' | 'glutes';

const FINE: Fine[] = ['chest', 'serratus', 'trapezius', 'back', 'lombar', 'shoulders', 'biceps', 'triceps', 'forearm', 'abs', 'obliques', 'quads', 'hamstring', 'calves', 'glutes'];

const FINE_LABEL: Record<Fine, string> = {
  chest: 'Peito', trapezius: 'Trapézio', back: 'Dorsal', lombar: 'Lombar', shoulders: 'Ombro',
  biceps: 'Bíceps', triceps: 'Tríceps', forearm: 'Antebraço',
  abs: 'Abdômen', obliques: 'Oblíquos', serratus: 'Serrátil',
  quads: 'Quadríceps', hamstring: 'Posterior', calves: 'Panturrilha', glutes: 'Glúteo',
};

// nosso músculo → slug do modelo (react-muscle-highlighter, modelo FEMININO).
// Serrátil não existe nessa lib → fica sem pintar no feminino (só conta na legenda).
const FINE_SLUG: Partial<Record<Fine, Slug>> = {
  chest: 'chest', trapezius: 'trapezius', back: 'upper-back', lombar: 'lower-back', shoulders: 'deltoids',
  biceps: 'biceps', triceps: 'triceps', forearm: 'forearm',
  abs: 'abs', obliques: 'obliques',
  quads: 'quadriceps', hamstring: 'hamstring', calves: 'calves', glutes: 'gluteal',
};
const SLUG_FINE: Partial<Record<Slug, Fine>> = {};
(Object.keys(FINE_SLUG) as Fine[]).forEach((f) => { const s = FINE_SLUG[f]; if (s) SLUG_FINE[s] = f; });

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
  serratus: ['serratus-anterior'],
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
  'abs-upper': 'Abdômen superior', 'abs-lower': 'Abdômen inferior', 'obliques': 'Oblíquos', 'serratus-anterior': 'Serrátil',
  'quads': 'Quadríceps',
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
  serratus: 'Pullover, ab rollout e around-the-world desenham o serrátil (relevo nas costelas).',
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

// Conta séries por músculo (fine) e por sub-região (base) num intervalo [from, to] (ISO, inclusivo).
// Fonte única usada pela visão ao vivo (30d/7d) E pelo card de compartilhar (período escolhido).
function countRange(
  history: { date: string; exercises?: { nome: string; sets?: unknown[] }[] }[],
  byName: Map<string, Fine>,
  from: string,
  to: string,
): { counts: Record<Fine, number>; baseCounts: Record<string, number>; total: number } {
  const c = Object.fromEntries(FINE.map((f) => [f, 0])) as Record<Fine, number>;
  const bc: Record<string, number> = {};
  history.forEach((h) => {
    if (h.date < from || h.date > to) return;
    (h.exercises || []).forEach((ex) => {
      const f = byName.get(ex.nome);
      if (!f) return;
      const n = ex.sets?.length || 0;
      c[f] += n;
      const emp = emphasisOf(ex.nome);
      const bases = emp?.bases?.length ? emp.bases : FINE_VULOVIX[f];
      bases.forEach((b) => { bc[b] = (bc[b] || 0) + n; });
    });
  });
  return { counts: c, baseCounts: bc, total: FINE.reduce((a, f) => a + c[f], 0) };
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const isoDay = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

// Semanas do calendário (segunda→domingo) que tocam o mês, recortadas aos limites do mês.
function weeksOfMonth(year: number, month: number): { from: string; to: string }[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // recua até segunda-feira
  const weeks: { from: string; to: string }[] = [];
  for (const cur = new Date(start); cur <= last; cur.setDate(cur.getDate() + 7)) {
    const we = new Date(cur); we.setDate(we.getDate() + 6);
    weeks.push({ from: isoDay(cur < first ? first : cur), to: isoDay(we > last ? last : we) });
  }
  return weeks;
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
  const [addingEx, setAddingEx] = useState<string | null>(null); // exercício a mandar pro treino
  const [demoEx, setDemoEx] = useState<Exercise | null>(null); // exercício a demonstrar (DemoSheet)

  // abre a demo de um exercício pelo nome (monta o Exercise a partir do POOL)
  const openDemo = (n: string) => {
    const p = POOL.find((x) => x.n === n);
    if (p) setDemoEx({ nome: p.n, musculo: GROUP_LABEL[p.g] || '', series: p.s || 3, reps: p.r, dica: p.d });
  };
  // ao SAIR da página, volta a Anatomia ao estado padrão (sem músculo/parte selecionados)
  useIonViewWillLeave(() => { setSel(null); setSelBase(null); setView('front'); });

  const addToWorkout = useStore((s) => s.addExerciseToWorkout);
  // treinos disponíveis (A–E presentes) pra mandar o exercício
  const workoutKeys = useMemo(() => {
    const tr = profile?.treinos as Record<string, unknown> | undefined;
    const keys = tr ? ['A', 'B', 'C', 'D', 'E'].filter((k) => tr[k]) : [];
    return keys.length ? keys : ['A', 'B', 'C'];
  }, [profile?.treinos]);
  const sendToWorkout = (treino: string) => {
    if (!addingEx) return;
    const p = POOL.find((x) => x.n === addingEx);
    if (p) addToWorkout(treino, { nome: p.n, musculo: GROUP_LABEL[p.g] || '', series: p.s || 3, reps: p.r, dica: p.d });
    setAddingEx(null);
  };

  // accent = cor do perfil VISUALIZADO (não o --brand-lime global, que no modo leitura
  // pode estar 1 render atrás do tema do outro perfil). base lida do tema aplicado.
  const profileColor = profile?.color || '#c6ff3a';
  const { bodyColor, shades, maleColors } = useMemo(() => {
    const root = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    const accent = /^#[0-9a-f]{3,6}$/i.test(profileColor) ? profileColor : '#c6ff3a';
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
  }, [theme, profileColor]);

  // mapa NOME do exercício → músculo granular (POOL + treinos padrão). Fonte única.
  const byName = useMemo(() => {
    const m = new Map<string, Fine>();
    POOL.forEach((p) => m.set(p.n, exToFine(p.n, p.g)));
    const planEx = [...Object.values(PLANS).flatMap((p) => Object.values(p.treinos).flat()), ...AQUECIMENTO];
    planEx.forEach((ex) => { if (!m.has(ex.nome)) { const f = musToFine(ex.musculo); if (f) m.set(ex.nome, f); } });
    return m;
  }, []);

  // séries por músculo (30 dias p/ o mapa + 7 dias p/ o alvo semanal)
  const { counts, weekly, total, intensity, baseCounts } = useMemo(() => {
    const c30 = countRange(history, byName, new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10), '9999-12-31');
    const c7 = countRange(history, byName, new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), '9999-12-31');
    const max = Math.max(1, ...FINE.map((f) => c30.counts[f]));
    const inten = {} as Record<Fine, number>;
    FINE.forEach((f) => (inten[f] = c30.counts[f] / max));
    return { counts: c30.counts, weekly: c7.counts, total: c30.total, intensity: inten, baseCounts: c30.baseCounts };
    // todayISO() na dep: revalida a janela de 30/7 dias a cada novo dia (não congela no último treino)
  }, [history, byName, todayISO()]);

  // dados pro modelo: 1 entrada por músculo treinado, intensity = nível 1..5 (índice de cor).
  // o músculo SELECIONADO recebe intensity 6 = "glow".
  const data: ExtendedBodyPart[] = useMemo(() => {
    const max = Math.max(1, ...FINE.map((f) => counts[f]));
    return FINE.filter((f) => (counts[f] > 0 || f === sel) && FINE_SLUG[f]).map((f) => ({
      slug: FINE_SLUG[f]!,
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
      // selecionado = cor mais forte (não depende só do glow, que é pesado no iOS)
      const intensity = selected ? 10 : (c > 0 ? Math.min(9, Math.max(2, Math.round((c / max) * 8) + 1)) : 0);
      paint(b, intensity, selected);
    });
    // músculo/sub-região selecionado sem treino: ainda acende
    if (selBase && !(selBase in baseCounts)) paint(selBase, 1, true);
    else if (sel && !selBase) FINE_VULOVIX[sel].forEach((b) => { if (!(b in baseCounts)) paint(b, 1, true); });
    return st;
  }, [baseCounts, sel, selBase]);

  // GAP vs. META de shape: sub-regiões que mais te afastam do shape que você quer
  // (compara a fatia ALVO de cada parte — peso da meta — com a fatia REAL treinada).
  const shapeGoal = shapeGoalById(profile?.shapeGoal?.preset || defaultShape(profile?.body?.sex || 'm'));
  const gaps = useMemo(() => {
    const preset = profile?.shapeGoal?.preset || defaultShape(profile?.body?.sex || 'm');
    const overrides = profile?.shapeGoal?.overrides;
    const biotype = profile?.body?.biotype;
    const bases = Object.keys(BASE_LABEL);
    const w = bases.map((b) => weightFor(b, preset, overrides, biotype));
    const sumW = w.reduce((a, x) => a + x, 0) || 1;
    const totBase = bases.reduce((a, b) => a + (baseCounts[b] || 0), 0) || 1;
    return bases
      .map((b, i) => ({ base: b, weight: w[i], gap: w[i] / sumW - (baseCounts[b] || 0) / totBase }))
      .filter((x) => x.weight >= 2) // só onde a meta dá prioridade real
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);
  }, [baseCounts, profile?.shapeGoal, profile?.body?.biotype, profile?.body?.sex]);

  // seleção: por GRUPO (legenda/feminino). Se o músculo tem UMA só sub-região (serrátil,
  // bíceps, oblíquos, quadríceps), já seleciona ela — senão os exercícios nunca apareciam.
  const pickFine = (f: Fine | null) => {
    const next = f === sel ? null : f;
    setSel(next);
    setSelBase(next && FINE_VULOVIX[next].length === 1 ? FINE_VULOVIX[next][0] : null);
  };
  const pickBase = (base: string) => {
    const f = VULOVIX_BASE_FINE[base];
    if (!f) return;
    setSel(f);
    setSelBase((cur) => (cur === base ? null : base));
  };
  const onPart = (b: ExtendedBodyPart) => { if (b.slug && SLUG_FINE[b.slug]) pickFine(SLUG_FINE[b.slug]!); };
  const onMaleMuscle = (id: string) => pickBase(vulovixBase(id));

  // ===== Compartilhar Anatomia: período (semana/mês/ano) + bonecos escondidos p/ o card =====
  const nowD = new Date();
  const [pKind, setPKind] = useState<'week' | 'month' | 'year'>('week');
  const [pYear, setPYear] = useState(nowD.getFullYear());
  const [pMonth, setPMonth] = useState(nowD.getMonth());
  const [pWeek, setPWeek] = useState(0);
  const [sharing, setSharing] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const years = [nowD.getFullYear(), nowD.getFullYear() - 1, nowD.getFullYear() - 2];
  const monthWeeks = useMemo(() => weeksOfMonth(pYear, pMonth), [pYear, pMonth]);
  const wIdx = Math.min(pWeek, monthWeeks.length - 1);

  const periodRange = useMemo(() => {
    if (pKind === 'year') return { from: `${pYear}-01-01`, to: `${pYear}-12-31`, label: `${pYear}` };
    if (pKind === 'month') return { from: isoDay(new Date(pYear, pMonth, 1)), to: isoDay(new Date(pYear, pMonth + 1, 0)), label: `${MONTHS[pMonth]} ${pYear}` };
    const w = monthWeeks[wIdx] || monthWeeks[0];
    return { from: w.from, to: w.to, label: `Semana ${wIdx + 1} · ${MONTHS_ABBR[pMonth]} ${pYear}` };
  }, [pKind, pYear, pMonth, wIdx, monthWeeks]);

  const periodStats = useMemo(() => countRange(history, byName, periodRange.from, periodRange.to), [history, byName, periodRange]);

  const periodMuscles = useMemo(() =>
    FINE.map((f) => ({ label: FINE_LABEL[f], pct: periodStats.total ? Math.round((periodStats.counts[f] / periodStats.total) * 100) : 0 }))
      .filter((m) => m.pct > 0).sort((a, b) => b.pct - a.pct), [periodStats]);

  // heatmap do período pro modelo MASCULINO (sem seleção)
  const periodMaleState: BodyState = useMemo(() => {
    const bases = Object.keys(periodStats.baseCounts);
    const max = Math.max(1, ...bases.map((b) => periodStats.baseCounts[b]));
    const st: BodyState = {};
    bases.forEach((b) => {
      const cnt = periodStats.baseCounts[b];
      const intensity = cnt > 0 ? Math.min(9, Math.max(2, Math.round((cnt / max) * 8) + 1)) : 0;
      st[b + '-left'] = { intensity, selected: false };
      st[b + '-right'] = { intensity, selected: false };
    });
    return st;
  }, [periodStats]);

  // heatmap do período pro modelo FEMININO (react-muscle-highlighter)
  const periodData: ExtendedBodyPart[] = useMemo(() => {
    const max = Math.max(1, ...FINE.map((f) => periodStats.counts[f]));
    return FINE.filter((f) => periodStats.counts[f] > 0 && FINE_SLUG[f]).map((f) => ({
      slug: FINE_SLUG[f]!, intensity: Math.max(1, Math.ceil((periodStats.counts[f] / max) * 5)),
    }));
  }, [periodStats]);

  // serializa o <svg> do boneco escondido pra um dataURL rasterizável
  const svgToUrl = (el: HTMLElement | null): string | null => {
    const svg = el?.querySelector('svg');
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const vb = clone.getAttribute('viewBox');
    if (vb) { const p = vb.split(/[\s,]+/).map(Number); if (p.length === 4) { clone.setAttribute('width', String(p[2])); clone.setAttribute('height', String(p[3])); } }
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  };

  const doShareAnatomy = async () => {
    if (sharing || periodStats.total === 0) return;
    setSharing(true);
    try {
      // garante o repaint dos bonecos escondidos com o estado do período antes de capturar
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
      const frontImg = svgToUrl(frontRef.current);
      const backImg = svgToUrl(backRef.current);
      if (frontImg && backImg) {
        await shareAnatomy({ name: profile?.name || 'Atleta', periodLabel: periodRange.label, frontImg, backImg, muscles: periodMuscles, theme, color: profileColor });
      }
    } catch { /* cancelado/erro de share */ }
    finally { setSharing(false); }
  };

  return (
    <div className="anat">
      <div className="ds-seg">
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
          {/* voltar: do detalhe de exercícios → músculo (se tem várias partes); senão → visão da meta */}
          <button className="anat-back" onClick={() => { if (selBase && FINE_VULOVIX[sel].length > 1) setSelBase(null); else { setSel(null); setSelBase(null); } }}>
            <IonIcon icon={arrowBackOutline} /> Voltar
          </button>
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
                  className={'ds-chip' + (selBase === b ? ' on' : '')}
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
                  {exercisesForBase(selBase).map((n) => (
                    <div key={n} className="anat-exo-row">
                      <button className="anat-exo-demo" aria-label={'Ver demonstração de ' + n} onClick={() => openDemo(n)}><IonIcon icon={eyeOutline} /></button>
                      <button className="anat-exo" onClick={() => setAddingEx(n)}>{n} <span className="anat-exo-add">＋</span></button>
                    </div>
                  ))}
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
            <b>{shapeGoal?.emoji} Meta: {shapeGoal?.name}</b>
          </div>
          {gaps.length ? (
            <>
              <p className="anat-gap-h">O que mais te afasta do shape (toque pra ver exercícios):</p>
              <div className="anat-subs">
                {gaps.map((g) => (
                  <button key={g.base} className="ds-chip anat-gap" onClick={() => pickBase(g.base)}>
                    {BASE_LABEL[g.base] || g.base}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Você está no caminho da meta 👍 Continue equilibrando.</p>
          )}
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

      {/* ===== Compartilhar músculos treinados (card de Anatomia) ===== */}
      <div className="anat-share">
        <div className="anat-share-h">📤 Compartilhar músculos treinados</div>
        <div className="ds-seg anat-share-kind">
          <button className={pKind === 'week' ? 'on' : ''} onClick={() => setPKind('week')}>Semana</button>
          <button className={pKind === 'month' ? 'on' : ''} onClick={() => setPKind('month')}>Mês</button>
          <button className={pKind === 'year' ? 'on' : ''} onClick={() => setPKind('year')}>Ano</button>
        </div>
        <div className="anat-share-pick">
          {pKind === 'week' && (
            <select aria-label="Semana" value={wIdx} onChange={(e) => setPWeek(Number(e.target.value))}>
              {monthWeeks.map((_, i) => <option key={i} value={i}>Semana {i + 1}</option>)}
            </select>
          )}
          {pKind !== 'year' && (
            <select aria-label="Mês" value={pMonth} onChange={(e) => { setPMonth(Number(e.target.value)); setPWeek(0); }}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          )}
          <select aria-label="Ano" value={pYear} onChange={(e) => setPYear(Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button className="anat-share-btn" onClick={doShareAnatomy} disabled={sharing || periodStats.total === 0}>
          <IonIcon icon={shareOutline} /> {sharing ? 'Gerando…' : periodStats.total === 0 ? 'Sem treino nesse período' : `Compartilhar · ${periodRange.label}`}
        </button>
      </div>

      {/* bonecos escondidos (frente+verso) p/ rasterizar o card no período escolhido */}
      <div aria-hidden className="anat-hidden">
        <div ref={frontRef}>
          {gender === 'male'
            ? <MaleBody view="front" bodyState={periodMaleState} onMuscle={() => {}} colors={maleColors} />
            : <Body data={periodData} side="front" gender="female" colors={shades} defaultFill={bodyColor} border="none" scale={1.1} />}
        </div>
        <div ref={backRef}>
          {gender === 'male'
            ? <MaleBody view="back" bodyState={periodMaleState} onMuscle={() => {}} colors={maleColors} />
            : <Body data={periodData} side="back" gender="female" colors={shades} defaultFill={bodyColor} border="none" scale={1.1} />}
        </div>
      </div>

      {/* mandar exercício pro treino A–E */}
      <IonActionSheet
        isOpen={!!addingEx}
        header={addingEx ? `Adicionar "${addingEx}" em:` : ''}
        buttons={[
          ...workoutKeys.map((k) => ({ text: `Treino ${k}`, handler: () => sendToWorkout(k) })),
          { text: 'Cancelar', role: 'cancel' as const },
        ]}
        onDidDismiss={() => setAddingEx(null)}
      />

      {/* demonstração do exercício (mesmo sheet do Treino) */}
      <DemoSheet ex={demoEx} onClose={() => setDemoEx(null)} />
    </div>
  );
};

export default Anatomia;
