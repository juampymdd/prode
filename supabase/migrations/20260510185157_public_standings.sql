-- Open the standings view (and the underlying teams/matches reads it
-- needs) to anonymous visitors. The landing exposes /tablas publicly so
-- people can preview the live tournament without an account.
--
-- No private data is involved: teams hold name/code/flag only, matches
-- carry kickoff time and scores — all information is public anyway.
-- Predictions stay locked behind the original RLS policies.

-- teams: replace the authenticated-only read with a policy that also lets
-- anon read. Write policy stays admin-only and untouched.
drop policy if exists "teams select all authenticated" on public.teams;
drop policy if exists "teams select public"            on public.teams;
create policy "teams select public"
  on public.teams for select
  to anon, authenticated
  using (true);

-- matches: same shape — anyone can read, only admins can write.
drop policy if exists "matches select all authenticated" on public.matches;
drop policy if exists "matches select public"            on public.matches;
create policy "matches select public"
  on public.matches for select
  to anon, authenticated
  using (true);

-- The view runs with security_invoker = true, so the caller's RLS now
-- decides what they see. Grant SELECT to anon so the role can issue the
-- query at all.
grant select on public.group_standings to anon;
grant select on public.teams            to anon;
grant select on public.matches          to anon;
