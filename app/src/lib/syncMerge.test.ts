import { describe, it, expect } from 'vitest';
import { mergeAppState, type MergeableState } from './syncMerge';

describe('mergeAppState — não perde dado aditivo entre 2 aparelhos', () => {
  it('cenário do susto: device A registrou treino, device B registrou água no mesmo dia', () => {
    // remoto (autoridade) = o que o device B subiu: tem a água, mas NÃO tem o treino do A
    const remote = {
      history: { u1: [] as { date: string; w: string }[] },
      daily: { u1: { '2026-06-17': { waterMl: 2000 } } },
    };
    // local (device A) = tem o treino do dia, mas água zerada
    const local = {
      history: { u1: [{ date: '2026-06-17', w: 'B', exercises: [{ nome: 'Supino', sets: [{ kg: 20, reps: 10 }] }] }] },
      daily: { u1: { '2026-06-17': {} } },
    };
    const merged = mergeAppState(remote, local);
    // o treino do A sobreviveu
    expect(merged.history!.u1).toHaveLength(1);
    expect(merged.history!.u1[0].w).toBe('B');
    // a água do B sobreviveu
    expect(merged.daily!.u1['2026-06-17'].waterMl).toBe(2000);
  });

  it('histórico: em colisão (mesma data+treino), fica a versão mais RICA (mais séries)', () => {
    const a = { history: { u1: [{ date: '2026-06-17', w: 'A', exercises: [{ nome: 'X', sets: [{}, {}, {}] }] }] } };
    const b = { history: { u1: [{ date: '2026-06-17', w: 'A', exercises: [{ nome: 'X', sets: [{}] }] }] } };
    const merged = mergeAppState(a, b);
    expect(merged.history!.u1).toHaveLength(1); // não duplica
    expect(merged.history!.u1[0].exercises![0].sets).toHaveLength(3); // a mais rica
  });

  it('água: fica o MÁXIMO entre os dois aparelhos', () => {
    const a = { daily: { u1: { '2026-06-17': { waterMl: 500 } } } };
    const b = { daily: { u1: { '2026-06-17': { waterMl: 1800 } } } };
    expect(mergeAppState(a, b).daily!.u1['2026-06-17'].waterMl).toBe(1800);
  });

  it('comida: fica a lista mais completa (não duplica itens indistinguíveis)', () => {
    const a = { daily: { u1: { '2026-06-17': { food: [{ n: 'Ovo' }] } } } };
    const b = { daily: { u1: { '2026-06-17': { food: [{ n: 'Ovo' }, { n: 'Arroz' }] } } } };
    const merged = mergeAppState(a, b);
    expect(merged.daily!.u1['2026-06-17'].food).toHaveLength(2);
  });

  it('scores: fica o MÁXIMO de pontos por dia', () => {
    const a = { scores: { u1: { byDay: { '2026-06-17': 30, '2026-06-16': 50 } } } };
    const b = { scores: { u1: { byDay: { '2026-06-17': 80 } } } };
    const merged = mergeAppState(a, b);
    expect(merged.scores!.u1.byDay!['2026-06-17']).toBe(80);
    expect(merged.scores!.u1.byDay!['2026-06-16']).toBe(50);
  });

  it('medidas: 1 por data, a mais preenchida vence; une datas diferentes', () => {
    const a: MergeableState = { measures: { u1: [{ date: '2026-06-17', arm: 40 }] } };
    const b: MergeableState = { measures: { u1: [{ date: '2026-06-17', arm: 40, chest: 100 }, { date: '2026-06-10', arm: 39 }] } };
    const merged = mergeAppState(a, b);
    expect(merged.measures!.u1).toHaveLength(2);
    const d17 = merged.measures!.u1.find((m) => m.date === '2026-06-17')!;
    expect(d17.chest).toBe(100); // a mais preenchida
  });

  it('preserva perfis de uids presentes só num lado', () => {
    const a = { history: { u1: [{ date: '2026-06-17', w: 'A' }] } };
    const b = { history: { u2: [{ date: '2026-06-17', w: 'B' }] } };
    const merged = mergeAppState(a, b);
    expect(Object.keys(merged.history!).sort()).toEqual(['u1', 'u2']);
  });

  it('configs seguem a AUTORIDADE (last-write-wins) — só os dados aditivos é que unem', () => {
    const authority: MergeableState = { appTheme: 'dark', daily: {} };
    const other: MergeableState = { appTheme: 'light', daily: { u1: { '2026-06-17': { waterMl: 1000 } } } };
    const merged = mergeAppState(authority, other);
    expect(merged.appTheme).toBe('dark'); // config da autoridade preservada
    expect(merged.daily!.u1['2026-06-17'].waterMl).toBe(1000); // dado aditivo unido
  });

  it('tolera other nulo/indefinido (offline) sem quebrar', () => {
    const a = { history: { u1: [{ date: '2026-06-17', w: 'A' }] } };
    expect(mergeAppState(a, null)).toBe(a);
    expect(mergeAppState(a, undefined)).toBe(a);
  });
});
