-- ============================================================
-- Home Gym Tracker — configuração do banco (rode no Supabase)
-- Supabase Dashboard → SQL Editor → New query → cole tudo → Run
-- ============================================================

-- Tabela: um registro por usuário (conta), guardando o estado do app em JSON
create table if not exists public.app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Segurança em nível de linha: cada conta só acessa o próprio registro
alter table public.app_state enable row level security;

-- Garante que o papel "authenticated" (logado) pode operar na tabela via Data API
grant select, insert, update on public.app_state to authenticated;

drop policy if exists "own_select" on public.app_state;
drop policy if exists "own_insert" on public.app_state;
drop policy if exists "own_update" on public.app_state;

create policy "own_select" on public.app_state
  for select using (auth.uid() = user_id);

create policy "own_insert" on public.app_state
  for insert with check (auth.uid() = user_id);

create policy "own_update" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pronto. Depois crie o usuário compartilhado:
-- Authentication → Users → Add user → email + senha (marque "Auto Confirm User").
-- Esse email/senha é o login que os dois celulares vão usar.
