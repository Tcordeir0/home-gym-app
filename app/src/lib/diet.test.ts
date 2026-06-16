import { describe, it, expect } from 'vitest';
import { bmi, bmiClass, bodyFatNavy, isBeverage } from './diet';

// Funções que passei a exibir na aba DIETA (IMC + gordura). Garante que computam valores sãos.
describe('bmi + bmiClass', () => {
  it('IMC = peso / altura²', () => {
    expect(bmi(72, 175)).toBeCloseTo(23.5, 1);
  });
  it('classifica as faixas', () => {
    expect(bmiClass(17).l).toBe('abaixo do peso');
    expect(bmiClass(22).l).toBe('saudável');
    expect(bmiClass(27).l).toBe('sobrepeso');
    expect(bmiClass(32).l).toBe('obesidade');
  });
});

describe('isBeverage', () => {
  it('detecta bebidas pelo nome (mostra ml/L, não colheres)', () => {
    ['Coca-Cola', 'Suco de laranja natural', 'Cerveja', 'Café sem açúcar', 'Leite integral', 'Água'].forEach((n) =>
      expect(isBeverage(n)).toBe(true)
    );
  });
  it('detecta pela tag "bebida"', () => {
    expect(isBeverage('Refrigerante X', 'br pt bebida')).toBe(true);
  });
  it('sólido continua sólido (conta em g/colheres)', () => {
    ['Feijão frade cozido', 'Arroz branco', 'Peito de frango', 'Ovo cozido'].forEach((n) =>
      expect(isBeverage(n)).toBe(false)
    );
  });
});

describe('bodyFatNavy', () => {
  it('retorna null sem medidas obrigatórias (homem precisa cintura+pescoço)', () => {
    expect(bodyFatNavy('m', 175, null, 38, null)).toBeNull();
    expect(bodyFatNavy('m', 175, 85, null, null)).toBeNull();
  });
  it('mulher precisa também do quadril', () => {
    expect(bodyFatNavy('f', 165, 75, 32, null)).toBeNull();
  });
  it('homem com medidas válidas → % plausível (0–60)', () => {
    const bf = bodyFatNavy('m', 175, 85, 38, null);
    expect(bf).not.toBeNull();
    expect(bf!).toBeGreaterThan(2);
    expect(bf!).toBeLessThan(60);
  });
});
