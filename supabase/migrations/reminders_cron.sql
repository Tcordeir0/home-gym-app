-- Cron do LEMBRETE DE TREINO: chama a Edge Function send-reminders a cada 15 min.
-- A function lê push_subs (days/reminder_time/tz_offset) e dispara o push de quem bate o horário.
-- ⚠️ Aplicar SÓ com aprovação (mexe em produção). Requer: send-reminders deployada,
--    pg_net + pg_cron habilitados, e a RPC get_push_secrets já existente (push do Social).

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- Garante as colunas que o cliente (lib/push.ts) e a function esperam (idempotente).
alter table public.push_subs add column if not exists days int[] default '{}';
alter table public.push_subs add column if not exists reminder_time text default '18:00';
alter table public.push_subs add column if not exists tz_offset int default 0;

-- Dispara a Edge Function send-reminders autenticando com o cron_secret (mesma RPC do Social).
create or replace function public.fire_reminders() returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_secret text;
  v_url text := 'https://mtbdbahmwbjmmuljvxfn.supabase.co/functions/v1/send-reminders';
begin
  select cron_secret into v_secret from public.get_push_secrets() limit 1;
  if v_secret is null then return; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := '{}'::jsonb
  );
exception when others then
  return; -- nunca quebra o cron por causa de uma falha pontual
end; $$;

-- Agenda a cada 15 min (precisa casar com CRON_WINDOW_MIN=15 na Edge Function).
select cron.unschedule('hg-reminders') where exists (select 1 from cron.job where jobname = 'hg-reminders');
select cron.schedule('hg-reminders', '*/15 * * * *', $$ select public.fire_reminders(); $$);
