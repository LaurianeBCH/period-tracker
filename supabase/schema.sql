-- =============================================================================
-- Schéma Supabase — Period Tracker V3
-- À exécuter dans l'éditeur SQL de votre projet Supabase (SQL Editor)
-- =============================================================================

-- 1. Table contenant les réglages et dates de règles de chaque utilisatrice
create table if not exists public.user_cycle_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  period_dates jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Activer la sécurité au niveau des lignes (Row Level Security)
alter table public.user_cycle_data enable row level security;

-- 3. Policies : chaque utilisatrice ne peut lire/écrire/supprimer que ses propres données
drop policy if exists "Users can select own cycle data" on public.user_cycle_data;
create policy "Users can select own cycle data"
  on public.user_cycle_data
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cycle data" on public.user_cycle_data;
create policy "Users can insert own cycle data"
  on public.user_cycle_data
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cycle data" on public.user_cycle_data;
create policy "Users can update own cycle data"
  on public.user_cycle_data
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cycle data" on public.user_cycle_data;
create policy "Users can delete own cycle data"
  on public.user_cycle_data
  for delete
  using (auth.uid() = user_id);

-- 4. Fonction RPC permettant à l'utilisatrice connectée de supprimer son compte complet
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Non authentifié';
  end if;

  delete from public.user_cycle_data where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_user_account() to authenticated;

