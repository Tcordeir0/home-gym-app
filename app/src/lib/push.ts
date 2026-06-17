// Web Push (notificação REAL com o app fechado) — inscreve este aparelho e guarda a
// subscription + a agenda (dias/horário/fuso) na tabela `push_subs`. Um cron no Supabase
// (Edge Function send-reminders) lê isso e dispara o lembrete de treino no horário.
//
// Diferente do lembrete local (lib/reminders.ts, que só roda com o app vivo), este funciona
// com o app fechado — desde que o aparelho suporte push (iOS: PWA instalado na tela inicial).
import { supabase } from './supabase';
import { useStore } from '../store/store';

// chave PÚBLICA do VAPID (pode ficar no cliente; a privada vive só no Supabase)
const VAPID_PUBLIC = 'BOY3gFDenhd9SGeYwxT0iAgmh7KFOqJOxqbcPeRoJXg2Aw0Rzeoi9uT-KrcbuZ_dRDgunQkn7f3Bku9aByszo0I';

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const s = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(s);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function currentSub(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  try { const reg = await navigator.serviceWorker.ready; return await reg.pushManager.getSubscription(); }
  catch { return null; }
}

/** Salva/atualiza a subscription + a agenda do perfil ativo em push_subs. */
async function savePushSub(sub: PushSubscription): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return;
  const s = useStore.getState();
  const u = s.users.find((x) => x.id === s.active);
  const sched = u?.schedule || { days: [], time: '18:00' };
  const j = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return;
  try {
    await supabase.from('push_subs').upsert(
      {
        user_id: uid, profile_id: u?.id, profile_name: u?.name,
        endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth,
        days: sched.days || [], reminder_time: sched.time || '18:00',
        water_times: u?.waterTimes || [], meal_times: u?.mealTimes || [],
        tz_offset: new Date().getTimezoneOffset(), updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );
  } catch { /* offline: tenta de novo na próxima */ }
}

/** Inscreve este aparelho no push (assume permissão já concedida). Retorna sucesso. */
export async function enablePush(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource });
    await savePushSub(sub);
    return true;
  } catch { return false; }
}

/** Tira este aparelho do push (desinscreve + remove de push_subs). */
export async function disablePush(): Promise<void> {
  const sub = await currentSub();
  if (!sub) return;
  try { await supabase.from('push_subs').delete().eq('endpoint', sub.endpoint); } catch { /* ok */ }
  try { await sub.unsubscribe(); } catch { /* ok */ }
}

/** Re-salva a agenda (dias/horário/fuso) se já estiver inscrito — chamar ao mudar a agenda/perfil. */
export async function syncPushSchedule(): Promise<void> {
  const sub = await currentSub();
  if (sub) await savePushSub(sub);
}
