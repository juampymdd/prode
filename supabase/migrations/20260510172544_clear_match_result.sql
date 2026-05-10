-- Allow app admins to clear a loaded match result (e.g. wrong score saved).
-- Resets the scores, sends the match back to 'scheduled', and zeroes out the
-- accumulated points/exact_hit/winner_hit on every prediction for that match
-- so the ranking reflects reality again.

create or replace function public.clear_match_result(
  p_match_id uuid,
  p_caller_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_app_admin(p_caller_id) then
    raise exception 'NOT_APP_ADMIN' using errcode = 'P0001';
  end if;

  -- Reset derived prediction fields. The enforce_prediction_lock trigger
  -- early-returns when home_score/away_score (user fields) don't change,
  -- so this update is allowed even after kickoff.
  update public.predictions
  set points = 0,
      exact_hit = false,
      winner_hit = false,
      updated_at = now()
  where match_id = p_match_id;

  update public.matches
  set home_score = null,
      away_score = null,
      status = 'scheduled'
  where id = p_match_id;
end;
$$;

grant execute on function public.clear_match_result(uuid, uuid) to authenticated;
