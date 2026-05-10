-- Security hardening: address findings from the security audit.
--
--   C-1   Make admin RPCs use auth.uid() instead of a client-supplied param.
--   A-2   Make is_app_admin() respect disabled_at so disabled admins lose RLS
--         power too.
--   M-4   Restrict predictions SELECT so a user only sees their own picks
--         until the match is locked/started/finished.
--   B-1   Tighten enforce_prediction_lock so any non-derived field change
--         re-triggers the kickoff check.
--   A-1   Server-side throttle table for signup / magic-link rate limits.
--   M-4*  Aggregated ranking RPC so the leaderboard remains accurate even
--         when per-prediction RLS hides rows of other users.

-- ============================================================================
-- 1. is_app_admin: now requires the admin not to be disabled.
-- ============================================================================

create or replace function public.is_app_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select is_app_admin and disabled_at is null
        from public.profiles
       where user_id = p_user_id
    ),
    false
  );
$$;

-- ============================================================================
-- 2. Admin RPCs: drop the old (uuid, uuid) signature and re-create using
--    auth.uid() as the authoritative caller identity. The previous version
--    let any authenticated user pass an admin's uuid as p_caller_id and
--    bypass the check (CRITICAL).
-- ============================================================================

drop function if exists public.clear_match_result(uuid, uuid);
drop function if exists public.recalculate_match_points(uuid, uuid);

create or replace function public.recalculate_match_points(p_match_id uuid)
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
  if not public.is_app_admin(auth.uid()) then
    raise exception 'NOT_APP_ADMIN' using errcode = 'P0001';
  end if;

  select home_score, away_score into m from public.matches where id = p_match_id;
  if m.home_score is null or m.away_score is null then
    return 0;
  end if;

  for p in
    select pr.*
      from public.predictions pr
      join public.profiles pf on pf.user_id = pr.user_id
     where pr.match_id = p_match_id
       and pf.disabled_at is null
  loop
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
    end if;

    update public.predictions
       set points     = greatest(v_points, 0),
           exact_hit  = v_exact,
           winner_hit = v_winner,
           updated_at = now()
     where id = p.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

create or replace function public.clear_match_result(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_app_admin(auth.uid()) then
    raise exception 'NOT_APP_ADMIN' using errcode = 'P0001';
  end if;

  update public.predictions
     set points     = 0,
         exact_hit  = false,
         winner_hit = false,
         updated_at = now()
   where match_id = p_match_id;

  update public.matches
     set home_score = null,
         away_score = null,
         status     = 'scheduled'
   where id = p_match_id;
end;
$$;

grant execute on function public.recalculate_match_points(uuid) to authenticated;
grant execute on function public.clear_match_result(uuid)        to authenticated;

-- ============================================================================
-- 3. predictions SELECT: own row, or any row whose match is no longer open
--    for editing. Hides everyone else's picks until kickoff.
-- ============================================================================

drop policy if exists "predictions select all authenticated" on public.predictions;
drop policy if exists "predictions select own or locked"     on public.predictions;

create policy "predictions select own or locked"
  on public.predictions for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.matches m
       where m.id = predictions.match_id
         and (m.status in ('locked', 'live', 'finished') or m.starts_at <= now())
    )
  );

-- ============================================================================
-- 4. enforce_prediction_lock: only the recalc / clear paths should skip the
--    kickoff check. Any change to user-controlled fields re-evaluates.
-- ============================================================================

create or replace function public.enforce_prediction_lock()
returns trigger
language plpgsql
as $$
declare
  m record;
begin
  if TG_OP = 'UPDATE'
     and new.home_score = old.home_score
     and new.away_score = old.away_score
     and new.user_id    = old.user_id
     and new.match_id   = old.match_id then
    return new;
  end if;

  select status, starts_at into m
    from public.matches
   where id = new.match_id;

  if not found then
    raise exception 'MATCH_NOT_FOUND' using errcode = 'P0001';
  end if;

  if m.status <> 'scheduled' then
    raise exception 'MATCH_LOCKED' using errcode = 'P0001';
  end if;

  if m.starts_at <= now() then
    raise exception 'MATCH_STARTED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- ============================================================================
-- 5. auth_throttle: per-IP rate-limiting bucket for unauthenticated flows
--    (signup, magic-link). Read/written only via the service role from the
--    server actions; locked at the RLS level for safety.
-- ============================================================================

create table if not exists public.auth_throttle (
  id          bigserial primary key,
  scope       text        not null check (scope in ('signup', 'magic_link')),
  ip          text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_auth_throttle_scope_ip_created
  on public.auth_throttle (scope, ip, created_at desc);

alter table public.auth_throttle enable row level security;
-- No policies → no read/write access for anon or authenticated. The service
-- role bypasses RLS, which is what the server actions use.

-- ============================================================================
-- 6. global_ranking RPC: aggregates points without exposing per-prediction
--    rows. Lets the leaderboard stay accurate even after M-4 hides preds.
-- ============================================================================

create or replace function public.get_global_ranking()
returns table (
  user_id           uuid,
  name              text,
  is_app_admin      boolean,
  total_points      integer,
  exact_hits        integer,
  winner_hits       integer,
  predictions_count integer
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pf.user_id,
    pf.name,
    pf.is_app_admin,
    coalesce(sum(pr.points), 0)::int                                       as total_points,
    coalesce(sum(case when pr.exact_hit  then 1 else 0 end), 0)::int       as exact_hits,
    coalesce(sum(case when pr.winner_hit then 1 else 0 end), 0)::int       as winner_hits,
    coalesce(count(pr.id), 0)::int                                         as predictions_count
    from public.profiles pf
    left join public.predictions pr on pr.user_id = pf.user_id
   where pf.disabled_at is null
   group by pf.user_id, pf.name, pf.is_app_admin;
$$;

grant execute on function public.get_global_ranking() to authenticated, anon;
