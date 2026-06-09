export interface Exercise { nome: string; musculo: string; series: number; reps: string; dica: string; }
export interface Plan { focus: string; labels: Record<string,string>; treinos: Record<string, Exercise[]>; }
export type PlanMap = Record<string, Plan>;
