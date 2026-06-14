// Edge Function: send-social-push
// Notifica (Web Push, app fechado) quando chega DM / mensagem de grupo / cutucada.
// É chamada por um TRIGGER no Postgres (pg_net) com { table, id } da linha nova.
// Resolve os destinatários (por PERFIL, via push_subs.profile_name) e dispara o web-push.
//
// Deploy: supabase functions deploy send-social-push  (ou via MCP deploy_edge_function)
// Pré-req: segredos VAPID já existem (mesma RPC get_push_secrets do send-reminders) + pg_net habilitado.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

// envia pra todas as inscrições (push_subs) de um (uid, perfil); limpa as expiradas
async function pushToProfile(supabase: any, uid: string, profile: string | null, payload: object) {
  let q = supabase.from("push_subs").select("*").eq("user_id", uid);
  if (profile) q = q.eq("profile_name", profile);
  const { data: subs } = await q;
  let sent = 0;
  for (const s of subs ?? []) {
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
  }
  return sent;
}

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cfg, error: cfgErr } = await supabase.rpc("get_push_secrets");
    if (cfgErr || !cfg?.[0]) return json({ error: "no config" }, 500);
    const { vapid_public, vapid_private, vapid_subject, cron_secret } = cfg[0];
    if (req.headers.get("x-cron-secret") !== cron_secret) return json({ error: "unauthorized" }, 401);
    webpush.setVapidDetails(vapid_subject, vapid_public, vapid_private);

    const { table, id } = await req.json();
    let sent = 0;

    if (table === "messages") {
      const { data: m } = await supabase.from("messages").select("*").eq("id", id).single();
      if (!m || m.from_uid === m.to_uid) return json({ ok: true, skipped: "team/self" }); // chat de equipe não notifica
      sent = await pushToProfile(supabase, m.to_uid, m.to_profile, {
        title: `💬 ${m.from_profile || "Mensagem"}`, body: m.body, tag: "hg-dm-" + m.from_uid, url: "/",
      });
    } else if (table === "pokes") {
      const { data: p } = await supabase.from("pokes").select("*").eq("id", id).single();
      if (p) sent = await pushToProfile(supabase, p.to_uid, p.to_profile, {
        title: `👉 ${p.from_label || "Alguém"} te cutucou`, body: p.emoji || "👉", tag: "hg-poke", url: "/",
      });
    } else if (table === "group_messages") {
      const { data: gm } = await supabase.from("group_messages").select("*").eq("id", id).single();
      if (gm) {
        const { data: grp } = await supabase.from("groups").select("name").eq("id", gm.group_id).single();
        const { data: members } = await supabase.from("group_members").select("uid,label").eq("group_id", gm.group_id);
        for (const mb of members ?? []) {
          if (mb.uid === gm.from_uid && (mb.label || "") === (gm.from_label || "")) continue; // não notifica o remetente
          sent += await pushToProfile(supabase, mb.uid, mb.label, {
            title: `💬 ${grp?.name || "Grupo"}`, body: `${gm.from_label || "Alguém"}: ${gm.body}`, tag: "hg-grp-" + gm.group_id, url: "/",
          });
        }
      }
    }
    return json({ ok: true, sent });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
