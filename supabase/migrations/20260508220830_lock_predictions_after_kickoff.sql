-- Hard lock: predictions cannot be inserted or have their score edited once
-- the match has kicked off (or is no longer in the 'scheduled' status).
--
-- The recalc path (admin loading a result) only touches points/exact_hit/
-- winner_hit, so the trigger early-returns in that case.

create or replace function public.enforce_prediction_lock()
returns trigger
language plpgsql
as $$
declare
  m record;
begin
  -- Skip when the user-controlled fields haven't changed (recalc path).
  if TG_OP = 'UPDATE'
     and new.home_score = old.home_score
     and new.away_score = old.away_score then
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

drop trigger if exists predictions_enforce_lock on public.predictions;
create trigger predictions_enforce_lock
  before insert or update on public.predictions
  for each row execute function public.enforce_prediction_lock();
