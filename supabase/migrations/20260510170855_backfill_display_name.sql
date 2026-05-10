-- Backfill auth.users.raw_user_meta_data.display_name from profiles.name
-- so the Supabase Auth dashboard shows the user's name.
--
-- Going forward, completeOnboardingAction also calls auth.updateUser({ data })
-- to keep these in sync. This migration covers users who already onboarded
-- before that change.

update auth.users u
set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'display_name', p.name,
    'full_name', p.name
  )
from public.profiles p
where p.user_id = u.id
  and p.name is not null
  and btrim(p.name) <> ''
  and (
    u.raw_user_meta_data is null
    or coalesce(u.raw_user_meta_data->>'display_name', '') = ''
  );
