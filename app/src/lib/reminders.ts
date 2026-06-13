// Lembrete diário de treino.
//
// Realidade da plataforma (honestidade > magia): num PWA no iPhone (Safari) NÃO dá
// pra disparar notificação agendada com o app FECHADO sem um servidor de push. Então:
//  • Com o app aberto/em segundo plano vivo → agenda um timer e dispara no horário.
//  • Ao ABRIR o app depois do horário sem ter treinado hoje → dispara um lembrete na hora.
// É o máximo confiável sem backend. Quando virar app nativo, trocamos por LocalNotifications.

import { notify } from './permissions';
import { useStore, todayISO } from '../store/store';

let timer: ReturnType<typeof setTimeout> | null = null;

const REMINDER_TITLE = 'Hora do treino 💪';
const REMINDER_BODY = 'Seu treino de hoje ainda tá te esperando. Bora mover!';

/** ms até o próximo horário HH:MM (hoje se ainda não passou; senão amanhã). */
function msUntil(time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  const now = new Date();
  const next = new Date(now);
  next.setHours(h || 0, m || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** Já treinou (treino ou cardio) hoje no perfil ativo? */
function trainedToday(): boolean {
  const s = useStore.getState();
  const hist = s.history[s.active] || [];
  const t = todayISO();
  return hist.some((e) => e.date === t);
}

/** (Re)agenda o timer pro próximo horário. Re-arma sozinho a cada dia. */
export function armReminder(): void {
  disarmReminder();
  const { reminder, notifyOn } = useStore.getState();
  if (!notifyOn || !reminder.on) return;
  timer = setTimeout(() => {
    if (!trainedToday()) notify(REMINDER_TITLE, REMINDER_BODY);
    armReminder(); // agenda o dia seguinte
  }, msUntil(reminder.time));
}

export function disarmReminder(): void {
  if (timer) { clearTimeout(timer); timer = null; }
}

/** Ao abrir o app: se passou do horário de hoje e ainda não treinou, avisa na hora. */
export function catchUpReminder(): void {
  const { reminder, notifyOn } = useStore.getState();
  if (!notifyOn || !reminder.on) return;
  const [h, m] = reminder.time.split(':').map((n) => parseInt(n, 10));
  const now = new Date();
  const due = new Date(now);
  due.setHours(h || 0, m || 0, 0, 0);
  if (now.getTime() >= due.getTime() && !trainedToday()) {
    notify(REMINDER_TITLE, REMINDER_BODY);
  }
}

/** Liga tudo: chamar no boot e quando o lembrete mudar. */
export function syncReminder(): void {
  catchUpReminder();
  armReminder();
}
