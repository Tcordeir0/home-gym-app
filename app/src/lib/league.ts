// Liga da família — ranking semanal por pontos (local, multi-perfil).
import type { AppState } from './../store/types';

function iso(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Datas (AAAA-MM-DD) da semana atual, segunda→domingo. */
export function weekDates(base = new Date()): string[] {
  const d = new Date(base);
  const offset = (d.getDay() + 6) % 7; // 0 = segunda
  const mon = new Date(d);
  mon.setDate(d.getDate() - offset);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    out.push(iso(x));
  }
  return out;
}

export interface LeagueRow {
  id: string;
  name: string;
  color: string;
  pts: number;
  photo?: string;
}

type LeagueInput = Pick<AppState, 'users' | 'scores'>;

/** Pontos de cada perfil NA SEMANA atual, ordenado do maior pro menor. */
export function familyLeague(state: LeagueInput, base = new Date()): LeagueRow[] {
  const days = weekDates(base);
  return state.users
    .map((u) => {
      const byDay = state.scores[u.id]?.byDay || {};
      const pts = days.reduce((a, d) => a + (byDay[d] || 0), 0);
      return { id: u.id, name: u.name, color: u.color, photo: u.photo, pts };
    })
    .sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
}
