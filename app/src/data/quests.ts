import type { HistoryEntry, Measure, DailyEntry } from '../store/types';

export interface QuestCtx {
  history: HistoryEntry[];
  measures: Measure[];
  daily: Record<string, DailyEntry>;
  weekDays: string[];
}

export interface Quest {
  id: string;
  label: string;
  emoji: string;
  target: number;
  reward: number;
  progress: (c: QuestCtx) => number;
}

/** Desafios da semana — reiniciam toda segunda. */
export const QUESTS: Quest[] = [
  {
    id: 'treinos3', label: 'Treine 3x esta semana', emoji: '🏋️', target: 3, reward: 40,
    progress: (c) => c.history.filter((e) => c.weekDays.includes(e.date) && e.w !== 'cardio').length,
  },
  {
    id: 'cardio2', label: 'Faça 2 cardios', emoji: '🏃', target: 2, reward: 30,
    progress: (c) => c.history.filter((e) => c.weekDays.includes(e.date) && e.w === 'cardio').length,
  },
  {
    id: 'agua4', label: 'Bata a água em 4 dias', emoji: '💧', target: 4, reward: 30,
    progress: (c) => c.weekDays.filter((d) => (c.daily[d]?.waterMl || 0) >= 2000).length,
  },
  {
    id: 'peso1', label: 'Registre o peso', emoji: '⚖️', target: 1, reward: 20,
    progress: (c) => c.measures.filter((m) => c.weekDays.includes(m.date) && typeof m.weight === 'number').length,
  },
];
