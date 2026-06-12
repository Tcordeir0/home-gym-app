import {
  sparkles, flame, barbell, heart, calendar, flash, star, trophy, fitness, trendingUp, water,
  restaurant, nutrition,
} from 'ionicons/icons';
import type { Stats } from '../lib/stats';

export interface Achievement {
  icon: string;
  label: string;
  desc: string;
  milestone?: boolean;
  fresh?: boolean;
  test: (s: Stats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { icon: sparkles, label: 'Começou!', desc: '1º treino', test: (s) => s.treinos >= 1 },
  { icon: flame, label: 'Pegando o ritmo', desc: '5 treinos', test: (s) => s.treinos >= 5 },
  { icon: barbell, label: 'Dedicado', desc: '15 treinos', test: (s) => s.treinos >= 15 },
  { icon: heart, label: 'Cardio na veia', desc: '5 cardios', test: (s) => s.cardios >= 5 },
  { icon: calendar, label: 'Constante', desc: '7 dias ativos', milestone: true, test: (s) => s.activeDays >= 7 },
  { icon: flash, label: 'Sequência 3', desc: '3 dias seguidos', test: (s) => s.streak >= 3 },
  { icon: flame, label: 'Em chamas', desc: '7 dias seguidos', milestone: true, test: (s) => s.streak >= 7 },
  { icon: star, label: '500 pontos', desc: '500 pts', test: (s) => s.pts >= 500 },
  { icon: trophy, label: '1000 pontos', desc: '1000 pts', milestone: true, test: (s) => s.pts >= 1000 },
  { icon: fitness, label: 'Na balança', desc: '1ª pesagem', fresh: true, test: (s) => s.weighIns >= 1 },
  { icon: trendingUp, label: 'Acompanhando', desc: '5 pesagens', fresh: true, test: (s) => s.weighIns >= 5 },
  { icon: water, label: 'Hidratado', desc: 'meta de água num dia', fresh: true, test: (s) => s.waterDays >= 1 },
  { icon: water, label: 'Bem hidratado', desc: 'meta de água em 7 dias', fresh: true, milestone: true, test: (s) => s.waterDays >= 7 },
  { icon: restaurant, label: 'Comeu certo', desc: '1º dia de dieta registrado', fresh: true, test: (s) => s.dietDays >= 1 },
  { icon: restaurant, label: 'Disciplina na dieta', desc: '7 dias de dieta', fresh: true, milestone: true, test: (s) => s.dietDays >= 7 },
  { icon: nutrition, label: 'Proteína em dia', desc: 'bateu a proteína num dia', fresh: true, test: (s) => s.proteinDays >= 1 },
  { icon: nutrition, label: 'Máquina de proteína', desc: 'proteína em 7 dias', fresh: true, milestone: true, test: (s) => s.proteinDays >= 7 },
];
