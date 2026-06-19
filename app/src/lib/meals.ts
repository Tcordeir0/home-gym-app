// Refeições do diário (café/almoço/lanche/janta). Cada FoodItem ganha um `meal` opcional;
// itens antigos (sem meal) caem no grupo "Sem refeição". Lógica PURA → testável.
import type { FoodItem } from '../store/types';

export type MealKey = 'cafe' | 'almoco' | 'lanche' | 'janta';

export const MEALS: { key: MealKey; label: string; emoji: string }[] = [
  { key: 'cafe', label: 'Café da manhã', emoji: '☕' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎' },
  { key: 'janta', label: 'Jantar', emoji: '🌙' },
];

const LABELS: Record<string, { label: string; emoji: string }> = Object.fromEntries(
  MEALS.map((m) => [m.key, { label: m.label, emoji: m.emoji }]),
);
export const mealLabel = (k?: string) => (k && LABELS[k] ? LABELS[k] : { label: 'Sem refeição', emoji: '🍴' });

/** Refeição sugerida pela hora do dia (0–23). */
export function mealByHour(h: number): MealKey {
  if (h < 11) return 'cafe';
  if (h < 15) return 'almoco';
  if (h < 18) return 'lanche';
  return 'janta';
}

export interface MealGroup { key: MealKey | 'outros'; label: string; emoji: string; items: { item: FoodItem; idx: number }[] }

/**
 * Agrupa os alimentos do dia por refeição, NA ORDEM das refeições + "Sem refeição" no fim.
 * Preserva o índice ORIGINAL de cada item (pra editar/remover/copiar continuarem funcionando).
 * Só retorna grupos não-vazios.
 */
export function groupByMeal(food: FoodItem[]): MealGroup[] {
  const order: (MealKey | 'outros')[] = [...MEALS.map((m) => m.key), 'outros'];
  const buckets = new Map<string, { item: FoodItem; idx: number }[]>();
  (food || []).forEach((item, idx) => {
    const key = item.meal && LABELS[item.meal] ? item.meal : 'outros';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push({ item, idx });
  });
  return order
    .filter((k) => buckets.has(k))
    .map((k) => ({ key: k, label: mealLabel(k === 'outros' ? undefined : k).label, emoji: mealLabel(k === 'outros' ? undefined : k).emoji, items: buckets.get(k)! }));
}

/** Índice de um item IGUAL (mesmo nome, mesma refeição) já no dia — pra não floodar linha repetida. -1 se não há. */
export function sameItemIndex(food: FoodItem[], n: string, meal: MealKey | undefined): number {
  return (food || []).findIndex((it) => it.n === n && (it.meal || undefined) === (meal || undefined));
}
