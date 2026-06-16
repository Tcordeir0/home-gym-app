import { describe, it, expect } from 'vitest';
import { generateWorkout, defaultLabels, isBodyweight, type ShapeBias } from './generator';
import { emphasisOf } from './emphasis';

const muscles = (tr: Record<string, { musculo: string }[]>) =>
  Object.values(tr).flat().map((e) => e.musculo);

describe('isBodyweight', () => {
  it('marca exercícios só de peso do corpo', () => {
    expect(isBodyweight('Abdominal')).toBe(true);
    expect(isBodyweight('Flexão (push-up)')).toBe(true);
    expect(isBodyweight('Prancha')).toBe(true);
    expect(isBodyweight('Barra fixa (pull-up)')).toBe(true); // barra fixa não adiciona carga pela lista
  });
  it('NÃO marca exercícios com carga', () => {
    expect(isBodyweight('Supino no chão com halteres')).toBe(false);
    expect(isBodyweight('Rosca direta com halteres')).toBe(false);
    expect(isBodyweight('Crucifixo com elástico')).toBe(false); // elástico = resistência
  });
  it('exercício inexistente não quebra', () => {
    expect(isBodyweight('Exercício que não existe')).toBe(false);
  });
});

describe('defaultLabels', () => {
  it('3 dias → A,B,C + aquecimento', () => {
    expect(defaultLabels(3)).toEqual({ warm: 'Aquec.', A: 'Treino A', B: 'Treino B', C: 'Treino C' });
  });
  it('5 dias → A..E', () => {
    expect(Object.keys(defaultLabels(5)).sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'warm']);
  });
  it('nunca passa de E (clampa)', () => {
    expect(Object.keys(defaultLabels(9)).filter((k) => k !== 'warm').sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
});

describe('generateWorkout — estrutura A–E', () => {
  it('gera o nº certo de treinos (3, 4, 5 dias)', () => {
    expect(Object.keys(generateWorkout(['bodyweight'], 'full', undefined, 3))).toEqual(['A', 'B', 'C']);
    expect(Object.keys(generateWorkout(['bodyweight'], 'full', undefined, 4))).toEqual(['A', 'B', 'C', 'D']);
    expect(Object.keys(generateWorkout(['bodyweight'], 'full', undefined, 5))).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
  it('clampa em E mesmo pedindo mais', () => {
    expect(Object.keys(generateWorkout(['bodyweight'], 'full', undefined, 9))).toEqual(['A', 'B', 'C', 'D', 'E']);
  });
  it('cada treino tem 6 exercícios sem meta de shape', () => {
    const tr = generateWorkout(['bodyweight', 'dumbbell'], 'full', undefined, 3);
    Object.values(tr).forEach((d) => expect(d.length).toBe(6));
  });
});

describe('generateWorkout — corpo todo cobre TODOS os grupos (bug do core resolvido)', () => {
  it('core/abdômen aparece na semana com Corpo todo + 3 dias', () => {
    // roda várias vezes: a rotação garante o 7º grupo (core) na semana
    for (let i = 0; i < 5; i++) {
      const tr = generateWorkout(['bodyweight'], 'full', undefined, 3);
      const grupos = new Set(muscles(tr));
      expect(grupos.has('Core')).toBe(true);
    }
  });
});

describe('generateWorkout — foco', () => {
  it('foco Peito → todo treino começa com 2 slots de peito', () => {
    const tr = generateWorkout(['bodyweight', 'dumbbell'], 'chest', undefined, 3);
    Object.values(tr).forEach((d) => {
      expect(d[0].musculo).toBe('Peito');
      expect(d[1].musculo).toBe('Peito');
    });
  });
});

describe('generateWorkout — gap da meta (acessório garantido)', () => {
  const shape: ShapeBias = { preset: 'estetico_m', biotype: 'meso' };

  it('com meta, cada treino ganha +1 acessório (7 exercícios)', () => {
    const tr = generateWorkout(['bodyweight', 'dumbbell'], 'chest', undefined, 3, undefined, shape);
    Object.values(tr).forEach((d) => expect(d.length).toBe(7));
  });

  it('sem meta, segue com 6 (sem acessório)', () => {
    const tr = generateWorkout(['bodyweight', 'dumbbell'], 'chest', undefined, 3);
    Object.values(tr).forEach((d) => expect(d.length).toBe(6));
  });

  it('o gap injeta abdômen/core ao longo da semana mesmo com foco Peito', () => {
    // antes do fix: foco peito quase nunca trazia core. Agora deve aparecer na semana.
    let semanasComCore = 0;
    for (let i = 0; i < 6; i++) {
      const tr = generateWorkout(['bodyweight', 'dumbbell'], 'chest', undefined, 3, undefined, shape);
      if (muscles(tr).some((m) => m === 'Core')) semanasComCore++;
    }
    expect(semanasComCore).toBe(6); // 100% das semanas têm core
  });
});

describe('generateWorkout — overrides (Ajustar prioridades) influenciam', () => {
  it('Peito Inferior = Máx → peito DOMINA em inferior (mas não zera o superior)', () => {
    const shape: ShapeBias = { preset: 'estetico_m', overrides: { 'chest-lower': 3, 'chest-upper': 1 }, biotype: 'meso' };
    const tr = generateWorkout(['bodyweight', 'dumbbell', 'bench'], 'chest', undefined, 5, undefined, shape);
    const peito = Object.values(tr).flat().filter((e) => e.musculo === 'Peito');
    expect(peito.length).toBeGreaterThan(0);
    const inferior = peito.filter((e) => emphasisOf(e.nome)?.bases.includes('chest-lower')).length;
    // a maioria deve ser inferior (prioridade Máx), sem exigir 100% (variedade preservada)
    expect(inferior / peito.length).toBeGreaterThanOrEqual(0.5);
  });
});

describe('generateWorkout — cobertura: foco não pode zerar músculos (bug tríceps/abdômen)', () => {
  it('foco Peito 5 dias ainda treina TRÍCEPS e ABDÔMEN', () => {
    for (let i = 0; i < 5; i++) {
      const tr = generateWorkout(['bodyweight', 'dumbbell', 'bench', 'pullup_bar'], 'chest', undefined, 5, undefined, { preset: 'estetico_m', biotype: 'meso' });
      const bases = new Set(Object.values(tr).flat().flatMap((e) => emphasisOf(e.nome)?.bases || []));
      expect([...bases].some((b) => b.startsWith('triceps')), 'tríceps treinado').toBe(true);
      expect([...bases].some((b) => b.startsWith('abs')), 'abdômen treinado').toBe(true);
    }
  });
});
