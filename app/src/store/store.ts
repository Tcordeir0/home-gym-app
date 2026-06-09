import { create } from 'zustand';
import { produce } from 'immer';
import type { AppState, Profile, Body, Cardio, HistoryEntry } from './types';

export interface SetRow {
  kg: string;
  reps: string;
  done: boolean;
}
type Setlog = Record<string, Record<string, Record<number, SetRow[]>>>;

const PTS_SET = 5;
const PTS_TREINO = 50;

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
  'users', 'active', 'checks', 'history', 'scores', 'soundOn', 'feedback',
  'appTheme', 'pokes', 'session', 'celebrated', 'notifs', 'setlog', 'measures', 'daily',
];

const COLORS = ['#c6ff3a', '#ff5fa8', '#3ad1ff', '#a78bfa', '#ffd166', '#ff8a3a', '#34d399', '#ff6b6b', '#7c9cff', '#c084fc'];

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
function newProfile(id: string, name: string, color: string): Profile {
  return {
    id, name, color,
    equipment: ['bodyweight', 'dumbbell'],
    cardios: defaultCardios(),
    focus: 'Geral',
    cosmetics: { themes: [], hats: [], theme: null, hat: null },
    spinsUsed: 0, lifeSpinsUsed: 0, freezes: 0,
    quests: { week: '', claimed: {} },
    schedule: { days: [], time: '18:00', ntfy: '' },
    body: defaultBody(),
  };
}

function defaultState(): AppState {
  return {
    users: [newProfile('u1', 'Talys', '#c6ff3a'), newProfile('u2', 'Andressa', '#ff5fa8')],
    active: 'u1',
    checks: {}, history: {}, scores: {}, soundOn: true, feedback: 'both', appTheme: 'dark',
    pokes: {}, session: {}, celebrated: {}, notifs: {}, setlog: {}, measures: {}, daily: {},
  };
}

/** Garante todos os campos (igual migrateState do v1). */
function migrate(raw: Partial<AppState>): AppState {
  const s = { ...defaultState(), ...raw } as AppState;
  s.checks = s.checks || {}; s.history = s.history || {}; s.scores = s.scores || {};
  s.pokes = s.pokes || {}; s.session = s.session || {}; s.celebrated = s.celebrated || {};
  s.notifs = s.notifs || {}; s.setlog = s.setlog || {}; s.measures = s.measures || {}; s.daily = s.daily || {};
  if (typeof s.soundOn !== 'boolean') s.soundOn = true;
  if (!s.feedback) s.feedback = 'both';
  if (!s.appTheme) s.appTheme = 'dark';
  (s.users || []).forEach((u, i) => {
    if (!u.color) u.color = COLORS[i % COLORS.length];
    if (!Array.isArray(u.equipment)) u.equipment = ['bodyweight', 'dumbbell'];
    if (!Array.isArray(u.cardios) || !u.cardios.length) u.cardios = defaultCardios();
    if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
    if (typeof u.spinsUsed !== 'number') u.spinsUsed = 0;
    if (typeof u.lifeSpinsUsed !== 'number') u.lifeSpinsUsed = 0;
    if (typeof u.freezes !== 'number') u.freezes = 0;
    if (!u.quests) u.quests = { week: '', claimed: {} };
    if (!u.schedule) u.schedule = { days: [], time: '18:00', ntfy: '' };
    if (!u.body) u.body = defaultBody();
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
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  // Treino
  setSetField: (treino: string, exIdx: number, setIdx: number, field: 'kg' | 'reps', v: string, series: number) => void;
  toggleSetDone: (treino: string, exIdx: number, setIdx: number, series: number) => void;
  completeWorkout: (treino: string, exs: { nome: string }[]) => 'ok' | 'dup' | 'empty';
  lastBestSet: (nome: string) => { kg: number; reps: number } | null;
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

export const useStore = create<Store>((set, get) => {
  const initial = loadState();
  // perfil ativo deste APARELHO manda (privacidade)
  const da = getDeviceActive();
  if (da && initial.users.some((u) => u.id === da)) initial.active = da;
  else setDeviceActive(initial.active);

  return {
    ...initial,
    setActive: (id) => { setDeviceActive(id); set({ active: id }); },
    addProfile: () => {
      const id = 'u' + Date.now();
      const color = COLORS[get().users.length % COLORS.length];
      const p = newProfile(id, 'Novo perfil', color);
      setDeviceActive(id);
      set((s) => ({ users: [...s.users, p], active: id }));
      return id;
    },
    updateProfile: (id, patch) =>
      set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),

    setSetField: (treino, exIdx, setIdx, field, v, series) =>
      set(produce((s: Store) => { ensureRow(s, s.active, treino, exIdx, series)[setIdx][field] = v; })),

    toggleSetDone: (treino, exIdx, setIdx, series) =>
      set(produce((s: Store) => {
        const r = ensureRow(s, s.active, treino, exIdx, series)[setIdx];
        r.done = !r.done;
      })),

    completeWorkout: (treino, exs) => {
      const s0 = get();
      const uid = s0.active;
      const today = todayISO();
      const hist = s0.history[uid] || [];
      if (hist.some((e) => e.date === today && e.w === treino)) return 'dup';
      const sl = (s0.setlog as Setlog)[uid]?.[treino] || {};
      let doneSets = 0;
      const exercises = exs.map((ex, i) => {
        const rows = sl[i] || [];
        const sets = rows
          .filter((r) => r.done)
          .map((r) => ({ kg: r.kg ? parseFloat(r.kg) : null, reps: r.reps ? parseInt(r.reps, 10) : null }));
        doneSets += sets.length;
        return { nome: ex.nome, sets };
      });
      if (doneSets === 0) return 'empty';
      set(produce((s: Store) => {
        const h = (s.history[uid] = s.history[uid] || []);
        h.push({ date: today, w: treino as HistoryEntry['w'], exercises });
        const sc = (s.scores[uid] = s.scores[uid] || { byDay: {} });
        sc.byDay[today] = (sc.byDay[today] || 0) + PTS_TREINO + PTS_SET * doneSets;
        delete (s.setlog as Setlog)[uid][treino];
      }));
      return 'ok';
    },

    lastBestSet: (nome) => {
      const s = get();
      const uid = s.active;
      const hist = (s.history[uid] || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
      for (const e of hist) {
        const ex = e.exercises?.find((x) => x.nome === nome);
        if (ex && ex.sets.length) {
          let best = ex.sets[0];
          ex.sets.forEach((st) => { if ((st.kg || 0) > (best.kg || 0)) best = st; });
          if (best.kg != null || best.reps != null) return { kg: best.kg || 0, reps: best.reps || 0 };
        }
      }
      return null;
    },
  };
});

// salva em toda mudança
useStore.subscribe((state) => persist(state));

/** Selector: perfil ativo. */
export function useActiveProfile(): Profile {
  return useStore((s) => s.users.find((u) => u.id === s.active) || s.users[0]);
}
