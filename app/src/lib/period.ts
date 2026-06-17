// Helpers de período/data (puros, sem dependência de UI) — usados pela Anatomia (share por
// semana/mês/ano) e testáveis isoladamente.

export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const MONTHS_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/** Data local → 'AAAA-MM-DD'. */
export const isoDay = (d: Date): string =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/** Semanas do calendário (segunda→domingo) que tocam o mês, recortadas aos limites do mês. */
export function weeksOfMonth(year: number, month: number): { from: string; to: string }[] {
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
