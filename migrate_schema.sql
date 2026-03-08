-- ============================================================
-- CorpWatch — Schema Migration
-- Run this ONCE to upgrade the reviews table to the new schema.
-- Safe to run even if partially applied (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- Drop old reviews table columns and add new ones
-- (We drop the whole table and recreate since column types and constraints changed)

-- 1. Drop old reviews table (cascades to any RLS policies and triggers)
drop table if exists reviews cascade;

-- 2. Recreate reviews with new consumer-ethics schema
create table reviews (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  headline            text not null,
  body                text not null,
  overall             int  not null check (overall between 1 and 5),
  environmental       int  not null check (environmental between 1 and 5),
  ethical_business    int  not null check (ethical_business between 1 and 5),
  consumer_trust      int  not null check (consumer_trust between 1 and 5),
  scandals            int  not null check (scandals between 1 and 5),
  sources             text,
  is_flagged          boolean default false,
  flag_reason         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (company_id, user_id)
);

create index if not exists reviews_company_id_idx on reviews(company_id);
create index if not exists reviews_user_id_idx on reviews(user_id);

alter table reviews enable row level security;
create policy "reviews_select"  on reviews for select using (true);
create policy "reviews_insert"  on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update"  on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete"  on reviews for delete using (auth.uid() = user_id);

-- 3. Recreate the aggregate trigger
create or replace function update_company_aggregates()
returns trigger language plpgsql as $$
declare cid uuid;
begin
  cid := coalesce(new.company_id, old.company_id);
  update companies set
    review_count         = (select count(*) from reviews where company_id = cid),
    avg_overall          = coalesce((select avg(overall)          from reviews where company_id = cid), 0),
    avg_environmental    = coalesce((select avg(environmental)    from reviews where company_id = cid), 0),
    avg_ethical_business = coalesce((select avg(ethical_business) from reviews where company_id = cid), 0),
    avg_consumer_trust   = coalesce((select avg(consumer_trust)   from reviews where company_id = cid), 0),
    avg_scandals         = coalesce((select avg(scandals)         from reviews where company_id = cid), 0)
  where id = cid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_agg_trigger on reviews;
create trigger reviews_agg_trigger
  after insert or update or delete on reviews
  for each row execute procedure update_company_aggregates();

-- 4. Add new aggregate columns to companies if they don't exist yet
alter table companies
  add column if not exists avg_environmental     numeric(3,2) default 0,
  add column if not exists avg_ethical_business  numeric(3,2) default 0,
  add column if not exists avg_consumer_trust    numeric(3,2) default 0,
  add column if not exists avg_scandals          numeric(3,2) default 0;

-- Done. Now run seed_data.sql.
