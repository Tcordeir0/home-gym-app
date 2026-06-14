-- Triggers que disparam push social (DM / cutucada / msg de grupo) ao inserir a linha.
-- Chama a Edge Function send-social-push via pg_net, autenticando com o cron_secret.
-- ⚠️ Aplicar SÓ com aprovação (mexe em produção). Requer a function send-social-push deployada.

create extension if not exists pg_net with schema extensions;

create or replace function public.fire_social_push() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_secret text;
  v_url text := 'https://mtbdbahmwbjmmuljvxfn.supabase.co/functions/v1/send-social-push';
begin
  select cron_secret into v_secret from public.get_push_secrets() limit 1;
  if v_secret is null then return NEW; end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := jsonb_build_object('table', TG_TABLE_NAME, 'id', NEW.id)
  );
  return NEW;
exception when others then
  return NEW; -- nunca quebrar o insert por causa da notificação
end; $$;

drop trigger if exists trg_push_messages on public.messages;
create trigger trg_push_messages after insert on public.messages
  for each row execute function public.fire_social_push();

drop trigger if exists trg_push_pokes on public.pokes;
create trigger trg_push_pokes after insert on public.pokes
  for each row execute function public.fire_social_push();

drop trigger if exists trg_push_group_messages on public.group_messages;
create trigger trg_push_group_messages after insert on public.group_messages
  for each row execute function public.fire_social_push();
