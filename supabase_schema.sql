-- ============================================================
-- CorpWatch — Full Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- ── Companies ─────────────────────────────────────────────
create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  industry      text,
  description   text,
  website       text,
  created_at    timestamptz default now(),
  -- Denormalized aggregates (updated by trigger)
  review_count          int          default 0,
  avg_overall           numeric(3,2) default 0,
  avg_environmental     numeric(3,2) default 0,
  avg_ethical_business  numeric(3,2) default 0,
  avg_consumer_trust    numeric(3,2) default 0,
  avg_scandals          numeric(3,2) default 0
);

create index if not exists companies_name_gin on companies using gin(to_tsvector('english', name));
create index if not exists companies_industry_idx on companies(industry);
create index if not exists companies_avg_overall_idx on companies(avg_overall desc);

alter table companies enable row level security;
create policy "companies_select" on companies for select using (true);

-- ── Reviews ───────────────────────────────────────────────
-- Consumer-facing: rate companies on ethics & values, not employment
create table if not exists reviews (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  headline            text not null,
  body                text not null,           -- main review text (replaces pros/cons)
  overall             int  not null check (overall between 1 and 5),
  environmental       int  not null check (environmental between 1 and 5),
  ethical_business    int  not null check (ethical_business between 1 and 5),
  consumer_trust      int  not null check (consumer_trust between 1 and 5),
  scandals            int  not null check (scandals between 1 and 5),
  sources             text,                    -- optional URLs/links to support claims
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

-- Aggregate trigger
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

-- ── Forum Posts ───────────────────────────────────────────
create table if not exists forum_posts (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  body        text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  flag_count  int  default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists forum_posts_company_id_idx on forum_posts(company_id);
create index if not exists forum_posts_status_idx on forum_posts(status);

alter table forum_posts enable row level security;
create policy "forum_posts_select" on forum_posts for select
  using (status = 'approved' or auth.uid() = user_id);
create policy "forum_posts_insert" on forum_posts for insert with check (auth.uid() = user_id);
create policy "forum_posts_update" on forum_posts for update using (auth.uid() = user_id);
create policy "forum_posts_delete" on forum_posts for delete using (auth.uid() = user_id);

-- ── Forum Comments ────────────────────────────────────────
create table if not exists forum_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references forum_posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  flag_count  int  default 0,
  created_at  timestamptz default now()
);

create index if not exists forum_comments_post_id_idx on forum_comments(post_id);

alter table forum_comments enable row level security;
create policy "forum_comments_select" on forum_comments for select
  using (status = 'approved' or auth.uid() = user_id);
create policy "forum_comments_insert" on forum_comments for insert with check (auth.uid() = user_id);
create policy "forum_comments_update" on forum_comments for update using (auth.uid() = user_id);
create policy "forum_comments_delete" on forum_comments for delete using (auth.uid() = user_id);

-- ── Flags (user reports for fact-checking) ────────────────
create table if not exists flags (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references auth.users(id) on delete cascade,
  target_type   text not null check (target_type in ('review', 'forum_post', 'forum_comment')),
  target_id     uuid not null,
  reason        text not null,
  created_at    timestamptz default now(),
  unique (reporter_id, target_type, target_id)
);

alter table flags enable row level security;
create policy "flags_insert" on flags for insert with check (auth.uid() = reporter_id);
create policy "flags_select" on flags for select using (auth.uid() = reporter_id);

-- ── Seed Companies ────────────────────────────────────────
-- See seed_data.sql for full company + review seed data
insert into companies (name, slug, industry, description, website) values
  ('Amazon',     'amazon',     'E-Commerce & Technology',      'The world''s largest online retailer and cloud computing provider, operating Amazon.com, AWS, Whole Foods, and a global logistics network employing over 1.5 million people.',                                                                    'https://amazon.com'),
  ('ExxonMobil', 'exxonmobil', 'Oil & Gas',                    'One of the world''s largest publicly traded oil and gas companies, engaged in exploration, production, refining, and marketing of petroleum products across more than 60 countries.',                                                             'https://exxonmobil.com'),
  ('Apple',      'apple',      'Consumer Electronics',         'A multinational technology company that designs and manufactures consumer electronics, software, and online services including the iPhone, Mac, iPad, and the App Store ecosystem.',                                                               'https://apple.com'),
  ('Nestlé',     'nestle',     'Food & Beverage',              'The world''s largest food and beverage company by revenue, producing brands across coffee, dairy, nutrition, bottled water, confectionery, and pet care in over 186 countries.',                                                                  'https://nestle.com'),
  ('Tesla',      'tesla',      'Electric Vehicles',            'An American electric vehicle and clean energy company designing, manufacturing, and selling electric cars, battery energy storage, solar panels, and related products worldwide.',                                                                 'https://tesla.com'),
  ('Walmart',    'walmart',    'Retail',                       'The world''s largest retailer and private employer, operating over 10,500 stores and clubs across 19 countries under dozens of banners including Sam''s Club and Asda.',                                                                          'https://walmart.com'),
  ('Meta',       'meta',       'Social Media & Technology',    'The parent company of Facebook, Instagram, WhatsApp, and Threads, operating the world''s largest social networking platforms with over 3.2 billion daily active users.',                                                                         'https://meta.com'),
  ('Coca-Cola',  'coca-cola',  'Food & Beverage',              'The world''s largest beverage company, producing and distributing over 500 brands of non-alcoholic beverages including soft drinks, water, juice, and sports drinks in more than 200 countries.',                                                 'https://coca-colacompany.com'),
  ('Chevron',    'chevron',    'Oil & Gas',                    'One of the world''s largest integrated energy companies, engaged in oil and gas exploration, production, refining, and transportation across approximately 180 countries.',                                                                        'https://chevron.com'),
  ('Nike',       'nike',       'Apparel & Footwear',           'The world''s largest athletic footwear and apparel company, designing, developing, and marketing sportswear under the Nike, Jordan, and Converse brands in more than 170 countries.',                                                             'https://nike.com')
on conflict (slug) do nothing;
