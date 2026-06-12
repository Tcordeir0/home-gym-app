import {
  sparkles, flame, barbell, heart, calendar, flash, star, trophy, fitness, trendingUp, water,
  restaurant, nutrition, medal, ribbon, diamond, skull, rocket, infinite,
} from 'ionicons/icons';
import type { Stats } from '../lib/stats';
import { THEMES } from './themes';
import { FRAMES } from './frames';
import { DECOS } from './decos';

export interface Achievement {
  icon: string;
  label: string;
  desc: string;
  milestone?: boolean;
  fresh?: boolean;
  // recompensa desbloqueada ao atingir a conquista (sai da roleta, é exclusiva da conquista)
  reward?: { kind: 'theme' | 'frame' | 'deco'; id: string };
  test: (s: Stats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { icon: sparkles, label: 'Começou!', desc: '1º treino', test: (s) => s.treinos >= 1 },
  { icon: flame, label: 'Pegando o ritmo', desc: '5 treinos', test: (s) => s.treinos >= 5 },
  { icon: barbell, label: 'Dedicado', desc: '15 treinos', reward: { kind: 'frame', id: 'mine' }, test: (s) => s.treinos >= 15 },
  { icon: medal, label: 'Veterano', desc: '30 treinos', milestone: true, reward: { kind: 'theme', id: 'return' }, test: (s) => s.treinos >= 30 },
  { icon: trophy, label: 'Centurião', desc: '50 treinos', milestone: true, test: (s) => s.treinos >= 50 },
  { icon: heart, label: 'Cardio na veia', desc: '5 cardios', test: (s) => s.cardios >= 5 },
  { icon: calendar, label: 'Constante', desc: '7 dias ativos', milestone: true, test: (s) => s.activeDays >= 7 },
  { icon: flash, label: 'Sequência 3', desc: '3 dias seguidos', test: (s) => s.streak >= 3 },
  { icon: flame, label: 'Em chamas', desc: '7 dias seguidos', milestone: true, reward: { kind: 'frame', id: 'return' }, test: (s) => s.streak >= 7 },
  { icon: ribbon, label: 'Imparável', desc: '14 dias seguidos', milestone: true, reward: { kind: 'frame', id: 'gold' }, test: (s) => s.streak >= 14 },
  { icon: infinite, label: 'Imortal', desc: '30 dias seguidos', milestone: true, test: (s) => s.streak >= 30 },
  { icon: star, label: '500 pontos', desc: '500 pts', test: (s) => s.pts >= 500 },
  { icon: trophy, label: '1000 pontos', desc: '1000 pts', milestone: true, reward: { kind: 'theme', id: 'bloco' }, test: (s) => s.pts >= 1000 },
  { icon: diamond, label: 'Lenda', desc: '2500 pts', milestone: true, reward: { kind: 'frame', id: 'rainbow' }, test: (s) => s.pts >= 2500 },
  { icon: fitness, label: 'Na balança', desc: '1ª pesagem', fresh: true, test: (s) => s.weighIns >= 1 },
  { icon: trendingUp, label: 'Acompanhando', desc: '5 pesagens', fresh: true, test: (s) => s.weighIns >= 5 },
  { icon: water, label: 'Hidratado', desc: 'meta de água num dia', fresh: true, test: (s) => s.waterDays >= 1 },
  { icon: water, label: 'Bem hidratado', desc: 'meta de água em 7 dias', fresh: true, milestone: true, test: (s) => s.waterDays >= 7 },
  { icon: rocket, label: 'Mestre da hidratação', desc: 'água em 30 dias', fresh: true, milestone: true, test: (s) => s.waterDays >= 30 },
  { icon: restaurant, label: 'Comeu certo', desc: '1º dia de dieta registrado', fresh: true, test: (s) => s.dietDays >= 1 },
  { icon: restaurant, label: 'Disciplina na dieta', desc: '7 dias de dieta', fresh: true, milestone: true, test: (s) => s.dietDays >= 7 },
  { icon: skull, label: 'Disciplina total', desc: '30 dias de dieta', fresh: true, milestone: true, reward: { kind: 'deco', id: 'coracao_morte' }, test: (s) => s.dietDays >= 30 },
  { icon: nutrition, label: 'Proteína em dia', desc: 'bateu a proteína num dia', fresh: true, test: (s) => s.proteinDays >= 1 },
  { icon: nutrition, label: 'Máquina de proteína', desc: 'proteína em 7 dias', fresh: true, milestone: true, test: (s) => s.proteinDays >= 7 },
];

/** Rótulo do item que a conquista desbloqueia (pra mostrar na UI). */
export function rewardLabel(r: Achievement['reward']): string | null {
  if (!r) return null;
  if (r.kind === 'theme') return 'Tema ' + (THEMES.find((t) => t.id === r.id)?.name || r.id);
  if (r.kind === 'frame') return 'Aro ' + (FRAMES.find((f) => f.id === r.id)?.name || r.id);
  return 'Cosmético ' + (DECOS.find((d) => d.id === r.id)?.name || r.id);
}
