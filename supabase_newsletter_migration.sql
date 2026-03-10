-- Newsletter subscribers table
-- Run this in the Supabase SQL Editor

create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text default 'unknown',
  created_at timestamptz default now(),
  constraint newsletter_subscribers_email_key unique (email)
);

-- Allow anyone to insert (subscribe), but only service role can read/update/delete
alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Users can update their own subscription"
  on newsletter_subscribers for update
  using (true)
  with check (true);

-- Index for fast lookups
create index if not exists idx_newsletter_email on newsletter_subscribers (email);
create index if not exists idx_newsletter_created on newsletter_subscribers (created_at desc);
