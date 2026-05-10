-- Enable realtime broadcast for the matches table so the standings page
-- (and any other client subscribed to it) receives live updates as soon as
-- the admin loads a result.
--
-- ALTER PUBLICATION ... DROP TABLE doesn't accept IF EXISTS, so we guard
-- both branches with a DO block consulting pg_publication_tables.

do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
     where pubname    = 'supabase_realtime'
       and schemaname = 'public'
       and tablename  = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;
end$$;
