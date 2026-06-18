import { describe, it, expect } from 'vitest';
import { deloadSuggestion, weeklySetsByGroup } from './deload';

const TODAY = '2026-06-18';
// um treino de peito com `n` séries numa data
const chestDay = (date: string, n: number) => ({
  date, w: 'A',
  exercises: [{ nome: 'Flexão (push-up)', sets: Array.from({ length: n }, () => ({ kg: 0, reps: 10 })) }],
});

describe('weeklySetsByGroup', () => {
  it('agrupa séries por grupo e por semana atrás', () => {
    const b = weeklySetsByGroup([chestDay('2026-06-16', 5), chestDay('2026-06-09', 8)], TODAY, 6);
    expect(b[0].chest).toBe(5); // últimos 7 dias
    expect(b[1].chest).toBe(8); // 7-13 dias
  });
});

describe('deloadSuggestion', () => {
  it('4 semanas completas consecutivas ≥ MEV → sugere deload', () => {
    const h = [
      chestDay('2026-06-16', 6), // semana atual (não conta como completa)
      chestDay('2026-06-09', 10), // semana 1
      chestDay('2026-06-02', 10), // semana 2
      chestDay('2026-05-26', 10), // semana 3
      chestDay('2026-05-19', 10), // semana 4
    ];
    const s = deloadSuggestion(h, TODAY);
    expect(s.suggest).toBe(true);
    expect(s.group).toBe('chest');
    expect(s.weeks).toBe(4);
  });

  it('só 3 semanas acumuladas → NÃO sugere ainda', () => {
    const h = [
      chestDay('2026-06-09', 10),
      chestDay('2026-06-02', 10),
      chestDay('2026-05-26', 10),
      // semana 4 vazia → quebra a sequência
    ];
    expect(deloadSuggestion(h, TODAY).suggest).toBe(false);
  });

  it('volume abaixo do MEV não conta como semana "pesada"', () => {
    const h = [
      chestDay('2026-06-09', 4), // < MEV(10)
      chestDay('2026-06-02', 10),
      chestDay('2026-05-26', 10),
      chestDay('2026-05-19', 10),
    ];
    expect(deloadSuggestion(h, TODAY).suggest).toBe(false); // sequência quebra na semana 1
  });

  it('se a semana atual já está leve (deload em andamento) → não sugere de novo', () => {
    const h = [
      chestDay('2026-06-16', 3), // < MEV/2 → já deloadando
      chestDay('2026-06-09', 10),
      chestDay('2026-06-02', 10),
      chestDay('2026-05-26', 10),
      chestDay('2026-05-19', 10),
    ];
    expect(deloadSuggestion(h, TODAY).suggest).toBe(false);
  });

  it('histórico vazio → não sugere', () => {
    expect(deloadSuggestion([], TODAY).suggest).toBe(false);
  });
});
