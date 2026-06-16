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
  carbs: number; // meta de carboidrato (g) — resto das calorias
  fat: number; // meta de gordura (g)
  floored: boolean;
  goalAdj: number;
}

export function targetsFor(body: Body, weight: number | null): Targets | null {
  if (!body.age || !body.height || !weight) return null;
  const bmr = 10 * weight + 6.25 * body.height - 5 * body.age + (body.sex === 'f' ? -161 : 5);
  const tdee = bmr * (body.activity || 1.55);
  const goalV = body.goal || 'lose';
  const goal = GOALS.find((g) => g.v === goalV) || GOALS[0];
  let target = tdee + goal.adj;
  const floor = body.sex === 'f' ? 1200 : 1500;
  const floored = target < floor;
  if (floored) target = floor;
  target = Math.round(target / 10) * 10;

  // Macros derivados do OBJETIVO (g/kg de peso), base científica:
  // - cutting preserva músculo com MAIS proteína e gordura mínima;
  // - bulk eleva carbo; manutenção no meio. Carbo = resto das calorias.
  const cut = goalV === 'lose' || goalV === 'losefast';
  const proteinPerKg = cut ? (body.sex === 'f' ? 2.0 : 2.2) : goalV === 'gain' ? 2.0 : 1.8;
  const fatPerKg = goalV === 'gain' ? 0.9 : cut ? 0.6 : 0.8;
  const protein = Math.round(proteinPerKg * weight);
  const fat = Math.round(fatPerKg * weight);
  const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));

  return { target, tdee: Math.round(tdee / 10) * 10, protein, carbs, fat, floored, goalAdj: goal.adj };
}

export function bmi(weight: number, heightCm: number): number {
  return weight / Math.pow(heightCm / 100, 2);
}

/** Meta diária de água (ml). Por peso + nível de atividade: 30ml/kg (sedentário) a
 *  40ml/kg (atleta); o default 1.55 ≈ 35ml/kg (mantém o valor antigo p/ quem não passa atividade).
 *  Piso de 2L. Fonte única de verdade. */
export function waterGoal(weight: number | null | undefined, activity = 1.55): number {
  if (!weight) return 2000;
  const a = Math.min(1.9, Math.max(1.2, activity));
  const perKg = 30 + (a - 1.2) * 14.3; // 30 (sedentário) .. 40 (atleta); 1.55 ≈ 35
  return Math.max(2000, Math.round((weight * perKg) / 50) * 50);
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
