-- Signup with admin approval.
-- The public form (/signup) creates a row here. An app admin reviews from
-- /admin/signup-requests and decides whether to approve, reject, or delete.
-- Approved → admin server-action invites the user via auth.admin and marks
-- the row 'approved'. Rejected → row stays as 'rejected' and that email
-- can't resubmit until the admin deletes the row.

create extension if not exists citext;

create table public.signup_requests (
  id                 uuid        primary key default gen_random_uuid(),
  email              citext      not null unique,
  name               text        not null check (length(trim(name)) between 2 and 80),
  birthdate          date        not null,
  terms_accepted_at  timestamptz not null,
  status             text        not null default 'pending'
                                  check (status in ('pending', 'approved', 'rejected')),
  reject_reason      text,
  reviewed_by        uuid        references auth.users(id) on delete set null,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_signup_requests_status  on public.signup_requests (status);
create index idx_signup_requests_created on public.signup_requests (created_at desc);

-- updated_at trigger
create or replace function public.touch_signup_requests_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists set_signup_requests_updated_at on public.signup_requests;
create trigger set_signup_requests_updated_at
  before update on public.signup_requests
  for each row execute function public.touch_signup_requests_updated_at();

alter table public.signup_requests enable row level security;

-- INSERT: open. The public form needs to insert from anon. Validation
-- happens app-side; admin reviews everything before any auth user is
-- created, so spam can't escalate beyond a row in this table.
drop policy if exists "signup_requests insert public" on public.signup_requests;
create policy "signup_requests insert public"
  on public.signup_requests for insert
  to anon, authenticated
  with check (true);

-- SELECT/UPDATE/DELETE: admin-only.
drop policy if exists "signup_requests select admin" on public.signup_requests;
create policy "signup_requests select admin"
  on public.signup_requests for select
  to authenticated
  using (public.is_app_admin(auth.uid()));

drop policy if exists "signup_requests update admin" on public.signup_requests;
create policy "signup_requests update admin"
  on public.signup_requests for update
  to authenticated
  using (public.is_app_admin(auth.uid()))
  with check (public.is_app_admin(auth.uid()));

drop policy if exists "signup_requests delete admin" on public.signup_requests;
create policy "signup_requests delete admin"
  on public.signup_requests for delete
  to authenticated
  using (public.is_app_admin(auth.uid()));

grant insert                   on public.signup_requests to anon, authenticated;
grant select, update, delete   on public.signup_requests to authenticated;
