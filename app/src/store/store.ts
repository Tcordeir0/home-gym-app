import { create } from 'zustand';
import { produce } from 'immer';
import type { AppState, Profile, Body, Cardio, HistoryEntry } from './types';
import { weekDates } from '../lib/league';
import { pickPrize, PRIZES, type Prize } from '../data/roulette';
import { themeUnlocked, THEMES } from '../data/themes';
import { decoUnlocked, DECOS } from '../data/decos';
import { frameUnlocked, FRAMES } from '../data/frames';

export interface SetRow {
  kg: string;
  reps: string;
  done: boolean;
}
type Setlog = Record<string, Record<string, Record<number, SetRow[]>>>;

const PTS_SET = 5;
const PTS_TREINO = 50;
const PTS_CARDIO = 30;

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
    location: 'casa',
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
    if (!Array.isArray(u.cosmetics.frames)) u.cosmetics.frames = [];
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
  deleteProfile: (id: string) => void;
  setFeedback: (f: AppState['feedback']) => void;
  setTheme: (t: string) => void;
  setHat: (id: string) => void;
  setFrame: (id: string) => void;
  setThemePhoto: (on: boolean) => void;
  updateProfile: (id: string, patch: Partial<Profile>) => void;
  // Treino
  setSetField: (treino: string, exIdx: number, setIdx: number, field: 'kg' | 'reps', v: string, series: number) => void;
  toggleSetDone: (treino: string, exIdx: number, setIdx: number, series: number) => void;
  completeWorkout: (treino: string, exs: { nome: string }[]) => 'ok' | 'dup' | 'empty';
  lastBestSet: (nome: string) => { kg: number; reps: number } | null;
  addCardio: (label: string, emoji?: string) => void;
  // Dieta
  latestMeasure: (field: 'weight' | 'arm' | 'chest' | 'waist') => number | null;
  setWeightToday: (kg: number) => void;
  setMeasureField: (field: 'arm' | 'chest' | 'waist', value: number) => void;
  setProgressPhoto: (dataUrl: string) => void;
  removeProgressPhoto: (date: string) => void;
  progressPhotos: () => { date: string; photo: string }[];
  measureSeries: (field: 'weight' | 'arm' | 'chest' | 'waist') => { x: string; y: number }[];
  updateActiveBody: (patch: Partial<Body>) => void;
  weightSeries: () => { x: string; y: number }[];
  addWaterToday: (ml: number) => void;
  addFoodToday: (item: { n: string; k: number; p: number; g: number }) => void;
  setFoodGrams: (idx: number, g: number) => void;
  removeFoodToday: (idx: number) => void;
  removeHistoryEntry: (idx: number) => void;
  addBackdated: (w: 'A' | 'B' | 'C' | 'cardio', date: string, cardio?: { label: string; emoji?: string }) => 'ok' | 'dup';
  claimQuest: (id: string, reward: number) => void;
  spinsAvailable: () => number;
  spinRoulette: () => { prize: Prize; index: number } | null;
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

export const useStore = create<Store>((set, get) => {
  const initial = loadState();
  // perfil ativo deste APARELHO manda (privacidade)
  const da = getDeviceActive();
  if (da && initial.users.some((u) => u.id === da)) initial.active = da;
  else setDeviceActive(initial.active);

  return {
    ...initial,
    setActive: (id) => { setDeviceActive(id); set({ active: id }); },
    setFeedback: (f) => set({ feedback: f }),
    setTheme: (t) =>
      set(produce((s: Store) => {
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
        if (!themeUnlocked(t, u.cosmetics.themes || [], u.name)) return; // só aplica se desbloqueado
        u.cosmetics.theme = t;
      })),
    setHat: (id) =>
      set(produce((s: Store) => {
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
        if (!decoUnlocked(id, u.cosmetics.hats || [], u.name)) return;
        u.cosmetics.hat = id === 'none' ? null : id;
      })),
    setFrame: (id) =>
      set(produce((s: Store) => {
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
        if (!frameUnlocked(id, u.cosmetics.frames || [], u.name)) return;
        u.cosmetics.frame = id === 'none' ? null : id;
      })),
    setThemePhoto: (on) =>
      set(produce((s: Store) => {
        const u = s.users.find((x) => x.id === s.active);
        if (!u) return;
        if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
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
    deleteProfile: (id) => {
      if (get().users.length <= 1) return; // mantém ao menos 1 perfil
      set(produce((s: Store) => {
        s.users = s.users.filter((u) => u.id !== id);
        const maps: (keyof AppState)[] = ['checks', 'history', 'scores', 'pokes', 'session', 'celebrated', 'notifs', 'setlog', 'measures', 'daily'];
        maps.forEach((k) => { delete (s[k] as Record<string, unknown>)[id]; });
        if (s.active === id) s.active = s.users[0].id;
      }));
      if (getDeviceActive() === id) setDeviceActive(get().active);
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

    addCardio: (label, emoji) =>
      set(produce((s: Store) => {
        const uid = s.active;
        const today = todayISO();
        const h = (s.history[uid] = s.history[uid] || []);
        h.push({ date: today, w: 'cardio', t: label, emoji });
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
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e.weight = kg;
        else arr.push({ date: t, weight: kg });
      })),

    setMeasureField: (field, value) =>
      set(produce((s: Store) => {
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e[field] = value;
        else arr.push({ date: t, [field]: value });
      })),

    setProgressPhoto: (dataUrl) =>
      set(produce((s: Store) => {
        const uid = s.active;
        const t = todayISO();
        const arr = (s.measures[uid] = s.measures[uid] || []);
        const e = arr.find((m) => m.date === t);
        if (e) e.photo = dataUrl;
        else arr.push({ date: t, photo: dataUrl });
      })),

    removeProgressPhoto: (date) =>
      set(produce((s: Store) => {
        const arr = s.measures[s.active];
        if (!arr) return;
        const e = arr.find((m) => m.date === date);
        if (e) delete e.photo;
      })),

    progressPhotos: () => {
      const s = get();
      return (s.measures[s.active] || [])
        .filter((m) => typeof m.photo === 'string' && m.photo)
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .map((m) => ({ date: m.date, photo: m.photo as string }));
    },

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
        const u = s.users.find((x) => x.id === s.active);
        if (u) u.body = { ...u.body, ...patch };
      })),

    weightSeries: () => {
      const s = get();
      return (s.measures[s.active] || [])
        .filter((m) => typeof m.weight === 'number')
        .slice()
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        .map((m) => ({ x: m.date, y: m.weight as number }));
    },

    addWaterToday: (ml) =>
      set(produce((s: Store) => {
        const uid = s.active;
        const t = todayISO();
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[t] = dd[t] || {};
        dd[t].waterMl = Math.max(0, (dd[t].waterMl || 0) + ml);
      })),

    addFoodToday: (item) =>
      set(produce((s: Store) => {
        const uid = s.active;
        const t = todayISO();
        const dd = (s.daily[uid] = s.daily[uid] || {});
        dd[t] = dd[t] || {};
        dd[t].food = dd[t].food || [];
        dd[t].food!.push(item);
      })),

    setFoodGrams: (idx, g) =>
      set(produce((s: Store) => {
        const f = s.daily[s.active]?.[todayISO()]?.food;
        if (f && f[idx]) f[idx].g = g;
      })),

    removeFoodToday: (idx) =>
      set(produce((s: Store) => {
        const f = s.daily[s.active]?.[todayISO()]?.food;
        if (f) f.splice(idx, 1);
      })),

    addBackdated: (w, date, cardio) => {
      const s0 = get();
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
      return Math.max(0, Math.floor(pts / 100) - (u?.spinsUsed || 0));
    },

    spinRoulette: () => {
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
          if (!u.cosmetics) u.cosmetics = { themes: [], hats: [], theme: null, hat: null };
          if (prize.kind === 'frame') {
            const owned = u.cosmetics.frames || [];
            const locked = FRAMES.filter((fr) => !fr.free && !owned.includes(fr.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.frames = [...owned, won.id];
              result = { ...prize, label: `Aro ${won.name}`, emoji: '⭕' };
            } else { sc.byDay[t] = (sc.byDay[t] || 0) + 30; result = { id: 'p30b', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 0 }; }
          } else if (prize.kind === 'theme') {
            const owned = u.cosmetics.themes || [];
            const locked = THEMES.filter((th) => !th.free && !owned.includes(th.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.themes = [...owned, won.id];
              result = { ...prize, label: `Tema ${won.name}`, emoji: won.emoji };
            } else { sc.byDay[t] = (sc.byDay[t] || 0) + 30; result = { id: 'p30b', label: '+30 pts', emoji: '💠', kind: 'pts', value: 30, weight: 0 }; }
          } else {
            const owned = u.cosmetics.hats || [];
            const locked = DECOS.filter((d) => !d.free && !owned.includes(d.id));
            if (locked.length) {
              const won = locked[Math.floor(Math.random() * locked.length)];
              u.cosmetics.hats = [...owned, won.id];
              result = { ...prize, label: won.name, emoji: won.emoji };
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
