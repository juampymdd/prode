-- Profile onboarding: collect full name, birthdate, and T&C acceptance
-- after the user confirms their email via magic link.

alter table public.profiles
  add column if not exists birthdate          date,
  add column if not exists terms_accepted_at  timestamptz;

-- Existing trigger already pre-fills `name` from email; we keep that as a
-- harmless default. The signal for "needs onboarding" is
-- `terms_accepted_at IS NULL` (and birthdate IS NULL), regardless of name.

-- Re-issue the profiles update RLS so users can edit their own onboarding
-- fields (and prevent toggling is_app_admin from the client).
drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
  on public.profiles for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and is_app_admin = (
      select is_app_admin from public.profiles where user_id = auth.uid()
    )
  );
