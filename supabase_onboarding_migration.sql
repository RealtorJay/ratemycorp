-- ── Onboarding & Personalization Migration ────────────────────────────────────
-- Run this in Supabase SQL Editor after the main schema.
-- Adds user preferences and company follow tracking for personalization.

-- ── User Preferences ──────────────────────────────────────────────────────────
create table if not exists user_preferences (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  onboarding_done boolean default false,
  industries      text[] default '{}',
  issues          text[] default '{}',
  -- issues: 'environment', 'ethics', 'consumer_trust', 'scandals', 'political_connections'
  user_values     text[] default '{}',
  -- e.g. 'environment_accountability', 'free_markets', 'worker_rights',
  -- 'small_government', 'data_privacy', 'job_creation', 'money_out_of_politics', 'national_security'
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "user_preferences_select" on user_preferences
  for select using (auth.uid() = user_id);
create policy "user_preferences_insert" on user_preferences
  for insert with check (auth.uid() = user_id);
create policy "user_preferences_update" on user_preferences
  for update using (auth.uid() = user_id);

-- ── User Followed Companies ──────────────────────────────────────────────────
create table if not exists user_followed_companies (
  user_id    uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, company_id)
);

alter table user_followed_companies enable row level security;

create policy "user_followed_companies_select" on user_followed_companies
  for select using (auth.uid() = user_id);
create policy "user_followed_companies_insert" on user_followed_companies
  for insert with check (auth.uid() = user_id);
create policy "user_followed_companies_delete" on user_followed_companies
  for delete using (auth.uid() = user_id);

-- ── Update the new-user trigger to also create a preferences row ─────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict do nothing;
  insert into public.user_preferences (user_id) values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

-- ── Backfill: create preferences rows for existing users who don't have one ──
insert into user_preferences (user_id)
select id from auth.users
where id not in (select user_id from user_preferences)
on conflict do nothing;
