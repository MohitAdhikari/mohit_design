-- ============================================================================
-- Dashboard auth & role schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

-- Roles are an enum so invalid role strings can never be inserted.
-- Add new roles here in the future (e.g. 'reviewer', 'analyst') without
-- touching any application code that reads/writes the `role` column.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'dashboard_role') then
    create type dashboard_role as enum ('admin', 'editor');
  end if;
end $$;

-- One row per Supabase auth user. Role lives here (NOT in user_metadata,
-- which end users can edit themselves) so it can only be changed by
-- server-side code using the service role key.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role dashboard_role not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users may read their own profile (needed to know their own role/name).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- No insert/update/delete policies are defined for regular users on purpose.
-- All writes to `profiles` (creating users, changing roles, deactivating)
-- happen exclusively through server-side API routes using the
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. This prevents any
-- client-side privilege escalation.

-- Automatically create a profile row whenever a new auth user is created
-- via the Supabase Admin API (used by our "invite user" API route).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::dashboard_role, 'editor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- Optional: lightweight activity log, ready for future expansion
-- (admin dashboards, audit trails) without any architecture changes.
-- ============================================================================
create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

-- No client policies: all reads/writes go through server routes using the
-- service role key (admin-only audit trail).
