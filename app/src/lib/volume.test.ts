import { describe, it, expect } from 'vitest';
import { weeklyTarget, classifyVolume, spacedDays, landmark, focusFrequency, spacedPairs } from './volume';

describe('weeklyTarget', () => {
  it('foco mira o topo do MAV; não-foco o meio', () => {
    const L = landmark('chest'); // mav [12,20]
    expect(weeklyTarget('chest', true)).toBe(20);   // topo
    expect(weeklyTarget('chest', false)).toBe(16);  // meio (12+20)/2
    expect(weeklyTarget('chest', true)).toBeGreaterThan(weeklyTarget('chest', false));
    expect(weeklyTarget('chest', true)).toBeLessThanOrEqual(L.mrv); // nunca acima do MRV
  });
});

describe('classifyVolume', () => {
  it('abaixo do MEV = below, acima do MRV = above, no meio = on', () => {
    expect(classifyVolume('chest', 5)).toBe('below');  // < MEV 10
    expect(classifyVolume('chest', 16)).toBe('on');    // dentro
    expect(classifyVolume('chest', 30)).toBe('above'); // > MRV 22
  });
});

describe('spacedDays — sem dias consecutivos (respeita ~48h)', () => {
  it('5 dias, 3 sessões → A,C,E (0,2,4)', () => {
    expect(spacedDays(5, 3)).toEqual([0, 2, 4]);
  });
  it('5 dias, 2 sessões → 0,4', () => {
    expect(spacedDays(5, 2)).toEqual([0, 4]);
  });
  it('3 dias, 2 sessões → 0,2 (gap no meio)', () => {
    expect(spacedDays(3, 2)).toEqual([0, 2]);
  });
  it('a frequência de foco usada (focusFrequency) nunca dá dias consecutivos', () => {
    for (const n of [3, 4, 5]) {
      const d = spacedDays(n, focusFrequency(n));
      for (let i = 1; i < d.length; i++) expect(d[i] - d[i - 1]).toBeGreaterThanOrEqual(2);
    }
    expect(focusFrequency(5)).toBe(3); // 5 dias = foco 3×
    expect(focusFrequency(3)).toBe(2); // 3 dias = foco 2×
  });
});

describe('spacedPairs — pares de dias com folga', () => {
  it('gap ≥2 quando há 4+ dias', () => {
    for (const [i, j] of spacedPairs(5)) expect(j - i).toBeGreaterThanOrEqual(2);
    for (const [i, j] of spacedPairs(4)) expect(j - i).toBeGreaterThanOrEqual(2);
  });
  it('cobre dias variados (não amontoa tudo num par só)', () => {
    expect(spacedPairs(5).length).toBeGreaterThan(3);
  });
});
