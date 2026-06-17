// "agora" (hh:mm local) está dentro da janela de W minutos APÓS o horário-alvo?
// Compara em minutos totais módulo 1440 → robusto a horários :45+ e à virada de hora/dia.
//
// ⚠️ ESPELHA o `inTick` da Edge Function `supabase/functions/send-reminders/index.ts`
// (Deno não importa código do app). Se mudar a regra dos lembretes, mude nos DOIS lugares.
export function inReminderWindow(targetHHMM: string, nowHH: number, nowMM: number, windowMin = 15): boolean {
  const [th, tm] = String(targetHHMM || '').split(':').map((x) => parseInt(x, 10));
  const diff = (nowHH * 60 + nowMM - ((th || 0) * 60 + (tm || 0)) + 1440) % 1440;
  return diff >= 0 && diff < windowMin;
}
