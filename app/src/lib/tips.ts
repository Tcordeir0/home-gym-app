// Coach do dia — dicas com base no que comeu/bebeu (over/under).
export interface Tip {
  tone: 'good' | 'warn' | 'info';
  emoji: string;
  text: string;
}

export interface TipInput {
  kcal: number;
  protein: number;
  waterMl: number;
  targetKcal: number | null;
  targetProtein: number | null;
  waterGoal: number;
  hasFood: boolean;
  hasWater: boolean;
}

export function dietTips(a: TipInput): Tip[] {
  const tips: Tip[] = [];

  // Água
  if (a.hasWater) {
    const r = a.waterMl / a.waterGoal;
    if (r >= 1.6) tips.push({ tone: 'warn', emoji: '💧', text: 'Você passou bem da meta de água — pode segurar um pouco.' });
    else if (r >= 1) tips.push({ tone: 'good', emoji: '💧', text: 'Meta de água batida hoje. Mandou bem!' });
    else if (r < 0.4) tips.push({ tone: 'warn', emoji: '🚰', text: 'Tá bebendo pouca água hoje — capricha na hidratação.' });
  }

  // Calorias
  if (a.hasFood && a.targetKcal) {
    const d = a.kcal - a.targetKcal;
    if (d > 350) tips.push({ tone: 'warn', emoji: '🍔', text: `Passou ${Math.round(d)} kcal da meta hoje.` });
    else if (d < -500) tips.push({ tone: 'warn', emoji: '🥄', text: 'Tá comendo bem abaixo da meta — falta energia pra render.' });
    else tips.push({ tone: 'good', emoji: '🎯', text: 'Calorias do dia dentro da meta.' });
  }

  // Proteína
  if (a.hasFood && a.targetProtein) {
    if (a.protein < a.targetProtein * 0.6)
      tips.push({ tone: 'warn', emoji: '🥩', text: `Pouca proteína hoje (${Math.round(a.protein)}g de ${a.targetProtein}g) — capricha.` });
    else if (a.protein >= a.targetProtein)
      tips.push({ tone: 'good', emoji: '💪', text: 'Proteína do dia batida!' });
  }

  if (!a.hasFood && !a.hasWater)
    tips.push({ tone: 'info', emoji: '📝', text: 'Registre a água e o que comeu pra eu te dar dicas do dia.' });

  return tips.slice(0, 4);
}
