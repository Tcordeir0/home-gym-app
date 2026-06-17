import { describe, it, expect } from 'vitest';
import { EXERCISE_LIB, LIB_MUSCLES, LIB_EQUIP } from './exerciseLib';

// Garante que o exerciseLib.ts (gerado por script da Free Exercise DB) está íntegro —
// pega regressões se a base for regerada com dados quebrados.
describe('exerciseLib (Free Exercise DB)', () => {
  const musKeys = new Set(LIB_MUSCLES.map((m) => m.k));

  it('tem muitos exercícios e nenhum campo essencial vazio', () => {
    expect(EXERCISE_LIB.length).toBeGreaterThan(800);
    for (const e of EXERCISE_LIB) {
      expect(e.n.length).toBeGreaterThan(0);
      expect(e.m.length).toBeGreaterThan(0);
      expect(e.eq.length).toBeGreaterThan(0);
    }
  });

  it('todo músculo (mk) está na lista de filtro LIB_MUSCLES', () => {
    for (const e of EXERCISE_LIB) expect(musKeys.has(e.mk)).toBe(true);
  });

  it('toda imagem é URL https da CDN jsdelivr', () => {
    for (const e of EXERCISE_LIB) {
      expect(e.img.length).toBeGreaterThan(0);
      for (const u of e.img) expect(u).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/gh\/yuhonas\/free-exercise-db@main\/exercises\//);
    }
  });

  it('listas de filtro sem duplicatas', () => {
    expect(musKeys.size).toBe(LIB_MUSCLES.length);
    expect(new Set(LIB_EQUIP).size).toBe(LIB_EQUIP.length);
  });
});
