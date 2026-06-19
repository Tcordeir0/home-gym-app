import { create } from 'zustand';
import { produce } from 'immer';
import type { AppState, Profile, Body, Cardio, HistoryEntry, FoodItem } from './types';
import type { Exercise } from '../data/types';
import { weekDates } from '../lib/league';
import { deviceId } from '../lib/device';
import { mergeExercises } from '../lib/workoutMerge';
import { sameItemIndex } from '../lib/meals';
import { pickPrize, PRIZES, type Prize } from '../data/roulette';
import { themeUnlocked, THEMES } from '../data/themes';
import { decoUnlocked, DECOS } from '../data/decos';
import { frameUnlocked, FRAMES } from '../data/frames';
import { ACHIEVEMENTS } from '../data/achievements';
import { shapeGoalById, defaultShape } from '../data/shapeGoals';
import { statsFor, e1RM, totalPoints } from '../lib/stats';
import { CREATINAS_PER_POINT, type ShopKind } from '../data/shop';
import { PLANS } from '../data/plans';
import { FOODS } from '../data/foods';

// Backfill de carbo/gordura (c/f por 100g) pelo NOME do alimento na base FOODS — assim
// QUALQUER caminho de adição (busca, prato, foto) ganha macros sem alterar cada um.
const _macroIdx = new Map<string, { c?: number; f?: number }>();
const _normFood = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function withMacros(item: { n: string; k: number; p: number; g: number; liq?: boolean; c?: number; f?: number; meal?: FoodItem['meal'] }): FoodItem {
  if (item.c != null && item.f != null) return item;
  if (!_macroIdx.size) for (const fd of FOODS) _macroIdx.set(_normFood(fd.n), { c: fd.c, f: fd.f });
  const m = _macroIdx.get(_normFood(item.n));
  return m ? { ...item, c: item.c ?? m.c, f: item.f ?? m.f } : item;
}

// itens que são RECOMPENSA de conquista — saem da roleta (exclusivos da conquista)
const REWARD_THEMES = new Set(ACHIEVEMENTS.filter((a) => a.reward?.kind === 'theme').map((a) => a.reward!.id));
const REWARD_FRAMES = new Set(ACHIEVEMENTS.filter((a) => a.reward?.kind === 'frame').map((a) => a.reward!.id));
const REWARD_DECOS = new Set(ACHIEVEMENTS.filter((a) => a.reward?.kind === 'deco').map((a) => a.reward!.id));

export interface SetRow {
  kg: string;
  reps: string;
  done: boolean;
  rir?: number; // Reps In Reserve (0–4) — quão perto da falha (autorregulação). undefined = não marcou
}
type Setlog = Record<string, Record<string, Record<number, SetRow[]>>>;

const PTS_SET = 5;
const PTS_TREINO = 50;
const PTS_CARDIO = 30;
const POINTS_PER_SPIN = 100; // pontos necessários por giro da roleta (fonte única)

/** Linhas de série de um exercício (do setlog), preenchidas até `series`. */
export function rowsFor(
  setlog: Setlog,
  uid: string,
  treino: string,
  exIdx: number,
  series: number
): SetRow[] {
  const saved = setlog?.[uid]?.[treino]?.[exIdx];
  const rows: SetRow[] = [];
  for (let i = 0; i < series; i++) {
    rows.push(saved?.[i] ? { ...saved[i] } : { kg: '', reps: '', done: false });
  }
  return rows;
}

const STORAGE_KEY = 'hgt_v2'; // MESMA chave do v1 → cutover lê os dados existentes
const DEVICE_ACTIVE_KEY = 'hgt_active_device';

const STATE_KEYS: (keyof AppState)[] = [
  'users', 'active', 'checks', 'history', 'scores', 'soundOn', 'feedback', 'notifyOn', 'reminder', 'swaps', 'wallet',
  'appTheme', 'pokes', 'session', 'celebrated', 'notifs', 'setlog', 'measures', 'daily',
];

export const COLORS = ['#c6ff3a', '#5cc000', '#ff5fa8', '#3ad1ff', '#a78bfa', '#ffd166', '#ff8a3a', '#34d399', '#ff6b6b', '#7c9cff', '#c084fc'];

export function todayISO(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function defaultCardios(): Cardio[] {
  return [{ label: 'Corrida', emoji: '🏃' }, { label: 'Natação', emoji: '🏊' }];
}
function defaultBody(): Body {
  return { height: null, age: null, sex: 'm', neck: null, hip: null, activity: 1.55, goal: 'lose' };
}
/** Cosméticos padrão (fonte única) — aro elétrico padrão, resto vazio. */
function defaultCosmetics(): Profile['cosmetics'] {
  return { themes: [], hats: [], frames: [], theme: null, hat: null, frame: 'electric' };
}
function newProfile(id: string, name: string, color: string): Profile {
  return {
    id, name, color,
    equipment: ['bodyweight', 'dumbbell'],
    cardios: defaultCardios(),
    focus: 'Geral',
    cosmetics: defaultCosmetics(),
    spinsUsed: 0, lifeSpinsUsed: 0, freezes: 0,
    quests: { week: '', claimed: {} },
    schedule: { days: [], time: '18:00', ntfy: '' },
    body: defaultBody(),
    location: 'casa',
  };
}

function defaultState(): AppState {
  return {
    users: [newProfile('u1', 'Você', COLORS[0])],
    active: 'u1',
    checks: {}, history: {}, scores: {}, soundOn: true, feedback: 'none', notifyOn: false, appTheme: 'dark',
    reminder: { on: false, time: '18:00' },
    swaps: {},
    wallet: {},
    pokes: {}, session: {}, celebrated: {}, notifs: {}, setlog: {}, measures: {}, daily: {},
  };
}

/** Estado inicial de uma conta NOVA: um único perfil com o nome do cadastro. */
function freshStateFor(name: string): AppState {
  const s = defaultState();
  s.users[0].name = (name || '').trim() || 'Você';
  return s;
}

/** Garante todos os campos (igual migrateState do v1). */
function migrate(raw: Partial<AppState>): AppState {
  const s = { ...defaultState(), ...raw } as AppState;
  s.checks = s.checks || {}; s.history = s.history || {}; s.scores = s.scores || {};
  s.pokes = s.pokes || {}; s.session = s.session || {}; s.celebrated = s.celebrated || {};
  s.notifs = s.notifs || {}; s.setlog = s.setlog || {}; s.measures = s.measures || {}; s.daily = s.daily || {};
  if (typeof s.soundOn !== 'boolean') s.soundOn = true;
  // estado pré-permissões (sem notifyOn): zera as chavinhas — começam desativadas
  // e só ligam DEPOIS de conceder a permissão.
  if (typeof s.notifyOn !== 'boolean') { s.notifyOn = false; s.feedback = 'none'; }
  if (!s.feedback) s.feedback = 'none';
  if (!s.reminder || typeof s.reminder.on !== 'boolean') s.reminder = { on: false, time: '18:00' };
  if (!s.swaps) s.swaps = {};
  if (!s.wallet) s.wallet = {};
  if (!s.appTheme) s.appTheme = 'dark';
  (s.users || []).forEach((u, i) => {
    if (!u.color) u.color = COLORS[i % COLORS.length];
    if (!Array.isArray(u.equipment)) u.equipment = ['bodyweight', 'dumbbell'];
    if (!Array.isArray(u.cardios) || !u.cardios.length) u.cardios = defaultCardios();
    if (!u.cosmetics) u.cosmetics = defaultCosmetics();
    if (!Array.isArray(u.cosmetics.frames)) u.cosmetics.frames = [];
    if (u.cosmetics.frame === undefined) u.cosmetics.frame = 'electric'; // aro elétrico padrão
    if (typeof u.spinsUsed !== 'number') u.spinsUsed = 0;
    if (typeof u.lifeSpinsUsed !== 'number') u.lifeSpinsUsed = 0;
    if (typeof u.freezes !== 'number') u.freezes = 0;
    if (!u.quests) u.quests = { week: '', claimed: {} };
    if (!u.schedule) u.schedule = { days: [], time: '18:00', ntfy: '' };
    if (!u.body) u.body = defaultBody();
    if (!u.location) u.location = 'casa';
  });
  if (s.users.length && !s.users.some((u) => u.id === s.active)) s.active = s.users[0].id;
  return s;
}

function loadState(): AppState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (raw && Array.isArray(raw.users)) return migrate(raw);
  } catch { /* ignore */ }
  return defaultState();
}

function getDeviceActive(): string | null {
  try { return localStorage.getItem(DEVICE_ACTIVE_KEY); } catch { return null; }
}
function setDeviceActive(id: string) {
  try { localStorage.setItem(DEVICE_ACTIVE_KEY, id); } catch { /* ignore */ }
}

function persist(state: AppState) {
  const data: Record<string, unknown> = {};
  STATE_KEYS.forEach((k) => { data[k] = state[k]; });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export interface Store extends AppState {
  setActive: (id: string) => void;
  addProfile: () => string;
  claimProfile: (id: string) => void;
  addAndClaimProfile: (name: string) => string;
  deleteProfile: (id: string) => void;
  clearProfileData: (id: string) => void;
  setFeedback: (f: AppState['feedback']) => void;
  setNotifyOn: (v: boolean) => void;
  setReminder: (r: Partial<AppState['reminder']>) => void;
  resetState: () => void;
  initForUser: (name: string) => void;
  setTheme: (t: string) => void;
  setHat: (id: string) => void;
  setFrame: (id: string) => void;
  setThemePhoto: (on: boolean) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  // Treino
  setSetField: (treino: string, exIdx: number, setIdx: number, field: 'kg' | 'reps', v: string, series: number) => void;
  toggleSetDone: (treino: string, exIdx: number, setIdx: number, series: number) => void;
  cycleSetRir: (treino: string, exIdx: number, setIdx: number, series: number) => void;
  swapExercise: (treino: string, exIdx: number, ex: Exercise) => void;
  addExerciseToWorkout: (treino: string, ex: Exercise) => void;
  creatinasBalance: () => number;
  buyCosmetic: (kind: ShopKind, id: string, cost: number) => 'ok' | 'owned' | 'poor';
  completeWorkout: (treino: string, exs: { nome: string }[]) => 'ok' | 'updated' | 'empty';
  prevSets: (nome: string) => { kg: number; reps: number }[];
  exPR: (nome: string) => { kg: number; reps: number; e1rm: number } | null;
  prefillSets: (treino: string, exIdx: number, series: number, sets: { kg: number; reps: number }[]) => void;
  addCardio: (label: string, emoji?: string, mins?: number, start?: string, end?: string) => void;
  // Dieta
  latestMeasure: (field: 'weight' | 'arm' | 'chest' | 'waist') => number | null;
  setWeightToday: (kg: number) => void;
  setMeasureField: (field: 'arm' | 'chest' | 'waist', value: number) => void;
  setProgressPhoto: (dataUrl: string) => void;
  removeProgressPhoto: (date: string) => void;
  measureSeries: (field: 'weight' | 'arm' | 'chest' | 'waist') => { x: string; y: number }[];
  updateActiveBody: (patch: Partial<Body>) => void;
  addWaterOn: (date: string, ml: number) => void;
  addFoodToday: (item: { n: string; k: number; p: number; g: number; liq?: boolean; meal?: FoodItem['meal'] }) => void;
  setFoodGrams: (idx: number, g: number) => void;
  removeFoodToday: (idx: number) => void;
  // versões por DATA (permitem registrar/editar alimentos em dias retroativos)
  addFoodOn: (date: string, item: { n: string; k: number; p: number; g: number; liq?: boolean; meal?: FoodItem['meal'] }) => boolean;
  setFoodGramsOn: (date: string, idx: number, g: number) => void;
  setFoodMeal: (date: string, idx: number, meal: FoodItem['meal']) => void;
  removeFoodOn: (date: string, idx: number) => void;
  copyFoodOn: (fromDate: string, idx: number, toDate: string) => void;
  copyDietFromPrev: (toDate: string) => boolean;
  removeHistoryEntry: (idx: number) => void;
  addBackdated: (w: HistoryEntry['w'], date: string, cardio?: { label: string; emoji?: string }) => 'ok' | 'dup';
  claimQuest: (id: string, reward: number) => void;
  spinsAvailable: () => number;
  spinRoulette: () => { prize: Prize; index: number } | null;
  claimAchievementRewards: () => number;
  grantAccountThemes: (email: string) => void;
  exportState: () => string;
  importState: (json: string) => boolean;
}

function ensureRow(s: AppState, uid: string, treino: string, exIdx: number, series: number) {
  const sl = s.setlog as Setlog;
  sl[uid] = sl[uid] || {};
  sl[uid][treino] = sl[uid][treino] || {};
  if (!sl[uid][treino][exIdx]) {
    sl[uid][treino][exIdx] = Array.from({ length: series }, () => ({ kg: '', reps: '', done: false }));
  }
  return sl[uid][treino][exIdx];
}

/** Anti-trapaça: só o aparelho que REIVINDICOU o perfil ativo pode editá-lo.
 *  Ao visualizar o perfil de outro (modo leitura), as mutações viram no-op. */
export function ownsActive(s: AppState): boolean {
  const u = s.users.find((x) => x.id === s.active);
  return !!u && u.claimedDevice === deviceId();
}

export const useStore = create<Store>((set, get) => {
  const initial = loadState();
  // este APARELHO sempre abre no perfil que ele reivindicou (anti-trapaça);
  // senão cai no último ativo do aparelho.
  const myDev = deviceId();
  const claimed = initial.users.find((u) => u.claimedDevice === myDev);
  if (claimed) { initial.active = claimed.id; setDeviceActive(claimed.id); }
  else {
    const da = getDeviceActive();
    if (da && initial.users.some((u) => u.id === da)) initial.active = da;
    else setDeviceActive(initial.active);
  }

  return {
    ...initial,
    setActive: (id) => { setDeviceActive(id); set({ active: id }); },
    setFeedback: (f) => set({ feedback: f }),
    setNotifyOn: (v) => set({ notifyOn: v }),
    setReminder: (r) => set((s) => ({ reminder: { ...s.reminder, ...r } })),
    resetState: () => set(defaultState()),
    initForUser: (name) => set(freshStateFor(name)),
    setTheme: (t) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = defaultCosmetics();
        if (!themeUnlocked(t, u.cosmetics.themes || [], u.name)) return; // só aplica se desbloqueado
        u.cosmetics.theme = t;
      })),
    setHat: (id) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = defaultCosmetics();
        if (!decoUnlocked(id, u.cosmetics.hats || [], u.name)) return;
        u.cosmetics.hat = id === 'none' ? null : id;
      })),
    setFrame: (id) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = defaultCosmetics();
        if (!frameUnlocked(id, u.cosmetics.frames || [], u.name)) return;
        u.cosmetics.frame = id === 'none' ? null : id;
      })),
    setThemePhoto: (on) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = defaultCosmetics();
        u.cosmetics.photoOff = !on;
      })),
    addProfile: () => {
      const id = 'u' + Date.now();
      const color = COLORS[get().users.length % COLORS.length];
      const p = newProfile(id, 'Novo perfil', color);
      setDeviceActive(id);
      set((s) => ({ users: [...s.users, p], active: id }));
      return id;
    },
    // Este aparelho reivindica um perfil existente (e passa a abrir nele).
    claimProfile: (id) => {
      set(produce((s: Store) => {
        const u = s.users.find((x) => x.id === id);
        if (!u) return;
        u.claimedDevice = deviceId();
        s.active = id;
      }));
      setDeviceActive(id);
    },
    // Cria um perfil novo já reivindicado por este aparelho.
    addAndClaimProfile: (name) => {
      const id = 'u' + Date.now();
      const color = COLORS[get().users.length % COLORS.length];
      const p = newProfile(id, (name || '').trim() || 'Novo perfil', color);
      p.claimedDevice = deviceId();
      setDeviceActive(id);
      set((s) => ({ users: [...s.users, p], active: id }));
      return id;
    },
    deleteProfile: (id) => {
      if (get().users.length <= 1) return; // mantém ao menos 1 perfil
      if (get().users.find((u) => u.id === id)?.claimedDevice !== deviceId()) return; // só apaga o seu
      set(produce((s: Store) => {
        s.users = s.users.filter((u) => u.id !== id);
        const maps: (keyof AppState)[] = ['checks', 'history', 'scores', 'pokes', 'session', 'celebrated', 'notifs', 'setlog', 'measures', 'daily'];
        maps.forEach((k) => { delete (s[k] as Record<string, unknown>)[id]; });
        if (s.active === id) s.active = s.users[0].id;
      }));
      if (getDeviceActive() === id) setDeviceActive(get().active);
    },

    updateProfile: (id, patch) =>
      set((s) => {
        if (s.users.find((u) => u.id === id)?.claimedDevice !== deviceId()) return s; // só edita o seu perfil
        return { users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) };
      }),

    // limpa os DADOS do perfil (treinos/dieta/progresso/pontos) mantendo o perfil e cosméticos
    clearProfileData: (id) => {
      if (get().users.find((u) => u.id === id)?.claimedDevice !== deviceId()) return;
      set(produce((s: Store) => {
        const maps: (keyof AppState)[] = ['checks', 'history', 'scores', 'pokes', 'session', 'celebrated', 'notifs', 'setlog', 'measures', 'daily'];
        maps.forEach((k) => { delete (s[k] as Record<string, unknown>)[id]; });
      }));
    },

    setSetField: (treino, exIdx, setIdx, field, v, series) =>
      set(produce((s: Store) => { if (!ownsActive(s)) return; ensureRow(s, s.active, treino, exIdx, series)[setIdx][field] = v; })),

    toggleSetDone: (treino, exIdx, setIdx, series) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const r = ensureRow(s, s.active, treino, exIdx, series)[setIdx];
        r.done = !r.done;
      })),

    // RIR (Reps In Reserve) da série: cicla 0→1→2→3→4→(limpa). Autorregulação opcional.
    cycleSetRir: (treino, exIdx, setIdx, series) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const r = ensureRow(s, s.active, treino, exIdx, series)[setIdx];
        r.rir = r.rir === undefined ? 0 : r.rir >= 4 ? undefined : r.rir + 1;
      })),

    // saldo de creatinas do perfil ativo = pontos_totais × taxa − já gasto na loja
    creatinasBalance: () => {
      const s = get();
      return Math.floor(totalPoints(s, s.active) * CREATINAS_PER_POINT) - (s.wallet[s.active]?.spent || 0);
    },

    // compra um cosmético com creatinas (desbloqueia + desconta do saldo)
    buyCosmetic: (kind, id, cost) => {
      let res: 'ok' | 'owned' | 'poor' = 'poor';
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const u = s.users.find((x) => x.id === uid);
        if (!u) return;
        u.cosmetics.themes = u.cosmetics.themes || [];
        u.cosmetics.frames = u.cosmetics.frames || [];
        u.cosmetics.hats = u.cosmetics.hats || [];
        const arr = kind === 'theme' ? u.cosmetics.themes : kind === 'frame' ? u.cosmetics.frames : u.cosmetics.hats;
        if (arr.includes(id)) { res = 'owned'; return; }
        const bal = Math.floor(totalPoints(s, uid) * CREATINAS_PER_POINT) - (s.wallet[uid]?.spent || 0);
        if (bal < cost) { res = 'poor'; return; }
        arr.push(id);
        s.wallet[uid] = s.wallet[uid] || { spent: 0 };
        s.wallet[uid].spent += cost;
        res = 'ok';
      }));
      return res;
    },

    // troca um exercício do treino por uma variação (mesma ênfase); zera as séries da posição
    swapExercise: (treino, exIdx, ex) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const sw = (s.swaps[uid] = s.swaps[uid] || {});
        sw[`${treino}:${exIdx}`] = ex;
        const sl = (s.setlog as Record<string, Record<string, Record<number, unknown>>>)[uid];
        if (sl && sl[treino]) delete sl[treino][exIdx];
      })),

    // anexa um exercício (ex.: vindo da Anatomia) a um treino A–E.
    // materializa a ficha do plano padrão se o perfil ainda não tiver treinos próprios.
    addExerciseToWorkout: (treino, ex) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        let tr = u.treinos as Record<string, Exercise[]> | undefined;
        if (!tr || !tr.A) {
          const plan = PLANS[u.id] || PLANS.u1;
          tr = {};
          Object.keys(plan.treinos).forEach((k) => { tr![k] = plan.treinos[k].map((e) => ({ ...e })); });
          u.treinos = tr;
          if (!u.labels) u.labels = { ...plan.labels };
          if (!u.focus) u.focus = plan.focus;
        }
        if (!tr[treino]) tr[treino] = [];
        if (!tr[treino].some((e) => e.nome === ex.nome)) tr[treino].push(ex);
      })),

    completeWorkout: (treino, exs) => {
      const s0 = get();
      if (!ownsActive(s0)) return 'empty';
      const uid = s0.active;
      const today = todayISO();
      const sl = (s0.setlog as Setlog)[uid]?.[treino] || {};
      let doneSets = 0;
      const exercises = exs
        .map((ex, i) => {
          const rows = sl[i] || [];
          const sets = rows
            .filter((r) => r.done)
            .map((r) => ({ kg: r.kg ? parseFloat(r.kg) : null, reps: r.reps ? parseInt(r.reps, 10) : null, ...(typeof r.rir === 'number' ? { rir: r.rir } : {}) }));
          doneSets += sets.length;
          return { nome: ex.nome, sets };
        })
        .filter((e) => e.sets.length > 0); // só exercícios com série feita
      if (doneSets === 0) return 'empty';
      let merged = false;
      set(produce((s: Store) => {
        const h = (s.history[uid] = s.history[uid] || []);
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });
        // já registrou esse treino hoje? Em vez de barrar, MESCLA (ex.: esqueceu 1 exercício).
        const entry = h.find((e) => e.date === today && e.w === treino);
        if (entry) {
          merged = true;
          entry.exercises = mergeExercises(entry.exercises || [], exercises);
          sc.byDay[today] = (sc.byDay[today] || 0) + PTS_SET * doneSets; // sem 2º bônus de treino
        } else {
          h.push({ date: today, w: treino as HistoryEntry['w'], exercises });
          sc.byDay[today] = (sc.byDay[today] || 0) + PTS_TREINO + PTS_SET * doneSets;
        }
        const slMap = s.setlog as Setlog;
        if (slMap[uid]) delete slMap[uid][treino];
      }));
      return merged ? 'updated' : 'ok';
    },

    // séries da ÚLTIMA vez que treinou esse exercício (na ordem) — pra pré-preencher
    prevSets: (nome) => {
      const s = get();
      const hist = (s.history[s.active] || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
      for (const e of hist) {
        const ex = e.exercises?.find((x) => x.nome === nome);
        if (ex && ex.sets.length) return ex.sets.map((st) => ({ kg: st.kg || 0, reps: st.reps || 0 }));
      }
      return [];
    },

    // recorde pessoal por 1RM estimado (Epley) em todo o histórico
    exPR: (nome) => {
      const s = get();
      let best: { kg: number; reps: number; e1rm: number } | null = null;
      for (const e of s.history[s.active] || []) {
        const ex = e.exercises?.find((x) => x.nome === nome);
        if (!ex) continue;
        for (const st of ex.sets) {
          const kg = st.kg || 0, reps = st.reps || 0;
          if (kg <= 0) continue;
          const val = e1RM(kg, reps);
          if (!best || val > best.e1rm) best = { kg, reps, e1rm: val };
        }
      }
      return best;
    },

    // pré-preenche as linhas VAZIAS com os valores informados (não marca como feita)
    prefillSets: (treino, exIdx, series, sets) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const rows = ensureRow(s, s.active, treino, exIdx, series);
        for (let i = 0; i < series && i < sets.length; i++) {
          if (rows[i].kg === '' && rows[i].reps === '' && !rows[i].done) {
            if (sets[i].kg) rows[i].kg = String(sets[i].kg);
            if (sets[i].reps) rows[i].reps = String(sets[i].reps);
          }
        }
      })),

    addCardio: (label, emoji, mins, start, end) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const today = todayISO();
        const h = (s.history[uid] = s.history[uid] || []);
        h.push({ date: today, w: 'cardio', t: label, emoji, mins, start, end });
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });
        sc.byDay[today] = (sc.byDay[today] || 0) + PTS_CARDIO;
      })),

    latestMeasure: (field) => {
      const s = get();
      const arr = s.measures[s.active] || [];
      let best: number | null = null;
      let bestDate = '';
      arr.forEach((m) => {
        const v = m[field];
        if (typeof v === 'number' && m.date >= bestDate) { best = v; bestDate = m.date; }
      });
      return best;
    },

    setWeightToday: (kg) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e.weight = kg;
        else arr.push({ date: t, weight: kg });
      })),

    setMeasureField: (field, value) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e[field] = value;
        else arr.push({ date: t, [field]: value });
      })),

    setProgressPhoto: (dataUrl) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e.photo = dataUrl;
        else arr.push({ date: t, photo: dataUrl });
      })),

    removeProgressPhoto: (date) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const arr = s.measures[s.active];
        if (!arr) return;
        const e = arr.find((m) => m.date === date);
        if (e) delete e.photo;
      })),

    measureSeries: (field) => {
      const s = get();
      return (s.measures[s.active] || [])
        .filter((m) => typeof m[field] === 'number')
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .map((m) => ({ x: m.date, y: m[field] as number }));
    },

    updateActiveBody: (patch) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        const sexChanged = patch.sex && patch.sex !== u.body.sex;
        u.body = { ...u.body, ...patch };
        // ao trocar o sexo: se a meta de shape atual é do outro gênero, volta pro default
        // do novo gênero (senão a grade não destaca nada e o gerador usa pesos errados).
        if (sexChanged) {
          const g = shapeGoalById(u.shapeGoal?.preset)?.gender;
          if (g && g !== 'any' && g !== patch.sex) u.shapeGoal = { preset: defaultShape(patch.sex!) };
        }
      })),

    addWaterOn: (date, ml) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[date] = dd[date] || {};
        dd[date].waterMl = Math.max(0, (dd[date].waterMl || 0) + ml);
      })),

    addFoodToday: (item) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const t = todayISO();
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[t] = dd[t] || {};
        dd[t].food = dd[t].food || [];
        // dedup: mesmo item na mesma refeição+dia não cria linha nova (sem flood)
        if (sameItemIndex(dd[t].food!, item.n, item.meal) < 0) dd[t].food!.push(withMacros(item));
      })),

    setFoodGrams: (idx, g) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const f = s.daily[s.active]?.[todayISO()]?.food;
        if (f && f[idx]) f[idx].g = g;
      })),

    removeFoodToday: (idx) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const f = s.daily[s.active]?.[todayISO()]?.food;
        if (f) f.splice(idx, 1);
      })),

    // ---- alimentos por DATA (dias retroativos) ---- retorna se ADICIONOU (false = já existia, deduplicado)
    addFoodOn: (date, item) => {
      let added = false;
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[date] = dd[date] || {};
        dd[date].food = dd[date].food || [];
        if (sameItemIndex(dd[date].food!, item.n, item.meal) < 0) { dd[date].food!.push(withMacros(item)); added = true; }
      }));
      return added;
    },
    setFoodGramsOn: (date, idx, g) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const f = s.daily[s.active]?.[date]?.food;
        if (f && f[idx]) f[idx].g = g;
      })),
    // muda a refeição (café/almoço/lanche/janta) de um item já lançado
    setFoodMeal: (date, idx, meal) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const f = s.daily[s.active]?.[date]?.food;
        if (f && f[idx]) f[idx].meal = meal;
      })),
    removeFoodOn: (date, idx) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const f = s.daily[s.active]?.[date]?.food;
        if (f) f.splice(idx, 1);
      })),
    // move um alimento de um dia pra outro (corrige registros que foram pro dia errado)
    // COPIA o alimento pra outro dia (mantém no dia original → não some do histórico)
    copyFoodOn: (fromDate, idx, toDate) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        if (fromDate === toDate) return;
        const uid = s.active;
        const from = s.daily[uid]?.[fromDate]?.food;
        if (!from || !from[idx]) return;
        const item = { ...from[idx] };
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[toDate] = dd[toDate] || {};
        dd[toDate].food = dd[toDate].food || [];
        // dedup: não duplica se o mesmo item (nome+refeição) já existe no destino
        if (sameItemIndex(dd[toDate].food!, item.n, item.meal) < 0) dd[toDate].food!.push(item);
      })),
    // copia os alimentos do dia ANTERIOR mais recente com comida → poupa tempo, depois edita
    copyDietFromPrev: (toDate) => {
      let ok = false;
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const dd = (s.daily[uid] = s.daily[uid] || {});
        const prev = Object.keys(dd)
          .filter((d) => d < toDate && (dd[d].food || []).length > 0)
          .sort();
        const src = prev.length ? dd[prev[prev.length - 1]].food || [] : [];
        if (!src.length) return;
        dd[toDate] = dd[toDate] || {};
        dd[toDate].food = dd[toDate].food || [];
        // dedup: ao repetir, não floda itens iguais (nome+refeição) que já estão no dia
        src.forEach((it) => { if (sameItemIndex(dd[toDate].food!, it.n, it.meal) < 0) dd[toDate].food!.push({ ...it }); });
        ok = true;
      }));
      return ok;
    },

    addBackdated: (w, date, cardio) => {
      const s0 = get();
      if (!ownsActive(s0)) return 'dup';
      const uid = s0.active;
      const hist = s0.history[uid] || [];
      if (w !== 'cardio' && hist.some((e) => e.date === date && e.w === w)) return 'dup';
      set(produce((s: Store) => {
        const h = (s.history[uid] = s.history[uid] || []);
        h.push(
          w === 'cardio'
            ? { date, w: 'cardio', t: cardio?.label || 'Cardio', emoji: cardio?.emoji }
            : { date, w, exercises: [] },
        );
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });
        sc.byDay[date] = (sc.byDay[date] || 0) + (w === 'cardio' ? PTS_CARDIO : PTS_TREINO);
      }));
      return 'ok';
    },

    claimQuest: (id, reward) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const u = s.users.find((x) => x.id === uid);
        if (!u) return;
        const wk = weekDates()[0]; // chave da semana = segunda-feira
        if (!u.quests) u.quests = { week: '', claimed: {} };
        if (u.quests.week !== wk) { u.quests.week = wk; u.quests.claimed = {}; }
        if (u.quests.claimed[id]) return;
        u.quests.claimed[id] = true;
        const t = todayISO();
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });
        sc.byDay[t] = (sc.byDay[t] || 0) + reward;
      })),

    spinsAvailable: () => {
      const s = get();
      const uid = s.active;
      const byDay = s.scores[uid]?.byDay || {};
      const pts = Object.keys(byDay).reduce((a, k) => a + byDay[k], 0);
      const u = s.users.find((x) => x.id === uid);
      return Math.max(0, Math.floor(pts / POINTS_PER_SPIN) - (u?.spinsUsed || 0));
    },

    spinRoulette: () => {
      if (!ownsActive(get())) return null;
      if (get().spinsAvailable() <= 0) return null;
      const prize = pickPrize();
      const index = PRIZES.indexOf(prize);
      let result: Prize = prize;
      set(produce((s: Store) => {
        const uid = s.active;
        const u = s.users.find((x) => x.id === uid);
        if (!u) return;
        u.spinsUsed = (u.spinsUsed || 0) + 1;
        const t = todayISO();
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });

        if (prize.kind === 'theme' || prize.kind === 'deco' || prize.kind === 'frame') {
          if (!u.cosmetics) u.cosmetics = defaultCosmetics();
          if (prize.kind === 'frame') {
            const owned = u.cosmetics.frames || [];
            const locked = FRAMES.filter((fr) => !fr.free && !fr.account && !owned.includes(fr.id) && !REWARD_FRAMES.has(fr.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.frames = [...owned, won.id];
              result = { ...prize, label: `Aro ${won.name}`, emoji: '⭕' };
            } else { sc.byDay[t] = (sc.byDay[t] || 0) + 30; result = { id: 'p30b', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 0 }; }
          } else if (prize.kind === 'theme') {
            const owned = u.cosmetics.themes || [];
            const locked = THEMES.filter((th) => !th.free && !th.exclusive && !th.account && !owned.includes(th.id) && !REWARD_THEMES.has(th.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.themes = [...owned, won.id];
              result = { ...prize, label: `Tema ${won.name}`, emoji: won.emoji };
            } else { sc.byDay[t] = (sc.byDay[t] || 0) + 30; result = { id: 'p30b', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 0 }; }
          } else {
            const owned = u.cosmetics.hats || [];
            const locked = DECOS.filter((d) => !d.free && !owned.includes(d.id) && !REWARD_DECOS.has(d.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.hats = [...owned, won.id];
              result = { ...prize, label: won.name, emoji: '✨' };
            } else { sc.byDay[t] = (sc.byDay[t] || 0) + 30; result = { id: 'p30b', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 0 }; }
          }
        } else if (prize.kind === 'pts') {
          sc.byDay[t] = (sc.byDay[t] || 0) + prize.value;
        } else if (prize.kind === 'freeze') {
          u.freezes = (u.freezes || 0) + prize.value;
        }
      }));
      return { prize: result, index };
    },

    // concede os itens das conquistas já atingidas que ainda não estão na conta.
    // Retorna quantos itens novos foram desbloqueados (pra mostrar toast).
    claimAchievementRewards: () => {
      let granted = 0;
      set(produce((s: Store) => {
        if (!ownsActive(s)) return; // não concede recompensa num perfil que não é deste aparelho
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], frames: [], theme: null, hat: null, frame: null };
        const stats = statsFor(s, s.active);
        ACHIEVEMENTS.forEach((a) => {
          if (!a.reward || !a.test(stats)) return;
          const { kind, id } = a.reward;
          if (kind === 'theme') {
            if (!u.cosmetics.themes.includes(id)) { u.cosmetics.themes.push(id); granted++; }
          } else if (kind === 'frame') {
            const f = u.cosmetics.frames || (u.cosmetics.frames = []);
            if (!f.includes(id)) { f.push(id); granted++; }
          } else if (kind === 'deco') {
            if (!u.cosmetics.hats.includes(id)) { u.cosmetics.hats.push(id); granted++; }
          }
        });
      }));
      return granted;
    },

    // libera os temas E aros vinculados a uma CONTA (email) p/ todos os perfis dela.
    grantAccountThemes: (email) => {
      const mail = (email || '').trim().toLowerCase();
      if (!mail) return;
      const themeIds = THEMES.filter((t) => t.account && t.account.toLowerCase() === mail).map((t) => t.id);
      const frameIds = FRAMES.filter((f) => f.account && f.account.toLowerCase() === mail).map((f) => f.id);
      if (!themeIds.length && !frameIds.length) return;
      set(produce((s: Store) => {
        s.users.forEach((u) => {
          if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], frames: [], theme: null, hat: null, frame: null };
          themeIds.forEach((id) => { if (!u.cosmetics.themes.includes(id)) u.cosmetics.themes.push(id); });
          const fr = u.cosmetics.frames || (u.cosmetics.frames = []);
          frameIds.forEach((id) => { if (!fr.includes(id)) fr.push(id); });
        });
      }));
    },

    exportState: () => {
      const s = get();
      const data: Record<string, unknown> = {};
      STATE_KEYS.forEach((k) => { data[k] = s[k]; });
      return JSON.stringify(data, null, 2);
    },

    importState: (json) => {
      try {
        const raw = JSON.parse(json);
        if (!raw || !Array.isArray(raw.users)) return false;
        set(migrate(raw));
        return true;
      } catch {
        return false;
      }
    },

    removeHistoryEntry: (idx) =>
      set(produce((s: Store) => {
        if (!ownsActive(s)) return;
        const uid = s.active;
        const list = s.history[uid];
        if (!list || !list[idx]) return;
        const e = list[idx];
        // devolve os pontos que essa sessão deu
        let pts = 0;
        if (e.w === 'cardio') pts = PTS_CARDIO;
        else {
          let sets = 0;
          (e.exercises || []).forEach((x) => { sets += x.sets.length; });
          pts = PTS_TREINO + PTS_SET * sets;
        }
        const sc = s.scores[uid];
        if (sc && sc.byDay[e.date] != null) sc.byDay[e.date] = Math.max(0, sc.byDay[e.date] - pts);
        list.splice(idx, 1);
      })),
  };
});

// salva em toda mudança
useStore.subscribe((state) => persist(state));

/** Selector: perfil ativo. */
export function useActiveProfile(): Profile {
  return useStore((s) => s.users.find((u) => u.id === s.active) || s.users[0]);
}
