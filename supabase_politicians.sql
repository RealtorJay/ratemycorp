-- ── Politicians Schema ────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor after the main supabase_schema.sql

-- ── Politicians ──────────────────────────────────────────────────────────────
create table if not exists politicians (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  full_name             text not null,
  photo_url             text,
  party                 text,   -- Democrat, Republican, Independent, etc.
  chamber               text check (chamber in (
                          'senate', 'house', 'governor',
                          'state_senate', 'state_house', 'executive', 'other'
                        )),
  state                 text,   -- 2-letter: "TX", "CA"
  district              text,
  title                 text,   -- "Senator", "Representative", "Governor"
  current_office        text,   -- "U.S. Senator, Texas"
  in_office             boolean default true,
  term_start            date,
  term_end              date,
  bioguide_id           text unique,    -- Congress.gov identifier
  fec_candidate_id      text,
  official_website      text,
  twitter_handle        text,
  bio                   text,
  -- Denormalized scores (updated by triggers)
  accountability_score  numeric(5,1) default 0,
  promise_kept_count    int default 0,
  promise_broken_count  int default 0,
  promise_total_count   int default 0,
  connection_count      int default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists politicians_slug_idx     on politicians(slug);
create index if not exists politicians_state_idx    on politicians(state);
create index if not exists politicians_party_idx    on politicians(party);
create index if not exists politicians_chamber_idx  on politicians(chamber);
create index if not exists politicians_score_idx    on politicians(accountability_score desc);

alter table politicians enable row level security;
create policy "politicians_select" on politicians for select using (true);


-- ── Political Promises ────────────────────────────────────────────────────────
create table if not exists political_promises (
  id              uuid primary key default gen_random_uuid(),
  politician_id   uuid not null references politicians(id) on delete cascade,
  category        text not null check (category in (
                    'environment', 'healthcare', 'economy', 'taxes',
                    'immigration', 'defense', 'education', 'criminal_justice',
                    'campaign_finance', 'corporate_regulation', 'other'
                  )),
  promise_text    text not null,
  source_url      text,
  source_type     text check (source_type in (
                    'campaign_speech', 'debate', 'interview', 'ad',
                    'tweet', 'press_release', 'party_platform', 'other'
                  )),
  made_date       date,
  status          text not null default 'pending' check (status in (
                    'pending', 'kept', 'broken', 'compromised', 'stalled', 'not_yet_due'
                  )),
  verdict_notes   text,
  verdict_source  text,
  verdict_date    date,
  submitted_by    uuid references auth.users(id) on delete set null,
  is_verified     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists promises_politician_idx on political_promises(politician_id);
create index if not exists promises_status_idx     on political_promises(status);
create index if not exists promises_category_idx   on political_promises(category);

alter table political_promises enable row level security;
create policy "promises_select" on political_promises for select using (true);
create policy "promises_insert" on political_promises for insert
  with check (auth.uid() = submitted_by);


-- ── Votes ─────────────────────────────────────────────────────────────────────
create table if not exists votes (
  id                uuid primary key default gen_random_uuid(),
  politician_id     uuid not null references politicians(id) on delete cascade,
  bill_id           text,
  bill_title        text,
  bill_number       text,
  congress_number   int,
  vote_date         date,
  chamber           text check (chamber in ('senate', 'house')),
  vote_type         text,
  position          text not null check (position in (
                      'yea', 'nay', 'abstain', 'not_voting', 'present'
                    )),
  bill_category     text,
  bill_description  text,
  roll_call_number  int,
  source_url        text,
  external_vote_id  text,
  created_at        timestamptz default now()
);

create index if not exists votes_politician_idx on votes(politician_id);
create index if not exists votes_date_idx       on votes(vote_date desc);
create index if not exists votes_category_idx   on votes(bill_category);

alter table votes enable row level security;
create policy "votes_select" on votes for select using (true);


-- ── Legislation ───────────────────────────────────────────────────────────────
create table if not exists legislation (
  id                uuid primary key default gen_random_uuid(),
  politician_id     uuid not null references politicians(id) on delete cascade,
  bill_number       text not null,
  bill_title        text not null,
  congress_number   int,
  introduced_date   date,
  last_action_date  date,
  status            text check (status in (
                      'introduced', 'committee', 'floor_vote',
                      'passed_chamber', 'passed_both', 'signed', 'vetoed', 'failed'
                    )),
  role              text check (role in ('sponsor', 'cosponsor')),
  category          text,
  summary           text,
  source_url        text,
  external_bill_id  text unique,
  created_at        timestamptz default now()
);

create index if not exists legislation_politician_idx on legislation(politician_id);
create index if not exists legislation_status_idx     on legislation(status);

alter table legislation enable row level security;
create policy "legislation_select" on legislation for select using (true);


-- ── Corporate Connections ─────────────────────────────────────────────────────
create table if not exists politician_company_connections (
  id                uuid primary key default gen_random_uuid(),
  politician_id     uuid not null references politicians(id) on delete cascade,
  company_id        uuid not null references companies(id) on delete cascade,
  connection_type   text not null check (connection_type in (
                      'campaign_donation', 'super_pac', 'lobbying_client',
                      'revolving_door_from', 'revolving_door_to',
                      'board_seat', 'stock_ownership', 'family_connection',
                      'bundler', 'industry_pac'
                    )),
  amount_cents      bigint,              -- store in cents
  amount_display    text,               -- pre-formatted: "$1,250,000"
  cycle             text,               -- "2022", "2024"
  date_start        date,
  date_end          date,
  description       text,
  source_url        text not null,
  source_type       text check (source_type in (
                      'fec_filing', 'opensecrets', 'sec_disclosure',
                      'lobbying_disclosure', 'news_report', 'stock_act', 'other'
                    )),
  is_verified       boolean default false,
  submitted_by      uuid references auth.users(id) on delete set null,
  created_at        timestamptz default now(),
  unique (politician_id, company_id, connection_type, source_url)
);

create index if not exists connections_politician_idx on politician_company_connections(politician_id);
create index if not exists connections_company_idx    on politician_company_connections(company_id);
create index if not exists connections_type_idx       on politician_company_connections(connection_type);
create index if not exists connections_amount_idx     on politician_company_connections(amount_cents desc nulls last);

alter table politician_company_connections enable row level security;
create policy "connections_select" on politician_company_connections for select using (true);
create policy "connections_insert" on politician_company_connections for insert
  with check (auth.uid() = submitted_by);


-- ── Committee Assignments ─────────────────────────────────────────────────────
create table if not exists committee_assignments (
  id              uuid primary key default gen_random_uuid(),
  politician_id   uuid not null references politicians(id) on delete cascade,
  committee_name  text not null,
  committee_code  text,
  role            text check (role in ('member', 'chair', 'ranking_member', 'subcommittee')),
  chamber         text check (chamber in ('senate', 'house')),
  congress_number int,
  is_current      boolean default true,
  source_url      text,
  created_at      timestamptz default now()
);

create index if not exists committees_politician_idx on committee_assignments(politician_id);
create index if not exists committees_current_idx    on committee_assignments(is_current);

alter table committee_assignments enable row level security;
create policy "committees_select" on committee_assignments for select using (true);


-- ── Accountability Score Trigger ──────────────────────────────────────────────
create or replace function update_politician_scores()
returns trigger language plpgsql as $$
declare pid uuid;
begin
  pid := coalesce(new.politician_id, old.politician_id);
  update politicians set
    promise_kept_count   = (select count(*) from political_promises
                            where politician_id = pid and status = 'kept'),
    promise_broken_count = (select count(*) from political_promises
                            where politician_id = pid and status = 'broken'),
    promise_total_count  = (select count(*) from political_promises
                            where politician_id = pid and status != 'pending'),
    accountability_score = case
      when (select count(*) from political_promises
            where politician_id = pid and status != 'pending') = 0 then 0
      else round(
        (
          (select count(*) from political_promises where politician_id = pid and status = 'kept') * 100.0 +
          (select count(*) from political_promises where politician_id = pid and status = 'compromised') * 50.0
        ) /
        nullif((select count(*) from political_promises
                where politician_id = pid and status != 'pending'), 0)
      , 1)
    end,
    updated_at = now()
  where id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists promises_score_trigger on political_promises;
create trigger promises_score_trigger
  after insert or update or delete on political_promises
  for each row execute procedure update_politician_scores();


create or replace function update_politician_connection_count()
returns trigger language plpgsql as $$
declare pid uuid;
begin
  pid := coalesce(new.politician_id, old.politician_id);
  update politicians set
    connection_count = (select count(*) from politician_company_connections
                        where politician_id = pid),
    updated_at = now()
  where id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists connections_count_trigger on politician_company_connections;
create trigger connections_count_trigger
  after insert or delete on politician_company_connections
  for each row execute procedure update_politician_connection_count();
