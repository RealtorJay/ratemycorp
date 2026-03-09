-- ══════════════════════════════════════════════════════════════════════════════
-- RateMyCorps — Intel Dossier Migration
-- Run this in Supabase SQL Editor AFTER supabase_schema.sql
-- Creates: intel_items, intel_comments, triggers, RLS policies
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Intel Items (unified company dossier feed) ─────────────────────────────
create table if not exists intel_items (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,

  -- Content type
  item_type       text not null check (item_type in (
    'tweet', 'instagram', 'tiktok', 'youtube', 'linkedin', 'reddit',
    'news', 'press_release', 'research', 'report'
  )),

  -- Who/what is this about?
  subject_type    text not null default 'company' check (subject_type in (
    'company', 'ceo', 'public_discourse'
  )),

  -- Core content
  title           text,
  body            text,
  embed_url       text,          -- social media post URL (rendered client-side)
  source_url      text,          -- link to original source
  source_name     text,          -- e.g. "Reuters", "TikTok", "@elonmusk"
  thumbnail_url   text,
  published_at    timestamptz,

  -- Classification
  category        text check (category in (
    'environmental', 'labor', 'consumer', 'legal', 'financial',
    'regulatory', 'scandal', 'positive', 'neutral', 'other'
  )),
  tags            text[] default '{}',

  -- Moderation (follows forum_posts pattern)
  status          text not null default 'approved'
                    check (status in ('pending', 'approved', 'rejected')),
  flag_count      int default 0,
  is_pinned       boolean default false,

  -- Engagement (denormalized)
  comment_count   int default 0,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Indexes for feed queries
create index if not exists intel_items_company_idx
  on intel_items(company_id, created_at desc);
create index if not exists intel_items_type_idx
  on intel_items(item_type);
create index if not exists intel_items_subject_idx
  on intel_items(subject_type);
create index if not exists intel_items_status_idx
  on intel_items(status);
create index if not exists intel_items_pinned_idx
  on intel_items(company_id, is_pinned desc, created_at desc);

-- RLS
alter table intel_items enable row level security;

create policy "intel_items_select" on intel_items
  for select using (status = 'approved' or auth.uid() = user_id);

create policy "intel_items_insert" on intel_items
  for insert with check (auth.uid() = user_id);

create policy "intel_items_update" on intel_items
  for update using (auth.uid() = user_id);


-- ── Intel Comments (threaded discussion per intel item) ─────────────────────
create table if not exists intel_comments (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references intel_items(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  flag_count  int default 0,
  created_at  timestamptz default now()
);

create index if not exists intel_comments_item_idx
  on intel_comments(item_id, created_at asc);

-- RLS
alter table intel_comments enable row level security;

create policy "intel_comments_select" on intel_comments
  for select using (status = 'approved' or auth.uid() = user_id);

create policy "intel_comments_insert" on intel_comments
  for insert with check (auth.uid() = user_id);

create policy "intel_comments_update" on intel_comments
  for update using (auth.uid() = user_id);

create policy "intel_comments_delete" on intel_comments
  for delete using (auth.uid() = user_id);


-- ── Trigger: auto-update comment_count on intel_items ───────────────────────
create or replace function update_intel_comment_count()
returns trigger language plpgsql as $$
declare iid uuid;
begin
  iid := coalesce(new.item_id, old.item_id);
  update intel_items set
    comment_count = (
      select count(*) from intel_comments
      where item_id = iid and status = 'approved'
    )
  where id = iid;
  return coalesce(new, old);
end;
$$;

create trigger intel_comments_count_trigger
  after insert or update or delete on intel_comments
  for each row execute procedure update_intel_comment_count();


-- ── Extend flags table to support intel target types ────────────────────────
-- Only run if the constraint exists; safe to re-run
do $$
begin
  alter table flags drop constraint if exists flags_target_type_check;
  alter table flags add constraint flags_target_type_check
    check (target_type in (
      'review', 'forum_post', 'forum_comment',
      'intel_item', 'intel_comment'
    ));
exception when others then
  raise notice 'flags constraint update skipped: %', sqlerrm;
end $$;
