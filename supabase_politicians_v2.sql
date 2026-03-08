-- ── Politicians Schema V2: Deep Intelligence Tables ───────────────────────────
-- Run this in Supabase SQL Editor AFTER supabase_politicians.sql
-- Adds structured tables for education, career, finances, family, net worth
-- and new columns on the politicians table.

-- ── New columns on politicians ────────────────────────────────────────────────
alter table politicians
  add column if not exists date_of_birth date,
  add column if not exists place_of_birth text,
  add column if not exists religion text,
  add column if not exists military_service boolean default false;


-- ── Expand promise categories for executive branch ────────────────────────────
-- Drop and re-create the CHECK constraint to add executive_order, foreign_policy, trade
alter table political_promises drop constraint if exists political_promises_category_check;
alter table political_promises add constraint political_promises_category_check
  check (category in (
    'environment', 'healthcare', 'economy', 'taxes',
    'immigration', 'defense', 'education', 'criminal_justice',
    'campaign_finance', 'corporate_regulation',
    'executive_order', 'foreign_policy', 'trade',
    'other'
  ));


-- ── Politician Education ──────────────────────────────────────────────────────
create table if not exists politician_education (
  id              uuid primary key default gen_random_uuid(),
  politician_id   uuid not null references politicians(id) on delete cascade,
  institution     text not null,
  degree          text,           -- "B.S.", "J.D.", "M.B.A.", "High School Diploma", null for K-12
  field_of_study  text,           -- "Economics", "Political Science"
  start_year      int,
  end_year        int,
  honors          text,           -- "magna cum laude", "valedictorian"
  notes           text,           -- additional context
  source_url      text,
  created_at      timestamptz default now()
);

create index if not exists education_politician_idx on politician_education(politician_id);
create index if not exists education_institution_idx on politician_education(institution);

alter table politician_education enable row level security;
create policy "education_select" on politician_education for select using (true);


-- ── Politician Career History ─────────────────────────────────────────────────
create table if not exists politician_career_history (
  id              uuid primary key default gen_random_uuid(),
  politician_id   uuid not null references politicians(id) on delete cascade,
  position_title  text not null,
  organization    text not null,
  sector          text check (sector in (
                    'public', 'private', 'military', 'academic', 'nonprofit', 'legal', 'media'
                  )),
  start_date      date,
  end_date        date,
  is_current      boolean default false,
  description     text,
  source_url      text,
  created_at      timestamptz default now()
);

create index if not exists career_politician_idx on politician_career_history(politician_id);
create index if not exists career_sector_idx on politician_career_history(sector);
create index if not exists career_org_idx on politician_career_history(organization);

alter table politician_career_history enable row level security;
create policy "career_select" on politician_career_history for select using (true);


-- ── Politician Financial Disclosures ──────────────────────────────────────────
create table if not exists politician_financial_disclosures (
  id                  uuid primary key default gen_random_uuid(),
  politician_id       uuid not null references politicians(id) on delete cascade,
  disclosure_year     int not null,
  filing_type         text check (filing_type in (
                        'annual', 'periodic', 'candidate', 'amendment', 'termination'
                      )),
  asset_description   text,
  asset_value_min     bigint,           -- in cents
  asset_value_max     bigint,           -- in cents
  income_type         text,             -- "salary", "dividends", "capital_gains", "rental"
  income_amount_min   bigint,
  income_amount_max   bigint,
  transaction_type    text check (transaction_type in (
                        'purchase', 'sale', 'exchange', 'partial_sale', null
                      )),
  transaction_date    date,
  source_url          text,
  source_type         text check (source_type in (
                        'stock_act', 'senate_disclosure', 'house_disclosure',
                        'fec_filing', 'sec_filing', 'news_report', 'other'
                      )),
  notes               text,
  created_at          timestamptz default now()
);

create index if not exists financial_politician_idx on politician_financial_disclosures(politician_id);
create index if not exists financial_year_idx on politician_financial_disclosures(disclosure_year desc);

alter table politician_financial_disclosures enable row level security;
create policy "financial_select" on politician_financial_disclosures for select using (true);


-- ── Politician Family Connections ─────────────────────────────────────────────
create table if not exists politician_family_connections (
  id                  uuid primary key default gen_random_uuid(),
  politician_id       uuid not null references politicians(id) on delete cascade,
  relation_type       text not null check (relation_type in (
                        'spouse', 'child', 'sibling', 'parent', 'in-law', 'other'
                      )),
  relation_name       text not null,
  occupation          text,
  employer            text,
  relevant_holdings   text,             -- notable stocks, businesses, board seats
  notes               text,
  source_url          text,
  created_at          timestamptz default now()
);

create index if not exists family_politician_idx on politician_family_connections(politician_id);

alter table politician_family_connections enable row level security;
create policy "family_select" on politician_family_connections for select using (true);


-- ── Politician Net Worth ──────────────────────────────────────────────────────
create table if not exists politician_net_worth (
  id              uuid primary key default gen_random_uuid(),
  politician_id   uuid not null references politicians(id) on delete cascade,
  year            int not null,
  estimated_min   bigint,               -- in cents
  estimated_max   bigint,               -- in cents
  source          text,                 -- "OpenSecrets", "Forbes", "Center for Responsive Politics"
  source_url      text,
  created_at      timestamptz default now(),
  unique (politician_id, year, source)
);

create index if not exists networth_politician_idx on politician_net_worth(politician_id);
create index if not exists networth_year_idx on politician_net_worth(year desc);

alter table politician_net_worth enable row level security;
create policy "networth_select" on politician_net_worth for select using (true);
