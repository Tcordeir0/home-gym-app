import { describe, it, expect } from 'vitest';
import { weeksOfMonth, isoDay, MONTHS } from './period';

describe('weeksOfMonth (semanas seg→dom recortadas ao mês)', () => {
  it('a 1ª semana começa no dia 1 e a última termina no último dia do mês', () => {
    const w = weeksOfMonth(2026, 5); // junho/2026
    expect(w.length).toBeGreaterThanOrEqual(4);
    expect(w[0].from).toBe('2026-06-01');
    expect(w[w.length - 1].to).toBe('2026-06-30');
  });

  it('cada semana tem from <= to e está dentro do mês', () => {
    for (const { from, to } of weeksOfMonth(2026, 5)) {
      expect(from <= to).toBe(true);
      expect(from >= '2026-06-01').toBe(true);
      expect(to <= '2026-06-30').toBe(true);
    }
  });

  it('semanas são contíguas (a próxima começa 1 dia após o fim da anterior)', () => {
    const w = weeksOfMonth(2026, 5);
    for (let i = 1; i < w.length; i++) {
      const prevTo = new Date(w[i - 1].to + 'T12:00:00');
      const curFrom = new Date(w[i].from + 'T12:00:00');
      const gapDays = Math.round((curFrom.getTime() - prevTo.getTime()) / 86400000);
      expect(gapDays).toBe(1);
    }
  });

  it('fevereiro (mês curto) e dezembro (vira o ano) também fecham certo', () => {
    expect(weeksOfMonth(2026, 1)[0].from).toBe('2026-02-01');
    const dez = weeksOfMonth(2026, 11);
    expect(dez[dez.length - 1].to).toBe('2026-12-31');
  });

  it('isoDay formata AAAA-MM-DD com zero à esquerda', () => {
    expect(isoDay(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(MONTHS.length).toBe(12);
  });
});
