// Cálculos de dieta — portado do v1 (Mifflin-St Jeor, IMC, % gordura Navy).
import type { Body, Sex } from '../store/types';

export const ACTIVITY = [
  { v: 1.2, l: 'Sedentário — pouco ou nenhum exercício' },
  { v: 1.375, l: 'Leve — 1 a 3x por semana' },
  { v: 1.55, l: 'Moderado — 3 a 5x por semana' },
  { v: 1.725, l: 'Intenso — 6 a 7x por semana' },
  { v: 1.9, l: 'Atleta — treino pesado / trabalho físico' },
];

export const GOALS = [
  { v: 'lose', l: 'Emagrecer — déficit (~0,5 kg/sem)', adj: -500 },
  { v: 'losefast', l: 'Emagrecer rápido (~0,75 kg/sem)', adj: -750 },
  { v: 'maintain', l: 'Manter o peso', adj: 0 },
  { v: 'gain', l: 'Ganhar massa (~0,25 kg/sem)', adj: 300 },
] as const;

export interface Targets {
  target: number;
  tdee: number;
  protein: number;
  floored: boolean;
  goalAdj: number;
}

export function targetsFor(body: Body, weight: number | null): Targets | null {
  if (!body.age || !body.height || !weight) return null;
  const bmr = 10 * weight + 6.25 * body.height - 5 * body.age + (body.sex === 'f' ? -161 : 5);
  const tdee = bmr * (body.activity || 1.55);
  const goal = GOALS.find((g) => g.v === (body.goal || 'lose')) || GOALS[0];
  let target = tdee + goal.adj;
  const floor = body.sex === 'f' ? 1200 : 1500;
  const floored = target < floor;
  if (floored) target = floor;
  const protein = Math.round((body.sex === 'f' ? 1.8 : 2) * weight);
  return { target: Math.round(target / 10) * 10, tdee: Math.round(tdee / 10) * 10, protein, floored, goalAdj: goal.adj };
}

export function bmi(weight: number, heightCm: number): number {
  return weight / Math.pow(heightCm / 100, 2);
}

/** Meta diária de água (ml) por peso (~35ml/kg), piso de 2L. Fonte única de verdade. */
export function waterGoal(weight: number | null | undefined): number {
  return weight ? Math.max(2000, Math.round((weight * 35) / 50) * 50) : 2000;
}

export function bmiClass(b: number): { l: string; c: string } {
  if (b < 18.5) return { l: 'abaixo do peso', c: '#5fa8ff' };
  if (b < 25) return { l: 'saudável', c: 'var(--brand-lime)' };
  if (b < 30) return { l: 'sobrepeso', c: '#FBBF24' };
  return { l: 'obesidade', c: '#FF6B6B' };
}

export function bodyFatNavy(
  sex: Sex,
  heightCm: number,
  waist: number | null,
  neck: number | null,
  hip: number | null
): number | null {
  if (!waist || !neck || (sex === 'f' && !hip)) return null;
  let bf: number;
  if (sex === 'm') {
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + (hip as number) - neck) + 0.221 * Math.log10(heightCm)) - 450;
  }
  return isFinite(bf) && bf > 2 && bf < 60 ? bf : null;
}
