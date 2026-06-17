-- Lembretes de DIETA (água/refeição) via Web Push.
-- Guarda os horários (HH:MM) por aparelho em push_subs; a Edge Function send-reminders
-- lê estes arrays e dispara no horário (mesmo mecanismo + cron do lembrete de treino).
-- Aplicar em produção SÓ com OK do Talys (via Supabase MCP apply_migration ou CLI).

alter table public.push_subs add column if not exists water_times text[] default '{}';
alter table public.push_subs add column if not exists meal_times text[] default '{}';

-- Depois de aplicar: redeploy da função `send-reminders` (já atualizada no repo).
-- O cron `hg-reminders` (*/15) continua o mesmo — não precisa recriar.
