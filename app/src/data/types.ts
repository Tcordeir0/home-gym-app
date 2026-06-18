// eq = rótulo do equipamento (só vem preenchido em exercício adicionado da BIBLIOTECA;
// no POOL curado o equipamento é inferido). Usado pra classificar peso-do-corpo corretamente.
export interface Exercise { nome: string; musculo: string; series: number; reps: string; dica: string; eq?: string; }
export interface Plan { focus: string; labels: Record<string,string>; treinos: Record<string, Exercise[]>; }
export type PlanMap = Record<string, Plan>;
