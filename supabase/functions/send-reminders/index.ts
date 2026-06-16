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
      const [rh, rm] = String(s.reminder_time || "18:00").split(":").map((x: string) => parseInt(x, 10));
      const days: number[] = Array.isArray(s.days) ? s.days : [];
      const dayOk = days.length === 0 || days.includes(dow);     // sem dias = todo dia
      const sameHour = hh === (rh || 0);
      const inWindow = mm >= (rm || 0) && mm < (rm || 0) + CRON_WINDOW_MIN; // janela do tick do cron
      if (!dayOk || !sameHour || !inWindow) continue;

      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: "Hora do treino 💪", body: "Seu treino de hoje ainda tá te esperando. Bora mover!", tag: "hg-reminder", url: "/" }),
        );
        sent++;
      } catch (e: any) {
        const code = (e && (e.statusCode || e.status)) || 0;
        if (code === 404 || code === 410) await supabase.from("push_subs").delete().eq("id", s.id);
      }
    }
    return json({ ok: true, checked, sent });
  } catch (e: any) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
