-- Remove the "+1 per matched team score" rule from the scorer.
-- New rules: 5 (exact, terminal) · 3 (winner/draw) · 2 (goal difference).
-- Mirrors lib/scoring/calculate-prediction-points.ts.

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

-- Recompute every prediction tied to an already-finished match so historical
-- data reflects the new rules. This bypasses the admin guard by inlining the
-- same scoring logic.
do $$
declare
  m record;
  p record;
  v_points integer;
  v_exact  boolean;
  v_winner boolean;
begin
  for m in
    select id, home_score, away_score
      from public.matches
     where status = 'finished'
       and home_score is not null
       and away_score is not null
  loop
    for p in select * from public.predictions where match_id = m.id loop
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
    end loop;
  end loop;
end$$;
