-- ── Connections Web Migration ───────────────────────────────────────────────
-- Run this in Supabase SQL Editor after the main schema + politicians schema.
-- Adds CEO/leadership data to companies and industry tags to politicians.

-- ── Company Leadership ────────────────────────────────────────────────────────
alter table companies add column if not exists ceo_name text;
alter table companies add column if not exists ceo_title text default 'CEO';
alter table companies add column if not exists headquarters text;
alter table companies add column if not exists employee_count text;
alter table companies add column if not exists annual_revenue text;
alter table companies add column if not exists lobbying_spend text;

-- ── Industry Impact Tags (for explaining WHY connections matter) ──────────────
-- Reusable lookup: which industries does a politician's committee affect?
create table if not exists industry_policy_map (
  id              uuid primary key default gen_random_uuid(),
  committee_name  text not null,
  affected_industry text not null,
  policy_area     text not null,
  description     text,
  unique (committee_name, affected_industry)
);

alter table industry_policy_map enable row level security;
create policy "industry_policy_map_select" on industry_policy_map
  for select using (true);

-- Seed some key committee→industry mappings
insert into industry_policy_map (committee_name, affected_industry, policy_area, description) values
  ('Senate Committee on Commerce, Science, and Transportation', 'Technology', 'Tech regulation', 'Oversees Big Tech regulation, Section 230, data privacy, and AI policy'),
  ('Senate Committee on Commerce, Science, and Transportation', 'Telecommunications', 'Telecom policy', 'Regulates broadband, net neutrality, and spectrum allocation'),
  ('Senate Committee on Energy and Natural Resources', 'Oil & Gas', 'Energy policy', 'Controls oil leasing, drilling permits, and energy subsidies'),
  ('Senate Committee on Energy and Natural Resources', 'Electric Vehicles', 'EV incentives', 'Shapes EV tax credits, charging infrastructure, and clean energy standards'),
  ('Senate Committee on Finance', 'Banking & Finance', 'Tax & finance policy', 'Writes tax code affecting banks, investment firms, and financial markets'),
  ('Senate Committee on Finance', 'Pharmaceuticals', 'Drug pricing', 'Controls Medicare drug pricing, pharmaceutical tax treatment'),
  ('Senate Committee on Banking, Housing, and Urban Affairs', 'Banking & Finance', 'Banking regulation', 'Oversees bank regulation, consumer protection, and housing policy'),
  ('House Committee on Energy and Commerce', 'Pharmaceuticals', 'Drug regulation', 'Oversees FDA drug approvals, pricing transparency, and healthcare policy'),
  ('House Committee on Energy and Commerce', 'Technology', 'Tech oversight', 'Regulates data privacy, AI safety, and Big Tech antitrust'),
  ('House Committee on Energy and Commerce', 'Telecommunications', 'FCC oversight', 'Oversees FCC, broadband deployment, and spectrum policy'),
  ('House Committee on Financial Services', 'Banking & Finance', 'Financial regulation', 'Oversees Wall Street regulation, consumer lending, and fintech policy'),
  ('Senate Committee on Environment and Public Works', 'Oil & Gas', 'Environmental regulation', 'Controls EPA oversight, emission standards, and pollution enforcement'),
  ('Senate Committee on Health, Education, Labor, and Pensions', 'Healthcare & Consumer Goods', 'Healthcare policy', 'Shapes drug safety, workplace safety, and health insurance policy'),
  ('House Committee on Agriculture', 'Food & Beverage', 'Farm & food policy', 'Controls farm subsidies, food safety regulation, and nutrition programs'),
  ('Senate Committee on Agriculture, Nutrition, and Forestry', 'Food & Beverage', 'Agricultural policy', 'Writes farm bills, regulates commodity markets, and oversees USDA'),
  ('Senate Committee on Armed Services', 'Aerospace & Defense', 'Defense spending', 'Controls military procurement, defense contracts, and weapons programs'),
  ('House Committee on Armed Services', 'Aerospace & Defense', 'Defense contracts', 'Oversees Pentagon budget, defense procurement, and military readiness')
on conflict do nothing;

-- ── Seed CEO data for existing companies ──────────────────────────────────────
update companies set ceo_name = 'Andy Jassy',          ceo_title = 'CEO',       headquarters = 'Seattle, WA',       lobbying_spend = '$21.4M (2023)' where slug = 'amazon';
update companies set ceo_name = 'Darren Woods',        ceo_title = 'CEO',       headquarters = 'Spring, TX',        lobbying_spend = '$12.7M (2023)' where slug = 'exxonmobil';
update companies set ceo_name = 'Tim Cook',            ceo_title = 'CEO',       headquarters = 'Cupertino, CA',     lobbying_spend = '$9.8M (2023)'  where slug = 'apple';
update companies set ceo_name = 'Mark Schneider',      ceo_title = 'CEO',       headquarters = 'Vevey, Switzerland' where slug = 'nestle';
update companies set ceo_name = 'Elon Musk',           ceo_title = 'CEO',       headquarters = 'Austin, TX',        lobbying_spend = '$2.3M (2023)'  where slug = 'tesla';
update companies set ceo_name = 'Doug McMillon',       ceo_title = 'CEO',       headquarters = 'Bentonville, AR',   lobbying_spend = '$8.1M (2023)'  where slug = 'walmart';
update companies set ceo_name = 'Mark Zuckerberg',     ceo_title = 'CEO',       headquarters = 'Menlo Park, CA',    lobbying_spend = '$18.7M (2023)' where slug = 'meta';
update companies set ceo_name = 'James Quincey',       ceo_title = 'CEO',       headquarters = 'Atlanta, GA',       lobbying_spend = '$7.2M (2023)'  where slug = 'coca-cola';
update companies set ceo_name = 'Mike Wirth',          ceo_title = 'CEO',       headquarters = 'San Ramon, CA',     lobbying_spend = '$11.3M (2023)' where slug = 'chevron';
update companies set ceo_name = 'John Donahoe',        ceo_title = 'CEO',       headquarters = 'Beaverton, OR',     lobbying_spend = '$2.1M (2023)'  where slug = 'nike';
update companies set ceo_name = 'Sundar Pichai',       ceo_title = 'CEO',       headquarters = 'Mountain View, CA', lobbying_spend = '$13.4M (2023)' where slug = 'alphabet';
update companies set ceo_name = 'Satya Nadella',       ceo_title = 'CEO',       headquarters = 'Redmond, WA',       lobbying_spend = '$10.6M (2023)' where slug = 'microsoft';
update companies set ceo_name = 'Jamie Dimon',         ceo_title = 'CEO',       headquarters = 'New York, NY',      lobbying_spend = '$10.9M (2023)' where slug = 'jpmorgan-chase';
update companies set ceo_name = 'Joaquin Duato',       ceo_title = 'CEO',       headquarters = 'New Brunswick, NJ', lobbying_spend = '$8.4M (2023)'  where slug = 'johnson-johnson';
update companies set ceo_name = 'Jon Moeller',         ceo_title = 'CEO',       headquarters = 'Cincinnati, OH',    lobbying_spend = '$5.8M (2023)'  where slug = 'procter-gamble';
update companies set ceo_name = 'Brian Moynihan',      ceo_title = 'CEO',       headquarters = 'Charlotte, NC',     lobbying_spend = '$5.5M (2023)'  where slug = 'bank-of-america';
update companies set ceo_name = 'Charles Scharf',      ceo_title = 'CEO',       headquarters = 'San Francisco, CA', lobbying_spend = '$4.1M (2023)'  where slug = 'wells-fargo';
update companies set ceo_name = 'Albert Bourla',       ceo_title = 'CEO',       headquarters = 'New York, NY',      lobbying_spend = '$13.2M (2023)' where slug = 'pfizer';
update companies set ceo_name = 'Brian Roberts',       ceo_title = 'CEO',       headquarters = 'Philadelphia, PA',  lobbying_spend = '$14.3M (2023)' where slug = 'comcast';
update companies set ceo_name = 'John Stankey',        ceo_title = 'CEO',       headquarters = 'Dallas, TX',        lobbying_spend = '$12.2M (2023)' where slug = 'att';
update companies set ceo_name = 'Hans Vestberg',       ceo_title = 'CEO',       headquarters = 'New York, NY',      lobbying_spend = '$11.4M (2023)' where slug = 'verizon';
update companies set ceo_name = 'Ted Decker',          ceo_title = 'CEO',       headquarters = 'Atlanta, GA',       lobbying_spend = '$3.6M (2023)'  where slug = 'home-depot';
update companies set ceo_name = 'Karen Lynch',         ceo_title = 'CEO',       headquarters = 'Woonsocket, RI',    lobbying_spend = '$8.7M (2023)'  where slug = 'cvs-health';
update companies set ceo_name = 'Andrew Witty',        ceo_title = 'CEO',       headquarters = 'Minnetonka, MN',    lobbying_spend = '$8.4M (2023)'  where slug = 'unitedhealth';
update companies set ceo_name = 'Kelly Ortberg',       ceo_title = 'CEO',       headquarters = 'Arlington, VA',     lobbying_spend = '$12.8M (2023)' where slug = 'boeing';
update companies set ceo_name = 'Jim Farley',          ceo_title = 'CEO',       headquarters = 'Dearborn, MI',      lobbying_spend = '$7.8M (2023)'  where slug = 'ford';
update companies set ceo_name = 'Mary Barra',          ceo_title = 'CEO',       headquarters = 'Detroit, MI',       lobbying_spend = '$8.2M (2023)'  where slug = 'general-motors';
update companies set ceo_name = 'Brian Cornell',       ceo_title = 'CEO',       headquarters = 'Minneapolis, MN',   lobbying_spend = '$2.8M (2023)'  where slug = 'target';
update companies set ceo_name = 'Ron Vachris',         ceo_title = 'CEO',       headquarters = 'Issaquah, WA',      lobbying_spend = '$0.7M (2023)'  where slug = 'costco';
update companies set ceo_name = 'Laxman Narasimhan',   ceo_title = 'CEO',       headquarters = 'Seattle, WA',       lobbying_spend = '$3.1M (2023)'  where slug = 'starbucks';
update companies set ceo_name = 'Chris Kempczinski',   ceo_title = 'CEO',       headquarters = 'Chicago, IL',       lobbying_spend = '$2.5M (2023)'  where slug = 'mcdonalds';
update companies set ceo_name = 'Bob Iger',            ceo_title = 'CEO',       headquarters = 'Burbank, CA',       lobbying_spend = '$4.7M (2023)'  where slug = 'disney';
update companies set ceo_name = 'Mike Roman',          ceo_title = 'CEO',       headquarters = 'St. Paul, MN',      lobbying_spend = '$4.9M (2023)'  where slug = '3m';
update companies set ceo_name = 'Jacek Olczak',        ceo_title = 'CEO',       headquarters = 'Stamford, CT',      lobbying_spend = '$5.2M (2023)'  where slug = 'philip-morris';
update companies set ceo_name = 'Donnie King',         ceo_title = 'CEO',       headquarters = 'Springdale, AR',    lobbying_spend = '$2.4M (2023)'  where slug = 'tyson-foods';
update companies set ceo_name = 'Bill Anderson',       ceo_title = 'CEO',       headquarters = 'Leverkusen, Germany', lobbying_spend = '$9.3M (2023)' where slug = 'bayer';
update companies set ceo_name = 'David Solomon',       ceo_title = 'CEO',       headquarters = 'New York, NY',      lobbying_spend = '$5.1M (2023)'  where slug = 'goldman-sachs';
update companies set ceo_name = 'Jane Fraser',         ceo_title = 'CEO',       headquarters = 'New York, NY',      lobbying_spend = '$5.9M (2023)'  where slug = 'citigroup';
update companies set ceo_name = 'Wael Sawan',          ceo_title = 'CEO',       headquarters = 'London, UK',        lobbying_spend = '$10.1M (2023)' where slug = 'shell';
update companies set ceo_name = 'Murray Auchincloss',  ceo_title = 'CEO',       headquarters = 'London, UK',        lobbying_spend = '$7.4M (2023)'  where slug = 'bp';
