-- Allow app admins to disable users without deleting them.
-- Disabled users keep their account and can still log in (read-only),
-- but cannot create/edit predictions and are hidden from the global ranking.

alter table public.profiles
  add column if not exists disabled_at timestamptz;

create index if not exists idx_profiles_disabled_at
  on public.profiles (disabled_at)
  where disabled_at is null;

-- Re-issue the profile self-update RLS so users cannot toggle their own
-- `is_app_admin` or `disabled_at`. Both stay pinned to the existing value.
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and is_app_admin = (
      select is_app_admin from public.profiles where user_id = auth.uid()
    )
    and disabled_at is not distinct from (
      select disabled_at from public.profiles where user_id = auth.uid()
    )
  );

-- Reject prediction inserts/updates from disabled users at the RLS layer.
-- Server actions also check this for friendlier error messages, but RLS is
-- the authoritative gate.
drop policy if exists "predictions insert own" on public.predictions;
create policy "predictions insert own"
  on public.predictions for insert
  with check (
    user_id = auth.uid()
    and points = 0
    and exact_hit = false
    and winner_hit = false
    and not exists (
      select 1 from public.profiles
      where user_id = auth.uid() and disabled_at is not null
    )
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
    and not exists (
      select 1 from public.profiles
      where user_id = auth.uid() and disabled_at is not null
    )
  );

-- Skip disabled users when recalculating points so their predictions don't
-- accumulate score after being disabled.
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
