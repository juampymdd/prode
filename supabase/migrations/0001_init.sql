-- Mundial 2026 — initial schema, RLS, helper functions, triggers.
-- Run on a fresh Supabase project.

create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text,
  avatar_url text,
  is_app_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  flag_url text,
  created_at timestamptz not null default now()
);

create unique index if not exists teams_code_unique
  on public.teams (code) where code is not null;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  starts_at timestamptz not null,
  stage text,
  group_name text,
  status text not null default 'scheduled' check (status in ('scheduled', 'locked', 'live', 'finished')),
  home_score integer,
  away_score integer,
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points integer not null default 0 check (points >= 0),
  exact_hit boolean not null default false,
  winner_hit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(group_id, match_id, user_id)
);

create index if not exists idx_group_members_user on public.group_members(user_id);
create index if not exists idx_group_members_group on public.group_members(group_id);
create index if not exists idx_predictions_group on public.predictions(group_id);
create index if not exists idx_predictions_match on public.predictions(match_id);
create index if not exists idx_predictions_user on public.predictions(user_id);
create index if not exists idx_matches_starts_at on public.matches(starts_at);

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER bypass RLS for membership lookups)
-- ============================================================================

create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

create or replace function public.is_group_admin(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id and role = 'admin'
  );
$$;

create or replace function public.is_app_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_app_admin from public.profiles where user_id = p_user_id),
    false
  );
$$;

-- Auto-create profile on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic group creation: inserts group + admin membership for the owner.
create or replace function public.create_group_with_owner(
  p_name text,
  p_invite_code text,
  p_owner_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
begin
  insert into public.groups (name, invite_code, owner_id)
  values (p_name, p_invite_code, p_owner_id)
  returning id into v_group_id;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, p_owner_id, 'admin');

  return v_group_id;
end;
$$;

-- Join via invite code (idempotent).
create or replace function public.join_group_by_invite(
  p_invite_code text,
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id from public.groups where invite_code = p_invite_code;
  if v_group_id is null then
    raise exception 'INVITE_CODE_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, p_user_id, 'user')
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;

-- Recalculate points for every prediction tied to a finished match.
-- Mirrors the TS scoring rules in lib/scoring/calculate-prediction-points.ts.
create or replace function public.recalculate_match_points(
  p_match_id uuid,
  p_caller_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  p record;
  v_count integer := 0;
  v_points integer;
  v_exact boolean;
  v_winner boolean;
begin
  if not public.is_app_admin(p_caller_id) then
    raise exception 'NOT_APP_ADMIN' using errcode = 'P0001';
  end if;

  select home_score, away_score into m from public.matches where id = p_match_id;
  if m.home_score is null or m.away_score is null then
    return 0;
  end if;

  for p in select * from public.predictions where match_id = p_match_id loop
    v_exact := (p.home_score = m.home_score and p.away_score = m.away_score);
    v_winner := (
      sign(p.home_score - p.away_score) = sign(m.home_score - m.away_score)
    );

    if v_exact then
      v_points := 5;
      v_winner := true;
    else
      v_points := 0;
      if v_winner then v_points := v_points + 3; end if;
      if (p.home_score - p.away_score) = (m.home_score - m.away_score) then
        v_points := v_points + 2;
      end if;
      if p.home_score = m.home_score then v_points := v_points + 1; end if;
      if p.away_score = m.away_score then v_points := v_points + 1; end if;
    end if;

    update public.predictions
    set points = greatest(v_points, 0),
        exact_hit = v_exact,
        winner_hit = v_winner,
        updated_at = now()
    where id = p.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Touch updated_at on prediction edits.
create or replace function public.touch_prediction_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists predictions_touch_updated_at on public.predictions;
create trigger predictions_touch_updated_at
  before update on public.predictions
  for each row execute function public.touch_prediction_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.predictions enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;

-- ---- profiles ----
drop policy if exists "profiles select self or co-member" on public.profiles;
create policy "profiles select self or co-member"
  on public.profiles for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.group_members me
      join public.group_members other
        on other.group_id = me.group_id
      where me.user_id = auth.uid()
        and other.user_id = profiles.user_id
    )
  );

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_app_admin = (select is_app_admin from public.profiles where user_id = auth.uid()));

-- ---- groups ----
drop policy if exists "groups select members" on public.groups;
create policy "groups select members"
  on public.groups for select
  using (public.is_group_member(id, auth.uid()));

drop policy if exists "groups insert by owner" on public.groups;
create policy "groups insert by owner"
  on public.groups for insert
  with check (owner_id = auth.uid());

drop policy if exists "groups update by admin" on public.groups;
create policy "groups update by admin"
  on public.groups for update
  using (public.is_group_admin(id, auth.uid()))
  with check (public.is_group_admin(id, auth.uid()));

drop policy if exists "groups delete by owner" on public.groups;
create policy "groups delete by owner"
  on public.groups for delete
  using (owner_id = auth.uid());

-- ---- group_members ----
drop policy if exists "members select if co-member" on public.group_members;
create policy "members select if co-member"
  on public.group_members for select
  using (public.is_group_member(group_id, auth.uid()));

-- Inserts go through SECURITY DEFINER functions (create_group_with_owner / join_group_by_invite).
-- Direct insert is blocked by absence of an INSERT policy.

drop policy if exists "members update by admin" on public.group_members;
create policy "members update by admin"
  on public.group_members for update
  using (public.is_group_admin(group_id, auth.uid()))
  with check (public.is_group_admin(group_id, auth.uid()));

drop policy if exists "members delete by admin or self" on public.group_members;
create policy "members delete by admin or self"
  on public.group_members for delete
  using (
    public.is_group_admin(group_id, auth.uid())
    or user_id = auth.uid()
  );

-- ---- teams ----
drop policy if exists "teams select all authenticated" on public.teams;
create policy "teams select all authenticated"
  on public.teams for select
  using (auth.role() = 'authenticated');

drop policy if exists "teams write app admin only" on public.teams;
create policy "teams write app admin only"
  on public.teams for all
  using (public.is_app_admin(auth.uid()))
  with check (public.is_app_admin(auth.uid()));

-- ---- matches ----
drop policy if exists "matches select all authenticated" on public.matches;
create policy "matches select all authenticated"
  on public.matches for select
  using (auth.role() = 'authenticated');

drop policy if exists "matches write app admin only" on public.matches;
create policy "matches write app admin only"
  on public.matches for all
  using (public.is_app_admin(auth.uid()))
  with check (public.is_app_admin(auth.uid()));

-- ---- predictions ----
drop policy if exists "predictions select members of group" on public.predictions;
create policy "predictions select members of group"
  on public.predictions for select
  using (public.is_group_member(group_id, auth.uid()));

-- Insert/update only own predictions, with no points tampering.
-- Time-window enforcement is handled in Server Actions (RLS cannot easily
-- look up matches.starts_at without recursion).
drop policy if exists "predictions insert own" on public.predictions;
create policy "predictions insert own"
  on public.predictions for insert
  with check (
    user_id = auth.uid()
    and public.is_group_member(group_id, auth.uid())
    and points = 0
    and exact_hit = false
    and winner_hit = false
  );

drop policy if exists "predictions update own" on public.predictions;
create policy "predictions update own"
  on public.predictions for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and points = 0
    and exact_hit = false
    and winner_hit = false
  );

-- Points writes happen via SECURITY DEFINER from Server Actions.

-- ============================================================================
-- GRANTS
-- ============================================================================

grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.is_group_admin(uuid, uuid) to authenticated;
grant execute on function public.is_app_admin(uuid) to authenticated;
grant execute on function public.create_group_with_owner(text, text, uuid) to authenticated;
grant execute on function public.join_group_by_invite(text, uuid) to authenticated;
grant execute on function public.recalculate_match_points(uuid, uuid) to authenticated;
