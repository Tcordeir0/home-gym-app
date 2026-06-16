import { describe, it, expect } from 'vitest';
import { POOL } from './pool';
import { PLANS, AQUECIMENTO } from './plans';
import { DEMOS } from './demos';

// Garante que os dados não "driftam": nomes de exercício precisam casar entre
// POOL / planos / demos, senão Trocar, auto-peso e a demo silenciosamente quebram.

const poolNames = new Set(POOL.map((p) => p.n));
const planNames = [...new Set(Object.values(PLANS).flatMap((p) => Object.values(p.treinos).flat()).map((e) => e.nome))];
const warmNames = [...new Set(AQUECIMENTO.map((e) => e.nome))];

describe('integridade dos dados de exercícios', () => {
  it('todo exercício de plano existe no POOL (Trocar/auto-peso/demo dependem disso)', () => {
    const miss = planNames.filter((n) => !poolNames.has(n));
    expect(miss, `nomes de plano fora do POOL: ${miss.join(' | ')}`).toEqual([]);
  });

  it('todo exercício do POOL tem demo', () => {
    const miss = [...poolNames].filter((n) => !DEMOS[n]);
    expect(miss, `exercícios do POOL sem demo: ${miss.join(' | ')}`).toEqual([]);
  });

  it('todo aquecimento tem demo', () => {
    const miss = warmNames.filter((n) => !DEMOS[n]);
    expect(miss, `aquecimentos sem demo: ${miss.join(' | ')}`).toEqual([]);
  });
});
