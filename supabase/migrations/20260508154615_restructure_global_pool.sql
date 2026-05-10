-- Restructure: remove private groups → single global pool.
-- Hardcode juampymdd@gmail.com as the app admin via the new-user trigger.
-- Predictions are now global per (match, user); the group_id column is removed.

-- ============================================================================
-- DROP groups feature
-- ============================================================================

drop policy if exists "predictions select members of group" on public.predictions;
drop policy if exists "predictions insert own"             on public.predictions;
drop policy if exists "predictions update own"             on public.predictions;

-- Re-key predictions: drop unique(group_id, match_id, user_id), drop column.
alter table public.predictions
  drop constraint if exists predictions_group_id_match_id_user_id_key;
alter table public.predictions
  drop constraint if exists predictions_group_id_fkey;
alter table public.predictions
  drop column if exists group_id;
alter table public.predictions
  add constraint predictions_match_user_unique unique (match_id, user_id);

-- Drop group_members and groups (cascade handles policies).
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;

-- Drop helper functions tied to groups.
drop function if exists public.is_group_member(uuid, uuid);
drop function if exists public.is_group_admin(uuid, uuid);
drop function if exists public.create_group_with_owner(text, text, uuid);
drop function if exists public.join_group_by_invite(text, uuid);

-- ============================================================================
-- profiles: refresh policies (drop the now-impossible "co-member" branch)
-- ============================================================================

drop policy if exists "profiles select self or co-member" on public.profiles;
create policy "profiles select all authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================================
-- predictions: new RLS for global pool
-- ============================================================================

create policy "predictions select all authenticated"
  on public.predictions for select
  using (auth.role() = 'authenticated');

create policy "predictions insert own"
  on public.predictions for insert
  with check (
    user_id = auth.uid()
    and points = 0
    and exact_hit = false
    and winner_hit = false
  );

create policy "predictions update own"
  on public.predictions for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and points = 0
    and exact_hit = false
    and winner_hit = false
  );

-- ============================================================================
-- handle_new_user: hardcode juampymdd@gmail.com as the app admin
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, is_app_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email = 'juampymdd@gmail.com'
  )
  on conflict (user_id) do update
    set is_app_admin = excluded.is_app_admin or public.profiles.is_app_admin,
        name         = coalesce(public.profiles.name, excluded.name);
  return new;
end;
$$;

-- Backfill: if juampymdd@gmail.com already exists, flag the profile.
update public.profiles p
   set is_app_admin = true
  from auth.users u
 where u.id = p.user_id
   and u.email = 'juampymdd@gmail.com';

-- ============================================================================
-- recalculate_match_points: signature unchanged, but predictions no longer
-- carry group_id, so re-create to keep the function self-consistent.
-- ============================================================================

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

grant execute on function public.recalculate_match_points(uuid, uuid) to authenticated;

-- ============================================================================
-- group_standings: view that computes table per WC group from finished matches.
-- Uses security_invoker so RLS on matches still applies.
-- ============================================================================

drop view if exists public.group_standings cascade;
create view public.group_standings
with (security_invoker = true) as
with played as (
  select
    m.group_name,
    m.home_team_id as team_id,
    case
      when m.home_score > m.away_score then 3
      when m.home_score = m.away_score then 1
      else 0
    end as points,
    1 as played,
    case when m.home_score > m.away_score then 1 else 0 end as won,
    case when m.home_score = m.away_score then 1 else 0 end as drawn,
    case when m.home_score < m.away_score then 1 else 0 end as lost,
    coalesce(m.home_score, 0) as goals_for,
    coalesce(m.away_score, 0) as goals_against
  from public.matches m
  where m.status = 'finished'
    and m.group_name is not null
    and m.home_team_id is not null
  union all
  select
    m.group_name,
    m.away_team_id,
    case
      when m.away_score > m.home_score then 3
      when m.away_score = m.home_score then 1
      else 0
    end,
    1,
    case when m.away_score > m.home_score then 1 else 0 end,
    case when m.away_score = m.home_score then 1 else 0 end,
    case when m.away_score < m.home_score then 1 else 0 end,
    coalesce(m.away_score, 0),
    coalesce(m.home_score, 0)
  from public.matches m
  where m.status = 'finished'
    and m.group_name is not null
    and m.away_team_id is not null
),
agg as (
  select
    group_name,
    team_id,
    sum(points)::int        as points,
    sum(played)::int        as played,
    sum(won)::int           as won,
    sum(drawn)::int         as drawn,
    sum(lost)::int          as lost,
    sum(goals_for)::int     as goals_for,
    sum(goals_against)::int as goals_against,
    (sum(goals_for) - sum(goals_against))::int as goal_diff
  from played
  group by group_name, team_id
)
select
  a.group_name,
  a.team_id,
  t.name      as team_name,
  t.code      as team_code,
  t.flag_url  as team_flag_url,
  a.points,
  a.played,
  a.won,
  a.drawn,
  a.lost,
  a.goals_for,
  a.goals_against,
  a.goal_diff,
  row_number() over (
    partition by a.group_name
    order by a.points desc, a.goal_diff desc, a.goals_for desc, t.name asc
  )::int as position
from agg a
join public.teams t on t.id = a.team_id;

grant select on public.group_standings to authenticated;
