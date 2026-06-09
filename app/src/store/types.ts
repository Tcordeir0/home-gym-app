// Tipos do estado — COMPATÍVEIS com o v1 (mesma chave localStorage "hgt_v2"),
// pra que no cutover (mesmo domínio) o app leia os dados existentes sem migração.

export type Sex = 'm' | 'f';
export type Goal = 'lose' | 'losefast' | 'maintain' | 'gain';
export type Feedback = 'both' | 'sound' | 'vibrate' | 'none';

export interface Body {
  height: number | null;
  age: number | null;
  sex: Sex;
  neck: number | null;
  hip: number | null;
  activity: number; // fator (1.2..1.9)
  goal: Goal;
}

export interface Cardio {
  label: string;
  emoji?: string;
}

export interface Cosmetics {
  themes: string[];
  hats: string[];
  theme: string | null;
  hat: string | null;
}

export interface Schedule {
  days: number[];
  time: string;
  ntfy: string;
}

export interface Quests {
  week: string;
  claimed: Record<string, boolean>;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
  equipment: string[];
  cardios: Cardio[];
  focus?: string;
  labels?: Record<string, string>;
  treinos?: Record<string, unknown>;
  cosmetics: Cosmetics;
  spinsUsed: number;
  lifeSpinsUsed: number;
  freezes: number;
  quests: Quests;
  schedule: Schedule;
  body: Body;
  level?: number;
  photo?: string;
  bottleMl?: number; // tamanho da garrafa de água deste perfil (ml)
  location?: 'casa' | 'academia'; // local de treino — alimenta o gerador
}

export interface SetEntry {
  kg?: number | null;
  reps?: number | null;
}

export interface HistoryEntry {
  date: string; // AAAA-MM-DD
  w: 'A' | 'B' | 'C' | 'cardio';
  t?: string; // tipo de cardio
  emoji?: string;
  exercises?: { nome: string; sets: SetEntry[] }[];
}

export interface Measure {
  date: string;
  weight?: number;
  arm?: number;
  chest?: number;
  waist?: number;
  photo?: string;
}

export interface FoodItem {
  n: string; // nome
  k: number; // kcal/100g
  p: number; // proteína/100g
  g: number; // gramas
}

export interface DailyEntry {
  water?: number; // (legado v1: nº copos)
  waterMl?: number; // hidratação em ml (modelo novo, com meta calculada)
  food?: FoodItem[];
}

export interface Score {
  byDay: Record<string, number>;
}

export interface Poke {
  fromName: string;
  msg: string;
  date: string;
}

export interface Notif {
  ts: number;
  type: string;
  msg: string;
  read: boolean;
}

/** Estado raiz — mesmo shape do v1. */
export interface AppState {
  users: Profile[];
  active: string;
  checks: Record<string, unknown>;
  history: Record<string, HistoryEntry[]>;
  scores: Record<string, Score>;
  soundOn: boolean;
  feedback: Feedback;
  appTheme: 'dark' | 'light';
  pokes: Record<string, Poke>;
  session: Record<string, unknown>;
  celebrated: Record<string, string[]>;
  notifs: Record<string, Notif[]>;
  setlog: Record<string, unknown>;
  measures: Record<string, Measure[]>;
  daily: Record<string, Record<string, DailyEntry>>;
}
