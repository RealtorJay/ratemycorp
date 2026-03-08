-- ── Agentic Workflows Migration ────────────────────────────────────────────
-- Run this in Supabase SQL Editor after the main schema + politicians schema.

-- ── Workflow Runs (observability) ─────────────────────────────────────────────
create table if not exists workflow_runs (
  id                    uuid primary key default gen_random_uuid(),
  agent_name            text not null,
  status                text not null default 'running'
                          check (status in ('running', 'completed', 'failed', 'partial')),
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,
  entities_processed    int default 0,
  entities_updated      int default 0,
  entities_failed       int default 0,
  error_log             jsonb,
  ai_tokens_used        jsonb,
  cost_estimate_cents   int default 0,
  metadata              jsonb
);

create index if not exists workflow_runs_agent_idx
  on workflow_runs(agent_name, started_at desc);

alter table workflow_runs enable row level security;
create policy "workflow_runs_select" on workflow_runs
  for select using (true);


-- ── Company News (classified articles) ────────────────────────────────────────
create table if not exists company_news (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  title           text not null,
  url             text not null unique,
  source          text,
  published_at    timestamptz,
  category        text check (category in (
    'environmental', 'labor', 'consumer', 'legal', 'financial',
    'regulatory', 'scandal', 'positive', 'neutral', 'other'
  )),
  sentiment       numeric(3,2),
  relevance_score numeric(3,2),
  ai_summary      text,
  raw_snippet     text,
  created_at      timestamptz default now()
);

create index if not exists company_news_company_idx
  on company_news(company_id, published_at desc);
create index if not exists company_news_category_idx
  on company_news(category);

alter table company_news enable row level security;
create policy "company_news_select" on company_news
  for select using (true);


-- ── Stock Snapshots (daily market data) ───────────────────────────────────────
create table if not exists stock_snapshots (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references companies(id) on delete cascade,
  ticker          text not null,
  snapshot_date   date not null,
  open_price      numeric(12,4),
  close_price     numeric(12,4),
  high_price      numeric(12,4),
  low_price       numeric(12,4),
  volume          bigint,
  market_cap      bigint,
  created_at      timestamptz default now(),
  unique (company_id, snapshot_date)
);

create index if not exists stock_snapshots_company_date_idx
  on stock_snapshots(company_id, snapshot_date desc);

alter table stock_snapshots enable row level security;
create policy "stock_snapshots_select" on stock_snapshots
  for select using (true);


-- ── Idempotency constraint for votes ──────────────────────────────────────────
-- Allows the Congress agent to safely upsert votes without duplicates.
-- Using a partial unique index to handle NULLs in roll_call_number gracefully.
create unique index if not exists votes_idempotent_idx
  on votes(politician_id, vote_date, roll_call_number)
  where roll_call_number is not null;

-- For votes without roll_call_number, use external_vote_id
create unique index if not exists votes_external_id_idx
  on votes(external_vote_id)
  where external_vote_id is not null;
