-- ============================================================
-- Data Expansion Migration
-- Run this in Supabase SQL Editor after all previous migrations.
-- Adds: company_scandals, ceo_profiles, company_subsidiaries,
--        company_lobbying, company_legal_actions, company_esg_data
-- Also adds stock_ticker, is_public, founded_year, market_cap to companies.
-- ============================================================

-- ── Column Additions to Companies ────────────────────────────────────────────
alter table companies add column if not exists stock_ticker text;
alter table companies add column if not exists is_public boolean default true;
alter table companies add column if not exists founded_year int;
alter table companies add column if not exists market_cap text;

-- ── Company Scandals ─────────────────────────────────────────────────────────
create table if not exists company_scandals (
  id                        uuid primary key default gen_random_uuid(),
  company_id                uuid not null references companies(id) on delete cascade,
  title                     text not null,
  description               text not null,
  scandal_type              text check (scandal_type in (
    'environmental', 'labor', 'fraud', 'safety', 'privacy',
    'antitrust', 'corruption', 'discrimination', 'regulatory', 'other'
  )),
  severity                  text check (severity in ('critical', 'major', 'moderate', 'minor')),
  date_started              date,
  date_resolved             date,
  is_ongoing                boolean default false,
  fine_amount_cents          bigint,
  fine_amount_display        text,
  settlement_amount_cents    bigint,
  settlement_amount_display  text,
  agency_involved            text,
  outcome                    text,
  source_urls                text[] default '{}',
  created_at                 timestamptz default now()
);

create index if not exists company_scandals_company_idx on company_scandals(company_id);
create index if not exists company_scandals_type_idx on company_scandals(scandal_type);
create index if not exists company_scandals_severity_idx on company_scandals(severity);

alter table company_scandals enable row level security;
create policy "company_scandals_select" on company_scandals for select using (true);
create policy "company_scandals_insert" on company_scandals
  for insert with check (auth.uid() is not null);

-- ── CEO Profiles ─────────────────────────────────────────────────────────────
create table if not exists ceo_profiles (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  full_name           text not null,
  slug                text unique,
  title               text default 'CEO',
  photo_url           text,
  start_date          date,
  end_date            date,
  is_current          boolean default true,
  total_compensation  text,
  prior_companies     jsonb default '[]',
  education           jsonb default '[]',
  controversies       text,
  net_worth_estimate  text,
  source_url          text,
  created_at          timestamptz default now()
);

create index if not exists ceo_profiles_company_idx on ceo_profiles(company_id);
create index if not exists ceo_profiles_slug_idx on ceo_profiles(slug);

alter table ceo_profiles enable row level security;
create policy "ceo_profiles_select" on ceo_profiles for select using (true);
create policy "ceo_profiles_insert" on ceo_profiles
  for insert with check (auth.uid() is not null);

-- ── Company Subsidiaries ─────────────────────────────────────────────────────
create table if not exists company_subsidiaries (
  id                uuid primary key default gen_random_uuid(),
  parent_id         uuid not null references companies(id) on delete cascade,
  subsidiary_id     uuid references companies(id) on delete set null,
  subsidiary_name   text not null,
  relationship      text check (relationship in (
    'subsidiary', 'division', 'brand', 'joint_venture', 'acquisition'
  )),
  acquired_date     date,
  notes             text,
  source_url        text,
  created_at        timestamptz default now()
);

create index if not exists company_subsidiaries_parent_idx on company_subsidiaries(parent_id);

alter table company_subsidiaries enable row level security;
create policy "company_subsidiaries_select" on company_subsidiaries for select using (true);
create policy "company_subsidiaries_insert" on company_subsidiaries
  for insert with check (auth.uid() is not null);

-- ── Company Lobbying ─────────────────────────────────────────────────────────
create table if not exists company_lobbying (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references companies(id) on delete cascade,
  year                  int not null,
  total_spend_cents     bigint,
  total_spend_display   text,
  lobbying_firm         text,
  issue_area            text,
  bill_numbers          text[] default '{}',
  source_url            text default 'https://www.opensecrets.org',
  created_at            timestamptz default now(),
  unique (company_id, year, lobbying_firm, issue_area)
);

create index if not exists company_lobbying_company_idx on company_lobbying(company_id);
create index if not exists company_lobbying_year_idx on company_lobbying(year);

alter table company_lobbying enable row level security;
create policy "company_lobbying_select" on company_lobbying for select using (true);
create policy "company_lobbying_insert" on company_lobbying
  for insert with check (auth.uid() is not null);

-- ── Company Legal Actions ────────────────────────────────────────────────────
create table if not exists company_legal_actions (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  case_name           text not null,
  case_type           text check (case_type in (
    'lawsuit', 'class_action', 'regulatory_fine', 'consent_decree',
    'investigation', 'settlement', 'criminal_plea'
  )),
  filed_date          date,
  resolved_date       date,
  is_ongoing          boolean default false,
  agency_or_plaintiff text,
  amount_cents        bigint,
  amount_display      text,
  description         text,
  outcome             text,
  source_url          text,
  created_at          timestamptz default now()
);

create index if not exists company_legal_company_idx on company_legal_actions(company_id);
create index if not exists company_legal_type_idx on company_legal_actions(case_type);

alter table company_legal_actions enable row level security;
create policy "company_legal_select" on company_legal_actions for select using (true);
create policy "company_legal_insert" on company_legal_actions
  for insert with check (auth.uid() is not null);

-- ── Company ESG Data ─────────────────────────────────────────────────────────
create table if not exists company_esg_data (
  id                       uuid primary key default gen_random_uuid(),
  company_id               uuid not null references companies(id) on delete cascade,
  year                     int not null,
  co2_emissions_mt         numeric,
  water_usage_gallons      bigint,
  waste_generated_mt       numeric,
  renewable_energy_pct     numeric,
  environmental_violations int,
  esg_rating               text,
  esg_source               text,
  notes                    text,
  source_url               text,
  created_at               timestamptz default now(),
  unique (company_id, year, esg_source)
);

create index if not exists company_esg_company_idx on company_esg_data(company_id);
create index if not exists company_esg_year_idx on company_esg_data(year);

alter table company_esg_data enable row level security;
create policy "company_esg_select" on company_esg_data for select using (true);
create policy "company_esg_insert" on company_esg_data
  for insert with check (auth.uid() is not null);

-- ── Additional Seed Users for Multi-Angle Reviews ────────────────────────────
-- These bypass the unique(company_id, user_id) constraint on reviews.
do $$
begin
  -- Environmental Reporter
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  values ('00000000-0000-0000-0000-000000000091', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'seed-env@corpwatch.internal', '',
    now(), now(), now(), '{"provider":"email","providers":["email"]}',
    '{"display_name":"Environmental Reporter"}', false)
  on conflict (id) do nothing;

  -- Labor & Workforce Analyst
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  values ('00000000-0000-0000-0000-000000000092', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'seed-labor@corpwatch.internal', '',
    now(), now(), now(), '{"provider":"email","providers":["email"]}',
    '{"display_name":"Labor & Workforce Analyst"}', false)
  on conflict (id) do nothing;

  -- Legal & Regulatory Analyst
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  values ('00000000-0000-0000-0000-000000000093', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'seed-legal@corpwatch.internal', '',
    now(), now(), now(), '{"provider":"email","providers":["email"]}',
    '{"display_name":"Legal & Regulatory Analyst"}', false)
  on conflict (id) do nothing;

  -- Consumer Advocate
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  values ('00000000-0000-0000-0000-000000000094', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'seed-consumer@corpwatch.internal', '',
    now(), now(), now(), '{"provider":"email","providers":["email"]}',
    '{"display_name":"Consumer Advocate"}', false)
  on conflict (id) do nothing;

  -- Political/Lobbying Analyst
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
  values ('00000000-0000-0000-0000-000000000095', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'seed-lobby@corpwatch.internal', '',
    now(), now(), now(), '{"provider":"email","providers":["email"]}',
    '{"display_name":"Political & Lobbying Analyst"}', false)
  on conflict (id) do nothing;
end;
$$;
