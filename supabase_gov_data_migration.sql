-- ── Government Data Cache Migration ─────────────────────────────────────────
-- Run this in Supabase SQL Editor after the agents migration.
-- Caches government API data to reduce external API calls.

-- ── CFPB Complaint Snapshots ────────────────────────────────────────────────
create table if not exists company_cfpb_complaints (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  complaint_id    text unique,
  date_received   date,
  product         text,
  sub_product     text,
  issue           text,
  sub_issue       text,
  narrative       text,
  company_response text,
  timely          boolean,
  consumer_disputed boolean,
  state           text,
  created_at      timestamptz default now()
);

create index if not exists cfpb_company_idx
  on company_cfpb_complaints(company_id, date_received desc);

alter table company_cfpb_complaints enable row level security;
create policy "cfpb_select" on company_cfpb_complaints
  for select using (true);

-- ── FDA Recall Cache ────────────────────────────────────────────────────────
create table if not exists company_fda_recalls (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references companies(id) on delete cascade,
  recall_number       text unique,
  recall_type         text check (recall_type in ('drug', 'food', 'device')),
  classification      text,
  status              text,
  reason              text,
  product_description text,
  recall_date         date,
  city                text,
  state               text,
  voluntary_mandated  text,
  distribution        text,
  created_at          timestamptz default now()
);

create index if not exists fda_company_idx
  on company_fda_recalls(company_id, recall_date desc);

alter table company_fda_recalls enable row level security;
create policy "fda_select" on company_fda_recalls
  for select using (true);

-- ── CPSC Recall Cache ───────────────────────────────────────────────────────
create table if not exists company_cpsc_recalls (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  recall_id       text unique,
  recall_number   text,
  recall_date     date,
  title           text,
  description     text,
  url             text,
  hazards         text[],
  remedies        text[],
  units_affected  text,
  created_at      timestamptz default now()
);

create index if not exists cpsc_company_idx
  on company_cpsc_recalls(company_id, recall_date desc);

alter table company_cpsc_recalls enable row level security;
create policy "cpsc_select" on company_cpsc_recalls
  for select using (true);

-- ── Federal Contract Cache ──────────────────────────────────────────────────
create table if not exists company_federal_awards (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  award_id        text unique,
  recipient_name  text,
  award_amount    numeric(16,2),
  total_outlays   numeric(16,2),
  description     text,
  start_date      date,
  end_date        date,
  agency          text,
  sub_agency      text,
  award_type      text,
  created_at      timestamptz default now()
);

create index if not exists fed_awards_company_idx
  on company_federal_awards(company_id, award_amount desc);

alter table company_federal_awards enable row level security;
create policy "fed_awards_select" on company_federal_awards
  for select using (true);

-- ── SEC Filing Cache ────────────────────────────────────────────────────────
create table if not exists company_sec_filings (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  filing_id       text unique,
  form_type       text,
  entity_name     text,
  file_date       date,
  file_url        text,
  description     text,
  created_at      timestamptz default now()
);

create index if not exists sec_company_idx
  on company_sec_filings(company_id, file_date desc);

alter table company_sec_filings enable row level security;
create policy "sec_select" on company_sec_filings
  for select using (true);

-- ── Government Data Summary (denormalized per company) ──────────────────────
-- This table stores aggregate counts for quick display in company cards/lists.
create table if not exists company_gov_summary (
  company_id         uuid primary key references companies(id) on delete cascade,
  sec_filing_count   int default 0,
  cfpb_complaint_count int default 0,
  fda_recall_count   int default 0,
  cpsc_recall_count  int default 0,
  federal_award_count int default 0,
  total_federal_spend numeric(16,2) default 0,
  last_updated       timestamptz default now()
);

alter table company_gov_summary enable row level security;
create policy "gov_summary_select" on company_gov_summary
  for select using (true);
