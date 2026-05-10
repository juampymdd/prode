-- Show ALL group-stage teams in the standings view, even when no match has
-- been played yet. Tables now start with every team at 0 and update as the
-- admin loads results.
--
-- The previous version started from finished matches, so empty groups did
-- not appear at all.

drop view if exists public.group_standings cascade;

create view public.group_standings
with (security_invoker = true) as
with team_groups as (
  -- Every (group, team) pair that participates in the group stage,
  -- regardless of match status. Equipo aparece en cuanto está en el fixture.
  select distinct m.group_name, m.home_team_id as team_id
    from public.matches m
   where m.group_name is not null
     and m.home_team_id is not null
  union
  select distinct m.group_name, m.away_team_id
    from public.matches m
   where m.group_name is not null
     and m.away_team_id is not null
),
played as (
  -- Stats per team per finished match (one row per side).
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
    tg.group_name,
    tg.team_id,
    coalesce(sum(p.points), 0)::int        as points,
    coalesce(sum(p.played), 0)::int        as played,
    coalesce(sum(p.won), 0)::int           as won,
    coalesce(sum(p.drawn), 0)::int         as drawn,
    coalesce(sum(p.lost), 0)::int          as lost,
    coalesce(sum(p.goals_for), 0)::int     as goals_for,
    coalesce(sum(p.goals_against), 0)::int as goals_against,
    coalesce(sum(p.goals_for) - sum(p.goals_against), 0)::int as goal_diff
  from team_groups tg
  left join played p
    on p.group_name = tg.group_name
   and p.team_id    = tg.team_id
  group by tg.group_name, tg.team_id
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
