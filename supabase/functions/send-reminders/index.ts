// Edge Function: send-reminders
// Dispara o LEMBRETE DE TREINO via Web Push (app fechado). É chamada por um cron
// (pg_cron, a cada 15 min) que autentica com o x-cron-secret.
//
// Lê push_subs (que já guarda days[], reminder_time, tz_offset por aparelho) e, pra cada
// inscrição cujo dia+horário batem o "agora" no fuso do aparelho, manda a notificação.
//
// Deploy: supabase functions deploy send-reminders  (ou via MCP deploy_edge_function)
// Pré-req: VAPID já configurado (mesma RPC get_push_secrets do send-social-push) + pg_net.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

// "agora" no fuso do aparelho (tz_offset = getTimezoneOffset(): minutos ATRÁS do UTC).
function localNow(tzOffsetMin: number): { hh: number; mm: number; dow: number } {
  const now = Date.now();
  const local = new Date(now - tzOffsetMin * 60000);
  return { hh: local.getUTCHours(), mm: local.getUTCMinutes(), dow: local.getUTCDay() };
}

const CRON_WINDOW_MIN = 15; // janela do cron (precisa casar com o intervalo do agendamento)

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cfg, error: cfgErr } = await supabase.rpc("get_push_secrets");
    if (cfgErr || !cfg?.[0]) return json({ error: "no config" }, 500);
    const { vapid_public, vapid_private, vapid_subject, cron_secret } = cfg[0];
    if (req.headers.get("x-cron-secret") !== cron_secret) return json({ error: "unauthorized" }, 401);
    webpush.setVapidDetails(vapid_subject, vapid_public, vapid_private);

    const { data: subs } = await supabase.from("push_subs").select("*");
    let sent = 0, checked = 0;

    for (const s of subs ?? []) {
      checked++;
      const tz = typeof s.tz_offset === "number" ? s.tz_offset : 0;
      const { hh, mm, dow } = localNow(tz);

      // casa um HH:MM com o "agora" local dentro da janela do tick do cron
      const inTick = (t: string) => {
        const [th, tm] = String(t || "").split(":").map((x: string) => parseInt(x, 10));
        return hh === (th || 0) && mm >= (tm || 0) && mm < (tm || 0) + CRON_WINDOW_MIN;
      };
      const push = async (payload: Record<string, unknown>) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify(payload),
          );
          sent++;
        } catch (e: any) {
          const code = (e && (e.statusCode || e.status)) || 0;
          if (code === 404 || code === 410) await supabase.from("push_subs").delete().eq("id", s.id);
        }
      };

      // 1) lembrete de TREINO (dias marcados + horário)
      const days: number[] = Array.isArray(s.days) ? s.days : [];
      const dayOk = days.length === 0 || days.includes(dow);
      if (dayOk && inTick(s.reminder_time || "18:00")) {
        await push({ title: "Hora do treino 💪", body: "Seu treino de hoje ainda tá te esperando. Bora mover!", tag: "hg-reminder", url: "/" });
      }
      // 2) lembrete de ÁGUA (todo dia, em cada horário configurado)
      const waterTimes: string[] = Array.isArray(s.water_times) ? s.water_times : [];
      if (waterTimes.some(inTick)) {
        await push({ title: "Hidrate-se 💧", body: "Bora beber uma água e bater a meta do dia.", tag: "hg-water", url: "/" });
      }
      // 3) lembrete de REFEIÇÃO
      const mealTimes: string[] = Array.isArray(s.meal_times) ? s.meal_times : [];
      if (mealTimes.some(inTick)) {
        await push({ title: "Hora de comer 🍽️", body: "Registre sua refeição e fique no alvo de calorias/macros.", tag: "hg-meal", url: "/" });
      }
    }
    return json({ ok: true, checked, sent });
  } catch (e: any) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
