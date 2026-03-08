-- ============================================================
-- CorpWatch — Seed Data (Companies + Reviews)
-- Run AFTER supabase_schema.sql
-- Reviews inserted as a service-role bypass (no user_id check)
-- To insert reviews from the SQL editor you must temporarily
-- disable the RLS insert policy or use a seed user UUID.
-- ============================================================

-- ── Upsert Companies ──────────────────────────────────────
insert into companies (name, slug, industry, description, website) values
  ('Amazon',          'amazon',          'E-Commerce & Technology',    'The world''s largest online retailer and cloud computing provider, operating Amazon.com, AWS, Whole Foods, and a global logistics network employing over 1.5 million people.',                                                   'https://amazon.com'),
  ('ExxonMobil',      'exxonmobil',      'Oil & Gas',                  'One of the world''s largest publicly traded oil and gas companies, engaged in exploration, production, refining, and marketing of petroleum products across more than 60 countries.',                                            'https://exxonmobil.com'),
  ('Apple',           'apple',           'Consumer Electronics',       'A multinational technology company that designs and manufactures consumer electronics, software, and online services including the iPhone, Mac, iPad, and the App Store ecosystem.',                                              'https://apple.com'),
  ('Nestlé',          'nestle',          'Food & Beverage',            'The world''s largest food and beverage company by revenue, producing brands across coffee, dairy, nutrition, bottled water, confectionery, and pet care in over 186 countries.',                                               'https://nestle.com'),
  ('Tesla',           'tesla',           'Electric Vehicles',          'An American electric vehicle and clean energy company designing, manufacturing, and selling electric cars, battery energy storage, solar panels, and related products worldwide.',                                              'https://tesla.com'),
  ('Walmart',         'walmart',         'Retail',                     'The world''s largest retailer and private employer, operating over 10,500 stores and clubs across 19 countries under dozens of banners including Sam''s Club and Asda.',                                                       'https://walmart.com'),
  ('Meta',            'meta',            'Social Media & Technology',  'The parent company of Facebook, Instagram, WhatsApp, and Threads, operating the world''s largest social networking platforms with over 3.2 billion daily active users.',                                                      'https://meta.com'),
  ('Coca-Cola',       'coca-cola',       'Food & Beverage',            'The world''s largest beverage company, producing and distributing over 500 brands of non-alcoholic beverages including soft drinks, water, juice, and sports drinks in more than 200 countries.',                              'https://coca-colacompany.com'),
  ('Chevron',         'chevron',         'Oil & Gas',                  'One of the world''s largest integrated energy companies, engaged in oil and gas exploration, production, refining, and transportation across approximately 180 countries.',                                                    'https://chevron.com'),
  ('Nike',            'nike',            'Apparel & Footwear',         'The world''s largest athletic footwear and apparel company, designing, developing, and marketing sportswear under the Nike, Jordan, and Converse brands in more than 170 countries.',                                          'https://nike.com'),
  ('Alphabet',        'alphabet',        'Technology',                 'The parent company of Google, YouTube, Waymo, and DeepMind, operating the world''s most-used search engine, digital advertising network, and cloud computing platform.',                                                      'https://abc.xyz'),
  ('Microsoft',       'microsoft',       'Technology',                 'A multinational technology corporation producing software, cloud services, hardware, and AI products including Windows, Azure, Office 365, Xbox, and GitHub.',                                                                  'https://microsoft.com'),
  ('JPMorgan Chase',  'jpmorgan-chase',  'Banking & Finance',          'The largest U.S. bank by assets, providing investment banking, commercial banking, financial transaction processing, and asset management services globally.',                                                                  'https://jpmorganchase.com'),
  ('Johnson & Johnson', 'johnson-johnson', 'Healthcare & Consumer Goods', 'A multinational corporation that develops medical devices, pharmaceuticals, and consumer packaged goods including Tylenol, Band-Aid, Neutrogena, and Listerine.',                                                           'https://jnj.com'),
  ('Procter & Gamble', 'procter-gamble', 'Consumer Goods',            'One of the world''s largest consumer goods companies, producing household brands including Tide, Pampers, Gillette, Oral-B, Head & Shoulders, Crest, and Febreze.',                                                           'https://pg.com'),
  ('Bank of America', 'bank-of-america', 'Banking & Finance',          'The second-largest U.S. bank, serving approximately 68 million consumer and small business clients through retail banking, wealth management, and investment banking.',                                                        'https://bankofamerica.com'),
  ('Wells Fargo',     'wells-fargo',     'Banking & Finance',          'One of the largest U.S. banks by market capitalization, providing banking, investment, mortgage, and consumer and commercial finance products.',                                                                               'https://wellsfargo.com'),
  ('Pfizer',          'pfizer',          'Pharmaceuticals',            'One of the world''s largest pharmaceutical companies, developing and manufacturing prescription medicines, vaccines, and consumer healthcare products including Advil, Centrum, and Chapstick.',                                'https://pfizer.com'),
  ('Comcast',         'comcast',         'Telecommunications & Media', 'The largest U.S. cable TV and internet provider and parent company of NBCUniversal, Peacock, Sky, and Xfinity, serving approximately 32 million customer relationships.',                                                     'https://comcast.com'),
  ('AT&T',            'att',             'Telecommunications',         'One of the world''s largest telecommunications companies, providing mobile, broadband, TV (DirecTV), and business communications services across the U.S. and internationally.',                                               'https://att.com'),
  ('Verizon',         'verizon',         'Telecommunications',         'The largest U.S. wireless carrier by subscribers, providing mobile, broadband, and business communications services alongside media and advertising assets through Verizon Media.',                                            'https://verizon.com'),
  ('Home Depot',      'home-depot',      'Retail',                     'The world''s largest home improvement retailer, operating over 2,300 stores across North America and serving both DIY consumers and professional contractors.',                                                                'https://homedepot.com'),
  ('CVS Health',      'cvs-health',      'Healthcare & Retail',        'One of the largest healthcare companies in the U.S., operating CVS Pharmacy, MinuteClinic, Caremark pharmacy benefits management, and Aetna health insurance.',                                                               'https://cvshealth.com'),
  ('UnitedHealth',    'unitedhealth',    'Health Insurance',           'The largest U.S. health insurer by revenue, operating UnitedHealthcare insurance plans and Optum health services including pharmacy care, analytics, and physician networks.',                                                 'https://unitedhealthgroup.com'),
  ('Boeing',          'boeing',          'Aerospace & Defense',        'The world''s largest aerospace company, manufacturing commercial jetliners, military aircraft, and space systems, and serving as the second-largest defense contractor in the United States.',                                 'https://boeing.com'),
  ('Ford Motor',      'ford',            'Automotive',                 'One of the world''s largest automobile manufacturers, producing Ford and Lincoln vehicles across trucks, SUVs, electric vehicles, and commercial vehicles sold in over 100 countries.',                                        'https://ford.com'),
  ('General Motors',  'general-motors',  'Automotive',                 'One of the world''s largest automakers, selling vehicles under the Chevrolet, GMC, Buick, Cadillac, and BrightDrop brands, with a major push into electric vehicles.',                                                       'https://gm.com'),
  ('Target',          'target',          'Retail',                     'One of the largest U.S. discount retailers, operating nearly 2,000 stores across the country and selling apparel, electronics, food, and household essentials.',                                                              'https://target.com'),
  ('Costco',          'costco',          'Retail',                     'The third-largest retailer in the world, operating a chain of membership-only warehouse clubs selling bulk goods at competitive prices across 14 countries.',                                                                  'https://costco.com'),
  ('Starbucks',       'starbucks',       'Food & Beverage',            'The world''s largest coffeehouse chain, operating over 36,000 stores in 84 countries, selling coffee beverages, tea, food, and consumer packaged goods under the Starbucks and Teavana brands.',                             'https://starbucks.com'),
  ('McDonald''s',     'mcdonalds',       'Food & Beverage',            'The world''s largest fast food restaurant chain by number of locations, serving approximately 70 million customers daily across more than 40,000 restaurants in over 100 countries.',                                        'https://mcdonalds.com'),
  ('Disney',          'disney',          'Entertainment & Media',      'One of the world''s largest entertainment companies, operating theme parks, film studios, streaming services (Disney+), and TV networks including ABC and ESPN.',                                                              'https://thewaltdisneycompany.com'),
  ('3M',              '3m',              'Industrial & Consumer Goods', 'A diversified multinational conglomerate producing over 60,000 products across healthcare, safety, electronics, and consumer goods, known for Post-it Notes, Scotch tape, and N95 respirators.',                             'https://3m.com'),
  ('Philip Morris',   'philip-morris',   'Tobacco',                    'The world''s largest transnational tobacco company, selling cigarettes including Marlboro, L&M, and Chesterfield in over 175 countries while pivoting to reduced-risk tobacco products.',                                    'https://pmi.com'),
  ('Tyson Foods',     'tyson-foods',     'Food & Beverage',            'The world''s second-largest processor and marketer of chicken, beef, and pork, operating under the Tyson, Jimmy Dean, Ball Park, Hillshire Farm, and Sara Lee brands.',                                                     'https://tysonfoods.com'),
  ('Bayer',           'bayer',           'Pharmaceuticals & Agriculture', 'A German multinational pharmaceutical and life sciences company producing prescription drugs, consumer health products, and agricultural chemicals under brands including Aspirin, Alka-Seltzer, and Roundup.',            'https://bayer.com'),
  ('Goldman Sachs',   'goldman-sachs',   'Banking & Finance',          'A leading global investment banking, securities, and investment management firm providing services to corporations, governments, financial institutions, and individuals.',                                                    'https://goldmansachs.com'),
  ('Citigroup',       'citigroup',       'Banking & Finance',          'One of the world''s largest financial institutions, providing banking, credit, trading, and investment services to over 200 million client accounts in more than 160 countries.',                                             'https://citigroup.com'),
  ('Shell',                  'shell',                    'Oil & Gas',                          'One of the world''s largest energy companies by revenue, engaged in the exploration, production, refining, distribution, and marketing of oil and natural gas globally.',                                                     'https://shell.com'),
  ('BP',                     'bp',                       'Oil & Gas',                          'One of the world''s seven oil and gas "supermajors," operating in oil and gas exploration, production, refining, distribution, and marketing across over 70 countries.',                                                      'https://bp.com'),
  ('UnitedHealth Group',     'unitedhealth-group',       'Health Insurance',                   'The largest health insurance company in the United States, operating through its UnitedHealthcare insurance and Optum health services divisions, serving tens of millions of Americans.',                                      'https://unitedhealthgroup.com'),
  ('Berkshire Hathaway',     'berkshire-hathaway',       'Diversified Conglomerate',            'A multinational conglomerate holding company led by Warren Buffett, owning subsidiaries across insurance (GEICO), railroads (BNSF), utilities, manufacturing, and retail.',                                                  'https://berkshirehathaway.com'),
  ('McKesson',               'mckesson',                 'Pharmaceutical Distribution',         'One of the largest pharmaceutical distributors in the United States, supplying prescription drugs, medical supplies, and healthcare management solutions to pharmacies, hospitals, and providers.',                           'https://mckesson.com'),
  ('Cigna',                  'cigna',                    'Health Insurance',                   'A global health services company providing medical, dental, behavioral health, pharmacy, and disability insurance to millions of customers across employer-sponsored plans, individual policies, and Medicare.',                'https://cigna.com'),
  ('Elevance Health',        'elevance-health',          'Health Insurance',                   'Formerly known as Anthem, one of the largest health insurance providers in the United States operating Blue Cross Blue Shield plans in 14 states, serving over 40 million members.',                                         'https://elevancehealth.com'),
  ('Lockheed Martin',        'lockheed-martin',          'Aerospace & Defense',                'The world''s largest defense contractor by revenue, developing advanced military aircraft, missiles, space systems, and defense electronics primarily for the U.S. government. Its products include the F-35 fighter jet.',   'https://lockheedmartin.com'),
  ('Caterpillar',            'caterpillar',              'Industrial Machinery',               'The world''s largest manufacturer of construction and mining equipment, diesel and natural gas engines, and industrial gas turbines, used on construction sites and in mining operations worldwide.',                          'https://caterpillar.com'),
  ('Uber',                   'uber',                     'Ridesharing & Technology',           'A global technology platform providing ride-hailing, food delivery (Uber Eats), freight, and autonomous vehicle services in dozens of countries and one of the largest mobility platforms in the world.',                     'https://uber.com'),
  ('Visa',                   'visa',                     'Financial Services',                 'The world''s largest payment network, processing trillions of dollars in transactions annually across credit, debit, and prepaid cards, connecting financial institutions, merchants, and cardholders globally.',              'https://visa.com'),
  ('Mastercard',             'mastercard',               'Financial Services',                 'One of the world''s largest payment technology companies, operating a global network for processing card-based transactions partnering with banks and financial institutions worldwide.',                                       'https://mastercard.com'),
  ('PayPal',                 'paypal',                   'Financial Technology',               'A leading digital payments platform enabling consumers and merchants to send and receive money online through PayPal, Venmo, and Braintree payment processing, serving hundreds of millions of active accounts.',              'https://paypal.com'),
  ('DuPont',                 'dupont',                   'Specialty Chemicals',                'A specialty chemicals and materials science company producing products used in electronics, construction, transportation, and consumer goods. A descendant of one of America''s oldest chemical corporations.',               'https://dupont.com'),
  ('Dow Inc.',               'dow-inc',                  'Chemicals & Materials',              'One of the world''s largest chemical companies, producing plastics, performance materials, and industrial intermediates used in packaging, infrastructure, consumer care, and electronics. Spun off from DowDuPont in 2019.', 'https://dow.com'),
  ('Morgan Stanley',         'morgan-stanley',           'Investment Banking',                 'A global financial services firm offering investment banking, securities trading, wealth management, and investment management to corporations, governments, institutions, and individuals worldwide.',                          'https://morganstanley.com')
on conflict (slug) do update set
  name        = excluded.name,
  industry    = excluded.industry,
  description = excluded.description,
  website     = excluded.website;

-- ── Seed Reviews ─────────────────────────────────────────
-- Creates a system seed user in auth.users if it doesn't exist,
-- then inserts all reviews attributed to that user.
do $$
declare
  seed_user_id uuid := '00000000-0000-0000-0000-000000000099';
  cid uuid;
begin
  -- Insert a seed user into auth.users if not already present
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) values (
    seed_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'seed@corpwatch.internal',
    '',
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"CorpWatch Research"}',
    false
  ) on conflict (id) do nothing;

  -- Amazon
  select id into cid from companies where slug = 'amazon';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Amazon''s Warehouse Injury Crisis and Environmental Greenwashing Draw Federal Scrutiny',
    'A 2025 U.S. Senate HELP Committee investigation found that Amazon''s warehouse injury rates significantly exceed industry averages, driven by aggressive productivity quotas and anti-union practices. Amazon''s carbon emissions rose to 68.25 million metric tons of CO₂e in 2024 (up from 64.38 million in 2023), even as the company markets its "Climate Pledge." A March 2025 class-action lawsuit accuses Amazon of greenwashing Amazon Basics paper products sourced from suppliers that clearcut Canada''s boreal forest. In June 2023, Amazon paid $31 million to settle FTC privacy cases involving Alexa''s illegal retention of children''s voice data and Ring camera security failures.',
    2, 2, 1, 2, 2,
    'U.S. Senate HELP Committee Report (2025); Hagens Berman greenwashing lawsuit (2025); Amazon 2024 Sustainability Report; FTC v. Amazon Ring/Alexa settlement (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- ExxonMobil
  select id into cid from companies where slug = 'exxonmobil';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Decades of Climate Deception: ExxonMobil Knew About Global Warming Since the 1970s',
    'Internal documents revealed that ExxonMobil''s own scientists accurately predicted climate change as early as the late 1970s, yet the company spent hundreds of millions funding climate denial campaigns through the 1980s–2000s — known as #ExxonKnew. The 1989 Exxon Valdez disaster spilled 11 million gallons of crude oil in Alaska''s Prince William Sound, requiring over $3.8 billion in fines and settlements. As of 2025, ExxonMobil faces active lawsuits from over 10 U.S. states including Massachusetts, California, and New York, alleging consumer fraud and investor deception about climate risks. In 2024, ExxonMobil controversially sued its own shareholders who sought stronger climate action.',
    1, 1, 1, 2, 1,
    'Union of Concerned Scientists (#ExxonKnew); Massachusetts AG v. ExxonMobil; EPA Exxon Valdez Profile; NPR – ExxonMobil sues climate investors (Feb 2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Apple
  select id into cid from companies where slug = 'apple';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Apple Faces €2.3B+ in EU Antitrust Fines and Ongoing Foxconn Labor Abuse Allegations',
    'The European Commission fined Apple €1.8 billion in March 2024 and an additional €500 million in April 2025 — the first penalties under the EU Digital Markets Act — for blocking App Store developers from directing users to cheaper alternatives. China Labor Watch''s 2023 investigation of Foxconn''s Chengdu facility documented illegal use of dispatch workers, mandatory unpaid overtime, and wages of just $1.68/hour. France fined Apple $162 million and Italy fined it $116 million in December 2025 for privacy violations related to its App Tracking Transparency policy.',
    2, 3, 2, 2, 2,
    'European Commission DMA ruling (March 2024, April 2025); China Labor Watch Chengdu Report (2023); Italy AGCM fine (JURIST, December 2025)'
  ) on conflict (company_id, user_id) do nothing;

  -- Nestlé
  select id into cid from companies where slug = 'nestle';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Nestlé''s Decades of Controversy: Child Labor, Water Exploitation, and Infant Formula Deaths',
    'Nestlé has been the subject of a continuous international boycott since 1977 over its marketing of infant formula in developing nations, where representatives posed as nurses to steer mothers away from breastfeeding — resulting in infant deaths when formula was mixed with unsafe water. In 2015, Nestlé''s own investigation confirmed that seafood products in its brands were produced using forced labor in Thailand. The U.S. Department of Labor found that Nestlé sourced cocoa from West African farms where children as young as 12 worked with dangerous tools — a practice Nestlé has acknowledged since 2001 without fully resolving. In 2021, California ordered Nestlé to halt unauthorized water extractions from the San Bernardino National Forest.',
    1, 2, 1, 2, 1,
    'IBFAN/Baby Milk Action boycott history; U.S. Dept. of Labor cocoa supply chain findings; California SWRCB order (2021); Nestlé Corporate Rap Sheet – Corporate Research Project'
  ) on conflict (company_id, user_id) do nothing;

  -- Tesla
  select id into cid from companies where slug = 'tesla';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Tesla''s Autopilot Deaths, NLRB Violations, and EEOC Racial Harassment Lawsuit Define Its Record',
    'NHTSA''s Autopilot investigation identified 467 crashes including 14 deaths and 54 injuries; a December 2023 recall covering approximately 2 million vehicles followed, though a new NHTSA investigation in October 2024 found the remedy inadequate. The U.S. EEOC filed a lawsuit against Tesla alleging severe and systemic racial harassment of Black employees at its Fremont plant — including racist slurs, graffiti, and nooses — from 2015 onward. A March 2021 NLRB ruling found Tesla guilty of violating federal labor law by suppressing union organizing and ordered CEO Elon Musk to delete a tweet threatening workers'' stock options.',
    2, 4, 1, 2, 2,
    'NHTSA EA22002 investigation; EEOC v. Tesla; Washington Post – NLRB ruling (March 2021); Criticism of Tesla – Wikipedia'
  ) on conflict (company_id, user_id) do nothing;

  -- Walmart
  select id into cid from companies where slug = 'walmart';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Walmart Paid $282M in Bribery Fines and $82M for Environmental Crimes While Facing Racial Equity Failures',
    'In June 2019, Walmart paid $282 million to resolve a DOJ and SEC investigation under the Foreign Corrupt Practices Act, having bribed officials in Mexico, Brazil, China, and India to obtain operating permits. In May 2013, Walmart pled guilty to federal Clean Water Act violations for illegally dumping hazardous waste at stores and distribution centers and paid $82 million in fines. The 2013 Rana Plaza building collapse in Bangladesh, which killed 1,134 garment workers, identified Walmart as one of the major buyers from the facility. A 2022 Congressional investigation found Black hourly workers were fired at twice the rate of white workers during the COVID-19 pandemic.',
    2, 2, 1, 2, 2,
    'SEC – Walmart FCPA charges (2019); DOJ Clean Water Act plea (2013); Violation Tracker; Congressional racial equity investigation (2022)'
  ) on conflict (company_id, user_id) do nothing;

  -- Meta
  select id into cid from companies where slug = 'meta';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Meta Accumulated Over $6 Billion in Privacy Fines and Faces Teen Mental Health Litigation',
    'The 2018 Cambridge Analytica scandal exposed that data from up to 87 million Facebook profiles was harvested without consent and used for political targeting; Meta paid a $5 billion FTC fine in 2019 and a $725 million class-action settlement in 2022. Ireland''s Data Protection Commission fined Meta €1.2 billion under GDPR in May 2023 — the largest GDPR fine ever — for unlawfully transferring EU user data to the United States. As of early 2026, Meta faces state and federal trials over allegations that it knowingly designed Facebook and Instagram to addict children, with plaintiffs citing internal research that Meta concealed.',
    2, 3, 1, 1, 1,
    'FTC v. Facebook $5B fine (2019); Cambridge Analytica scandal – Wikipedia; Irish DPC GDPR fine (May 2023); PBS News – Teen mental health trial (Jan 2026)'
  ) on conflict (company_id, user_id) do nothing;

  -- Coca-Cola
  select id into cid from companies where slug = 'coca-cola';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Coca-Cola Named World''s Top Plastic Polluter for Multiple Consecutive Years',
    'A peer-reviewed study published in Science identified Coca-Cola as the single largest contributor of branded plastic found in global environments; the company sells over 100 billion single-use plastic bottles annually. In December 2024, Coca-Cola quietly abandoned its goal to make 25% of packaging reusable and scaled back other sustainability commitments under its "World Without Waste" program. In October 2024, Los Angeles County filed a lawsuit against Coca-Cola alleging the company ran a disinformation campaign to mislead consumers into believing single-use plastic bottles were environmentally responsible, while knowing most plastic is not recycled.',
    2, 1, 2, 2, 2,
    'Oceana – Coca-Cola''s World With Waste report; Science journal (branded plastic pollution); LA County v. Coca-Cola (filed Oct 2024); Plastic Pollution Coalition (Dec 2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Chevron
  select id into cid from companies where slug = 'chevron';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Chevron''s 16-Billion-Gallon Toxic Dumping in Ecuador and $550M Richmond Refinery Settlement',
    'Between 1964 and 1990, Texaco (acquired by Chevron in 2001) deliberately dumped over 16 billion gallons of toxic wastewater in Ecuador''s Amazon, affecting approximately 30,000 indigenous residents; an Ecuadorian court issued a $9.5 billion judgment against Chevron in 2011. Chevron''s Richmond, California refinery explosion in August 2012 — caused by a corroded pipe the company had ignored warnings about for over a decade — sent 15,000 Bay Area residents to medical centers. In August 2024, Richmond''s City Council approved a $550 million settlement with Chevron payable over 10 years. Separately, Chevron paid $20 million to the Bay Area Air Quality Management District in 2024 to settle 678 air quality violations from 2019–2023.',
    1, 1, 1, 2, 1,
    'Amazon Watch – Chevron Environmental Crimes (2024); ChevronToxico.com; Zehl Law – Richmond settlement; Bay Area AQMD settlement $20M (2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Nike
  select id into cid from companies where slug = 'nike';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Nike''s Sweatshop Legacy Persists as Workers Faint in Cambodian Factories and Emissions Targets Go Unmet',
    'Despite CEO Phil Knight''s 1998 public pledge to end sweatshop conditions, a ProPublica/Oregonian investigation found workers at Nike''s Cambodian supplier factories experienced mass fainting episodes in 2012, 2014, 2017, 2018, and 2019 — with more than 57,000 people producing Nike goods in those facilities. Nike faced international condemnation after refusing for three years to pay over 4,000 garment workers $2.2 million in unpaid wages owed since 2020. A 2024 ProPublica investigation revealed that Nike slashed its sustainability team after missing its own emissions reduction targets — achieving less than a 2% cut in emissions since 2015.',
    2, 2, 2, 2, 2,
    'ProPublica – Nike Slashed Sustainability Team (2024); Clean Clothes Campaign – Nike unpaid wages (2023); Good On You – Nike rating; Nike Sweatshops – Wikipedia'
  ) on conflict (company_id, user_id) do nothing;

  -- Alphabet/Google
  select id into cid from companies where slug = 'alphabet';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Google Hit with $9.5B Privacy Lawsuit and Antitrust Ruling Finding Illegal Monopoly in Search',
    'A federal judge ruled in August 2024 that Google illegally maintained a monopoly in the search engine and general search advertising markets, potentially reshaping how Google operates; the DOJ is seeking remedies including a possible forced divestiture of Chrome. Google agreed to a $391.5 million settlement with 40 state attorneys general in November 2022 for illegally tracking users'' locations without their knowledge after they had explicitly denied permission. In December 2023, a federal jury found Google liable for antitrust violations in its app store, and in 2024 Google agreed to delete billions of records collected from users browsing in "Incognito mode" as part of a class-action settlement.',
    3, 3, 2, 2, 2,
    'U.S. v. Google – DOJ antitrust ruling (Aug 2024); Google location tracking settlement $391.5M (Nov 2022); Google Incognito settlement (2024); Epic v. Google (app store, 2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- Microsoft
  select id into cid from companies where slug = 'microsoft';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Microsoft Pays $25M for FCPA Bribery and Faces Scrutiny Over AI Ethics and LinkedIn Data Practices',
    'In July 2019, Microsoft paid $25.3 million to resolve SEC and DOJ Foreign Corrupt Practices Act charges for bribing government officials in Hungary, Saudi Arabia, Thailand, and Turkey to win software contracts. The U.S. FTC blocked Microsoft''s $69 billion acquisition of Activision Blizzard for over a year, citing concerns about competition in cloud gaming; the deal closed in 2023 after regulatory concessions. LinkedIn (owned by Microsoft) paid $13 million in a 2023 class-action settlement for using personal data — including private messages — to train AI models without users'' consent.',
    3, 3, 3, 3, 2,
    'SEC – Microsoft FCPA charges (2019); FTC v. Microsoft/Activision; LinkedIn AI training settlement (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- JPMorgan Chase
  select id into cid from companies where slug = 'jpmorgan-chase';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'JPMorgan Paid $13B in Mortgage Fraud Settlement and Faces Ongoing Epstein Litigation',
    'In November 2013, JPMorgan Chase agreed to a landmark $13 billion settlement with the U.S. Justice Department — the largest settlement ever with a single entity at the time — for misleading investors about the quality of mortgage-backed securities sold before the 2008 financial crisis. In June 2023, JPMorgan paid $290 million to settle a class-action lawsuit brought by survivors of Jeffrey Epstein''s sexual abuse, who alleged the bank enabled his trafficking by providing financial services despite knowing of his crimes. The bank has paid more than $30 billion in fines and penalties since 2000, according to Violation Tracker.',
    2, 3, 2, 2, 2,
    'DOJ – JPMorgan $13B mortgage settlement (2013); JPMorgan Epstein settlement $290M (2023); Violation Tracker – JPMorgan record'
  ) on conflict (company_id, user_id) do nothing;

  -- Johnson & Johnson
  select id into cid from companies where slug = 'johnson-johnson';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'J&J Pays $8.9B Talc Cancer Settlement While Attempting Controversial "Texas Two-Step" Bankruptcy',
    'Johnson & Johnson agreed in 2023 to pay $8.9 billion over 25 years to settle approximately 60,000 lawsuits alleging its talc-based baby powder caused ovarian cancer and mesothelioma — after internal documents showed the company knew since at least 1971 that its talc products contained trace amounts of asbestos. J&J repeatedly attempted to use a controversial legal strategy called the "Texas Two-Step" to shield its main entity from further talc liability; federal courts rejected this approach multiple times. Previously, J&J paid $2.2 billion in 2013 to resolve criminal and civil charges related to the illegal marketing of the antipsychotic drug Risperdal for unapproved uses.',
    2, 3, 1, 2, 1,
    'J&J talc settlement $8.9B (2023); Reuters – J&J Texas Two-Step bankruptcy ruling; DOJ – J&J Risperdal $2.2B settlement (2013); Reuters – talc asbestos documents'
  ) on conflict (company_id, user_id) do nothing;

  -- Procter & Gamble
  select id into cid from companies where slug = 'procter-gamble';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'P&G Faces Greenwashing Lawsuits Over Gillette and Plastics While Deforestation Links Persist',
    'Procter & Gamble has been identified by the Rainforest Action Network as one of the largest corporate consumers of wood pulp from tropical rainforests, including deforestation-linked suppliers in Indonesia and the Amazon. A 2021 class-action lawsuit accused P&G''s Gillette brand of misleading consumers with its "The Best Men Can Be" marketing while the company''s supply chain contributed to environmental destruction. P&G''s Charmin brand was named the "most problematic" in the toilet paper industry by the Natural Resources Defense Council for sourcing from primary boreal forests in Canada. The company has also faced multiple FTC investigations over "flushable" wipes marketing that caused sewage system blockages.',
    2, 2, 2, 2, 3,
    'Rainforest Action Network – P&G deforestation (2020); NRDC Issue Paper on Tissue (2020); FTC investigation into flushable wipes marketing'
  ) on conflict (company_id, user_id) do nothing;

  -- Wells Fargo
  select id into cid from companies where slug = 'wells-fargo';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Wells Fargo''s 3.5 Million Fake Accounts Scandal Cost $3 Billion in Criminal Fines',
    'Wells Fargo agreed in February 2020 to pay $3 billion to resolve criminal and civil investigations into a scheme in which employees secretly opened approximately 3.5 million unauthorized bank and credit card accounts in customers'' names between 2002 and 2016, driven by unrealistic sales quotas. The OCC fined Wells Fargo $250 million in 2021 for failure to remedy the fake accounts scandal and has maintained a consent order limiting the bank''s asset growth since 2018 — the longest-running consent order of its kind. Wells Fargo paid an additional $1 billion in fines to the CFPB and OCC in 2018, and $1.7 billion to the CFPB in 2022 for wide-ranging consumer abuses including illegal foreclosures, repossessions, and fee charges.',
    1, 2, 1, 1, 1,
    'DOJ – Wells Fargo $3B criminal settlement (2020); OCC $250M fine (2021); CFPB $1.7B settlement (2022); Federal Reserve consent order (2018)'
  ) on conflict (company_id, user_id) do nothing;

  -- Pfizer
  select id into cid from companies where slug = 'pfizer';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Pfizer Paid $2.3B in the Largest Healthcare Fraud Settlement in U.S. History',
    'In September 2009, Pfizer paid $2.3 billion — the largest healthcare fraud settlement in U.S. history at the time — to resolve criminal and civil charges for illegally promoting the painkiller Bextra and other drugs for unapproved uses and paying kickbacks to doctors who prescribed them. Pfizer''s subsidiary Pharmacia & Upjohn entered a guilty plea as part of the settlement. In 2021, Pfizer faced controversy when it negotiated COVID-19 vaccine supply contracts that required governments to pledge state assets as collateral and waive sovereign immunity — terms exposed in leaked contracts from Albania, Brazil, and the Dominican Republic.',
    2, 3, 2, 2, 2,
    'DOJ – Pfizer $2.3B settlement (Sept 2009); Bureau of Investigative Journalism – Pfizer vaccine contracts (2021); Pfizer pharmaceutical fraud history – Wikipedia'
  ) on conflict (company_id, user_id) do nothing;

  -- Comcast
  select id into cid from companies where slug = 'comcast';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Comcast Ranked America''s Most Hated Company While Facing FTC Charges for Hidden Fees',
    'Comcast/Xfinity has ranked among the most complained-about companies to the FCC and FTC for over a decade. In October 2023, the FTC sued Comcast''s Xfinity for charging customers for services and equipment they did not request and making it unreasonably difficult to cancel subscriptions — a practice the FTC called "negative option" abuse. In December 2023, Comcast disclosed a data breach affecting approximately 35.9 million Xfinity customer accounts, exposing usernames, passwords, and partial Social Security numbers. Comcast has been repeatedly fined by the FCC for unauthorized charges and has settled multiple state class-action lawsuits over hidden fees that inflate advertised prices by 25–50%.',
    1, 2, 1, 1, 2,
    'FTC v. Comcast/Xfinity (Oct 2023); Comcast Xfinity data breach disclosure (Dec 2023); FCC complaint rankings; State AG settlements on hidden fees'
  ) on conflict (company_id, user_id) do nothing;

  -- AT&T
  select id into cid from companies where slug = 'att';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'AT&T Pays $105M for Unauthorized Charges and Exposed 73 Million Customer Records in 2024 Breach',
    'In October 2014, AT&T paid $105 million — the largest settlement for unauthorized charges on phone bills ("cramming") at the time — to the FTC and state attorneys general for allowing third-party companies to bill customers for services they never ordered. In March 2024, AT&T confirmed a massive data breach affecting approximately 73 million current and former customers, exposing Social Security numbers, passcodes, and account details; the data appeared on the dark web and AT&T was criticized for waiting years to notify customers. AT&T also paid $25 million to the FCC in 2015 for failing to protect customer information after call center employees in Mexico, Colombia, and the Philippines sold sensitive customer data.',
    2, 2, 1, 1, 2,
    'FTC – AT&T cramming settlement $105M (2014); AT&T data breach disclosure (March 2024); FCC – AT&T data security fine $25M (2015)'
  ) on conflict (company_id, user_id) do nothing;

  -- Verizon
  select id into cid from companies where slug = 'verizon';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Verizon Fined $225M for Illegal Data Sharing and Faces Class Actions Over Hidden Fees',
    'In 2021, the FCC proposed a $91.6 million fine against Verizon Wireless for sharing customers'' real-time location data with third-party aggregators without adequate consent — part of a broader investigation that also targeted AT&T and T-Mobile. Verizon has settled multiple class-action lawsuits over its practice of charging "administrative fees" that were not included in advertised plan prices; a 2022 New Jersey settlement resulted in $100 million in refunds to subscribers. The DOJ reviewed Verizon''s 2021 acquisition of TracFone for its potential to harm low-income consumers who depend on Lifeline telephone services, ultimately approving it with conditions.',
    2, 2, 2, 2, 2,
    'FCC – Verizon location data sharing proposed fine (2021); Verizon administrative fee class-action NJ settlement (2022); DOJ TracFone acquisition review'
  ) on conflict (company_id, user_id) do nothing;

  -- Home Depot
  select id into cid from companies where slug = 'home-depot';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Home Depot''s 2014 Data Breach Exposed 56 Million Cards and Cost $200M in Settlements',
    'In September 2014, Home Depot disclosed that hackers stole credit and debit card data from approximately 56 million customers using malware installed on its payment systems — one of the largest retail data breaches in history. The company paid approximately $200 million in settlements to banks, card companies, and consumers between 2016 and 2017. Home Depot has also faced criticism from labor advocates for its persistent opposition to store-level unionization and its reliance on part-time labor that limits benefits access. The company paid $2.9 million in 2020 to settle California OSHA violations related to hazardous materials handling at its stores.',
    3, 3, 2, 2, 2,
    'Home Depot data breach disclosure (Sept 2014); Home Depot $200M breach settlements (2016-17); California OSHA settlement $2.9M (2020)'
  ) on conflict (company_id, user_id) do nothing;

  -- CVS Health
  select id into cid from companies where slug = 'cvs-health';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'CVS Pays $5B as Part of Opioid Settlement and Agrees to $46M FTC Prescription Overcharge Settlement',
    'CVS Health agreed in November 2022 to pay $4.9 billion as part of a landmark nationwide opioid settlement with state and local governments, resolving claims that its pharmacies knowingly filled millions of invalid prescriptions for addictive pain pills. In October 2022, CVS''s Caremark pharmacy benefit management subsidiary agreed to a $46 million FTC settlement for overcharging Medicare and Medicaid programs for prescription drugs by applying inflated "usual and customary" prices. CVS was also fined $535,000 by New York regulators in 2021 for failing to properly dispose of unused prescription medications, creating risks of drug diversion and environmental contamination.',
    2, 2, 2, 2, 2,
    'CVS Opioid settlement $4.9B (Nov 2022); FTC – Caremark $46M settlement (Oct 2022); NY DEC CVS medication disposal fine (2021)'
  ) on conflict (company_id, user_id) do nothing;

  -- UnitedHealth
  select id into cid from companies where slug = 'unitedhealth';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'UnitedHealth''s Change Healthcare Hack Exposed 190 Million Americans and AI Denies Millions of Claims',
    'A February 2024 ransomware attack on UnitedHealth''s Change Healthcare subsidiary — the largest health data breach in U.S. history — exposed the personal health information of approximately 190 million Americans, disrupting prescription processing and medical billing for months. Congressional investigations revealed that UnitedHealth''s AI system NaviHealth denied post-acute care claims at a rate of approximately 90% in some facilities, often overriding physician recommendations; multiple lawsuits allege the AI system was designed to deny claims regardless of medical necessity. In November 2024, UnitedHealth''s CEO Brian Thompson was fatally shot, prompting widespread public discussion about the insurance industry''s claim denial practices.',
    1, 2, 1, 1, 1,
    'Change Healthcare breach – HHS disclosure (2024); Senate Finance Committee AI denial investigation (2024); Multiple class-action suits re: NaviHealth AI denials'
  ) on conflict (company_id, user_id) do nothing;

  -- Boeing
  select id into cid from companies where slug = 'boeing';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Boeing''s 737 MAX Cover-Up Killed 346 People; Company Pleads Guilty to Criminal Fraud in 2024',
    'Two Boeing 737 MAX crashes — Lion Air Flight 610 (October 2018) and Ethiopian Airlines Flight 302 (March 2019) — killed 346 people after Boeing concealed known flaws in the MCAS flight control system from pilots and regulators. Internal messages revealed Boeing engineers mocked the FAA and described the plane as "designed by clowns." In July 2024, the DOJ announced Boeing would plead guilty to criminal conspiracy to defraud the United States and pay at least $243.6 million in fines — though a federal judge initially rejected a plea deal in December 2024 citing concerns about the monitoring process. In January 2024, a door plug blew off an Alaska Airlines 737 MAX 9 in flight at 16,000 feet, exposing additional quality control failures.',
    1, 2, 1, 1, 1,
    'DOJ – Boeing 737 MAX criminal plea (2024); House Committee on Transportation 737 MAX report (2020); Alaska Airlines 737 MAX door plug incident (Jan 2024); Reuters – Boeing guilty plea'
  ) on conflict (company_id, user_id) do nothing;

  -- Ford
  select id into cid from companies where slug = 'ford';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Ford Recalls 5 Million Vehicles in 2024 and Pays $19.2M EPA Fine for Emissions Violations',
    'Ford issued over 40 recalls affecting more than 5 million vehicles in 2024, including a major recall of 2021–2023 F-150 trucks for engine block heater cables that could cause fires. In March 2024, Ford agreed to pay $19.2 million in penalties to the EPA for violations of clean air regulations related to its vehicle emissions certification process. Ford''s Pinto scandal in the 1970s — in which the company calculated it was cheaper to pay wrongful death settlements than fix a known fuel tank defect that caused fires — remains a landmark case in corporate ethics. Ford also paid $2.1 billion to settle a class-action lawsuit in 2020 over defective 6.0L PowerStroke diesel engines that dealers and customers were misled about.',
    2, 2, 2, 2, 2,
    'NHTSA recall database (Ford 2024); EPA Ford emissions fine $19.2M (March 2024); Ford Pinto case – Wikipedia; Ford 6.0L PowerStroke settlement (2020)'
  ) on conflict (company_id, user_id) do nothing;

  -- General Motors
  select id into cid from companies where slug = 'general-motors';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'GM Hid Ignition Switch Defect for 13 Years; 124 Deaths and $900M Criminal Settlement Followed',
    'General Motors concealed a faulty ignition switch defect in its Cobalt, Ion, and other models for over 13 years, during which the defect caused at least 124 deaths and 275 injuries by cutting engine power and disabling airbags. In September 2015, GM agreed to pay $900 million to settle criminal charges that it deceived regulators and consumers; the company recalled 30 million vehicles globally. In March 2023, GM''s autonomous vehicle subsidiary Cruise faced scrutiny after a Cruise robotaxi ran over a pedestrian in San Francisco who had been hit by another car — the vehicle dragged the person 20 feet. California regulators suspended Cruise''s operating license and Cruise CEO Kyle Vogt resigned in November 2023.',
    2, 2, 2, 2, 2,
    'DOJ – GM $900M settlement (2015); Center for Auto Safety – ignition switch timeline; CA DMV – Cruise suspension (Oct 2023); Reuters – Cruise pedestrian incident'
  ) on conflict (company_id, user_id) do nothing;

  -- Target
  select id into cid from companies where slug = 'target';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Target''s 2013 Data Breach Hit 110 Million Customers and Cost $292M in Settlements',
    'Target disclosed in December 2013 that hackers stole credit and debit card data from approximately 40 million customers and personal information from up to 70 million more, making it one of the largest retail data breaches in U.S. history at the time. Target paid $18.5 million to settle claims from 47 state attorneys general in 2017, $67 million to Visa, and total costs from the breach exceeded $292 million. Target also agreed to a $3.7 million settlement in 2022 over allegations that it used biometric surveillance technology in its stores without customer consent in violation of Illinois''s Biometric Information Privacy Act.',
    3, 3, 3, 2, 2,
    'Target data breach – FTC; Target $18.5M state AG settlement (2017); Target BIPA biometric surveillance settlement $3.7M (2022)'
  ) on conflict (company_id, user_id) do nothing;

  -- Costco
  select id into cid from companies where slug = 'costco';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Costco Rates Among Highest for Labor Practices But Faces Tuna Supply Chain Forced Labor Allegations',
    'Costco consistently ranks among the best large employers for wages, benefits, and labor practices — offering starting wages above $18/hour, full benefits to part-time workers after 180 days, and low CEO-to-median-worker pay ratios by retail industry standards. However, Costco has faced repeated scrutiny over its seafood supply chain: a 2015 Associated Press investigation found forced labor conditions among Thai fishing vessels supplying Costco''s store-brand tuna. In 2022, Costco was named in a class-action lawsuit alleging its "Kirkland Signature" shrimp was produced using forced labor in Southeast Asian supply chains. Costco has been more transparent than most retailers about supply chain auditing, though advocacy groups say its auditing remains insufficient.',
    3, 3, 4, 3, 3,
    'AP – Costco Thai tuna forced labor investigation (2015); Costco Kirkland shrimp forced labor lawsuit (2022); Good Jobs First – Costco labor practices ranking; Glassdoor employer ratings'
  ) on conflict (company_id, user_id) do nothing;

  -- Starbucks
  select id into cid from companies where slug = 'starbucks';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Starbucks Hit with Record NLRB Violations After Firing Hundreds of Union Organizers',
    'Starbucks Workers United began organizing in late 2021 and quickly grew to represent over 400 U.S. stores; the NLRB issued hundreds of complaints against Starbucks for illegally firing union organizers, closing unionized stores, and withholding benefits from unionized workers. In June 2024, the NLRB''s general counsel described Starbucks'' anti-union conduct as "one of the most extensive attacks on workers'' rights I have seen." A federal judge in Arizona ordered Starbucks to rehire six fired union organizers in 2023. Starbucks reached a tentative agreement with the union in February 2025, but the NLRB''s backlog of complaints against the company remains one of the largest in the agency''s history.',
    2, 3, 1, 3, 2,
    'NLRB complaint tracker – Starbucks Workers United; Federal court order – Arizona organizers rehiring (2023); NLRB general counsel statement (June 2024); AP – Starbucks union tentative deal (Feb 2025)'
  ) on conflict (company_id, user_id) do nothing;

  -- McDonald's
  select id into cid from companies where slug = 'mcdonalds';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'McDonald''s Faces $2B+ Sexual Harassment Lawsuits and Is World''s Second-Largest Plastic Polluter',
    'McDonald''s was identified as the second-largest branded plastic polluter in the world in the 2023 Break Free From Plastic global audit. The company has faced over $2 billion in sexual harassment lawsuits from franchisee workers across the U.S.; a 2021 report by the TIME''s Up Legal Defense Fund documented systemic sexual harassment across McDonald''s franchise locations. McDonald''s paid €1.25 billion in back taxes to France in 2023 after a decade-long investigation into tax avoidance through its Luxembourg subsidiary. The company also faced a $1 billion lawsuit in 2021 from Black former franchisees alleging the company steered them toward lower-revenue inner-city locations and offered less support than white franchisees.',
    2, 2, 1, 2, 2,
    'Break Free From Plastic audit (2023); TIME''s Up Legal Defense Fund report (2021); McDonald''s France tax settlement €1.25B (2023); Black franchisee lawsuit (2021)'
  ) on conflict (company_id, user_id) do nothing;

  -- Disney
  select id into cid from companies where slug = 'disney';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Disney Sued for Gender Pay Gap and Faces Backlash Over Streaming Price Deception and Child Privacy',
    'In April 2019, a class-action lawsuit was filed against Disney alleging that the company systematically paid female employees $0.18 less per dollar than male counterparts — the suit included over 9,000 current and former employees and was settled for an undisclosed amount in 2023. In 2023, the FTC warned Disney+ and other streaming services about dark pattern subscription practices that make cancellation deliberately difficult and obscure price increases. Disney agreed to pay $8 million to settle a class-action claim that it collected children''s data without parental consent through its apps in violation of COPPA. Disney also faced a biometric data class-action in 2023 alleging its theme park fingerprint scanning system violated Illinois privacy law.',
    3, 3, 2, 2, 3,
    'Disney gender pay gap class action (2019); Disney COPPA settlement $8M; FTC streaming dark patterns warning (2023); Disney fingerprint BIPA lawsuit (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- 3M
  select id into cid from companies where slug = '3m';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '3M Pays $10.3B for Contaminating U.S. Water Supplies with "Forever Chemicals" (PFAS)',
    '3M agreed in June 2023 to pay $10.3 billion over 13 years to settle claims from U.S. public water systems contaminated with PFAS ("forever chemicals") — synthetic compounds 3M manufactured for decades under brands like Scotchgard while knowing since the 1970s that they persisted in the environment and human bloodstream. 3M also agreed to a separate $6 billion settlement in 2023 to resolve claims from U.S. military veterans who suffered hearing loss from defective Combat Arms earplugs manufactured by 3M subsidiary Aearo Technologies — the largest mass tort settlement in U.S. history at the time. Belgium fined 3M €571 million for contaminating water near its Antwerp plant, and 3M exited PFAS manufacturing entirely by the end of 2025.',
    2, 1, 1, 2, 1,
    '3M PFAS water settlement $10.3B (June 2023); 3M Combat Arms earplug settlement $6B (2023); Belgian PFAS fine €571M; 3M PFAS exit announcement (2022)'
  ) on conflict (company_id, user_id) do nothing;

  -- Philip Morris
  select id into cid from companies where slug = 'philip-morris';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Philip Morris Concealed Tobacco Dangers for Decades; Now Spends Billions Lobbying Against Regulation',
    'Philip Morris International and its parent Altria were found liable in the 1998 Master Settlement Agreement — the largest civil litigation settlement in U.S. history at $206 billion — for deliberately deceiving the public about the health risks of cigarettes and manipulating nicotine content to maintain addiction. Internal documents released during litigation showed Philip Morris''s scientists confirmed in the 1960s that cigarettes caused cancer and that nicotine was addictive, yet the company publicly denied both for decades. Philip Morris''s IQOS heated tobacco product faced an FDA marketing denial in 2022, and the company spent $9 billion acquiring smokeless tobacco brand Swedish Match in 2022 to diversify its addiction portfolio.',
    1, 2, 1, 1, 1,
    'Master Settlement Agreement (1998) – NAAG; Philip Morris Papers at UCSF Legacy Tobacco Documents Library; FDA IQOS marketing denial (2022); Altria Swedish Match acquisition (2022)'
  ) on conflict (company_id, user_id) do nothing;

  -- Tyson Foods
  select id into cid from companies where slug = 'tyson-foods';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Tyson Foods: Record Fines for Water Pollution and Criminal Charges Over COVID Worker Deaths',
    'Tyson Foods has paid over $100 million in Clean Water Act penalties since 2000, making it one of the most-penalized companies for water pollution in U.S. history; its facilities have discharged hog blood, chicken fat, ammonia, and industrial waste into waterways across the Midwest. During the COVID-19 pandemic, criminal charges were filed against four Tyson plant managers in Iowa for placing bets on how many workers would contract COVID-19 while refusing to close the Waterloo pork plant — over 1,000 workers were infected and five died. The DOJ sued Tyson in 2022 for conspiring to fix prices in the broiler chicken market from 2012 to 2019, and Tyson paid $221.5 million to settle the lawsuit in 2024.',
    1, 1, 1, 2, 1,
    'EPA – Tyson Clean Water Act violations history; Iowa AG – Tyson COVID criminal charges (2020); DOJ – Tyson chicken price-fixing settlement $221.5M (2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Bayer
  select id into cid from companies where slug = 'bayer';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Bayer Pays $10.9B for Roundup Cancer Lawsuits Inherited from Monsanto Acquisition',
    'Bayer acquired Monsanto for $63 billion in 2018 and inherited over 100,000 lawsuits alleging that Monsanto''s Roundup herbicide (glyphosate) caused non-Hodgkin lymphoma; Bayer agreed in 2020 to pay approximately $10.9 billion to settle most claims, including $8.8 billion for existing claimants and $1.25 billion to address future claims. A 2019 California jury awarded $2 billion to a couple who developed cancer, reduced by courts to $86.7 million. Bayer has also faced criticism for Monsanto''s history of Agent Orange production, PCB manufacturing, and aggressive litigation against farmers who saved patented GMO seeds. Bayer''s Essure birth control device was pulled from markets after thousands of reports of serious adverse events.',
    2, 2, 1, 2, 2,
    'Bayer Roundup settlement $10.9B (2020); Dewayne Johnson v. Monsanto (2019); Monsanto – Wikipedia history; Bayer Essure FDA withdrawal (2018)'
  ) on conflict (company_id, user_id) do nothing;

  -- Goldman Sachs
  select id into cid from companies where slug = 'goldman-sachs';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Goldman Sachs Pays $5B for Mortgage Fraud and $2.9B for 1MDB Malaysian Corruption Scandal',
    'Goldman Sachs agreed in April 2016 to pay $5.06 billion to settle DOJ and state charges for packaging and selling billions in toxic mortgage-backed securities that contributed to the 2008 financial crisis — while its own traders bet against the same products. In October 2020, Goldman Sachs''s Malaysian subsidiary pleaded guilty in one of the largest corruption cases in U.S. history, agreeing to pay $2.9 billion globally to resolve charges that its bankers paid over $1.6 billion in bribes to Malaysian and Abu Dhabi officials to secure $6.5 billion in bond deals for the 1MDB sovereign wealth fund. Goldman also paid $215 million in 2023 to settle gender discrimination claims from female employees.',
    2, 3, 1, 2, 1,
    'DOJ – Goldman Sachs mortgage settlement $5B (2016); DOJ – Goldman Sachs 1MDB guilty plea $2.9B (2020); Goldman gender discrimination settlement $215M (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- Citigroup
  select id into cid from companies where slug = 'citigroup';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Citigroup Pays $7B for Mortgage Fraud and $400M for Risk Management Failures',
    'In July 2014, Citigroup agreed to pay $7 billion to resolve DOJ allegations that it knowingly packaged and sold toxic mortgage-backed securities in the years before the 2008 financial crisis, including $4 billion in civil penalties — the largest penalty of any bank for mortgage crisis conduct at the time. The OCC and Federal Reserve fined Citigroup $400 million in October 2020 for "longstanding failure" to maintain adequate risk management systems and data infrastructure — known internally as "Transform" — and ordered the bank to fix systemic problems. In 2023, Citigroup accidentally wired $500 million of its own money to Revlon creditors in an error that triggered a two-year legal battle the bank ultimately lost.',
    2, 3, 2, 2, 2,
    'DOJ – Citigroup $7B mortgage settlement (2014); OCC/Federal Reserve $400M fine (Oct 2020); Citigroup Revlon wire error – U.S. Second Circuit ruling (2021)'
  ) on conflict (company_id, user_id) do nothing;

  -- Shell
  select id into cid from companies where slug = 'shell';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Dutch Court Orders Shell to Cut Emissions 45% by 2030; Company Abandons Climate Targets Instead',
    'In May 2021, a Dutch court ordered Shell to reduce its global CO₂ emissions by 45% by 2030 compared to 2019 levels — the first time a court ordered a company to align with the Paris Agreement; Shell appealed and in November 2024, a Dutch appeals court overturned the ruling. Shell abandoned its short-term emissions reduction targets in 2023 and dropped a target to reduce the carbon intensity of its products by 6–8% by 2023, citing conflicts between green commitments and shareholder returns. Shell''s operations in Nigeria''s Niger Delta have caused decades of oil spills — a 2011 UN Environment Programme report found that Ogoniland cleanup would take 25–30 years and cost over $1 billion. Shell paid $15.5 million to the Ogoni people in 2023 to settle a 30-year lawsuit over spills.',
    1, 1, 1, 2, 1,
    'Milieudefensie v. Shell (Dutch court, May 2021); Shell drops emissions targets – Reuters (2023); UNEP Ogoniland assessment (2011); Shell Nigeria settlement $15.5M (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- BP
  select id into cid from companies where slug = 'bp';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'BP''s Deepwater Horizon Explosion Killed 11 Workers and Triggered the Largest Environmental Settlement in U.S. History',
    'The April 2010 explosion of BP''s Deepwater Horizon drilling rig killed 11 workers and released approximately 4.9 million barrels of oil into the Gulf of Mexico over 87 days — the largest accidental marine oil spill in history. BP paid over $65 billion in cleanup costs, fines, and settlements including a $20.8 billion settlement with the U.S. government and Gulf states in 2015 — the largest environmental settlement in U.S. history. The 2005 Texas City refinery explosion, which killed 15 workers and injured 180, preceded Deepwater Horizon and demonstrated BP''s pattern of neglecting safety to cut costs. In 2024, BP scaled back its renewable energy targets and increased oil and gas investment after activist investor Elliott Management acquired a significant stake.',
    1, 1, 1, 2, 1,
    'BP Deepwater Horizon – EPA settlement overview; DOJ – BP $20.8B settlement (2015); Texas City refinery explosion (2005); BP scales back green targets – Reuters (2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Bank of America
  select id into cid from companies where slug = 'bank-of-america';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Bank of America Pays $16.65B in the Largest DOJ Settlement Ever for Mortgage Fraud',
    'In August 2014, Bank of America agreed to pay $16.65 billion — the largest settlement with a single entity in U.S. Department of Justice history — to resolve federal and state claims that the bank and its Countrywide and Merrill Lynch subsidiaries sold toxic mortgage-backed securities in the years before the 2008 financial crisis. BofA also paid $727 million to the CFPB in 2014 for deceptive credit card add-on products sold to 1.4 million customers. In 2023, the CFPB ordered Bank of America to pay $250 million to customers for illegally charging junk fees, withholding credit card rewards, and opening fake accounts — practices reminiscent of the Wells Fargo scandal.',
    2, 3, 2, 2, 2,
    'DOJ – Bank of America $16.65B settlement (2014); CFPB – BofA credit card settlement $727M (2014); CFPB – BofA junk fees order $250M (2023)'
  ) on conflict (company_id, user_id) do nothing;

  -- UnitedHealth Group
  select id into cid from companies where slug = 'unitedhealth-group';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Algorithmic Claim Denials and $2.7 Billion in Regulatory Penalties; AI Rejects 80% of Appeals',
    'UnitedHealth Group has accumulated over $2.7 billion in regulatory penalties since 2000. In 2023, a federal class-action lawsuit alleged the company''s PXDX algorithm systematically denied rehabilitation care to seriously ill Medicare Advantage patients at an illegally high error rate, with 80% of denied prior authorizations overturned on appeal. The DOJ has intervened in two False Claims Act lawsuits alleging UnitedHealth overbilled Medicare Advantage by over $7.2 billion between 2009 and 2016 by adding unsupported diagnostic codes to patient records. In February 2024, a ransomware attack on UnitedHealth''s Change Healthcare subsidiary — the largest health data breach in U.S. history — exposed the personal health information of approximately 190 million Americans.',
    1, 3, 1, 1, 1,
    'STAT News (Nov. 2023); HHS Office of Inspector General; Change Healthcare breach HHS disclosure (2024); Senate Finance Committee AI denial investigation (2024); Violation Tracker'
  ) on conflict (company_id, user_id) do nothing;

  -- Berkshire Hathaway
  select id into cid from companies where slug = 'berkshire-hathaway';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Executive Insider Trading Scandal and Disclosed Warren Buffett Personal Trade Conflicts',
    'In 2011, Berkshire Hathaway''s heir apparent David Sokol resigned after purchasing shares in Lubrizol Corporation while arranging Berkshire''s acquisition of the same company — Berkshire''s own ethics review found this violated its insider trading policy. ProPublica reported in 2022 that Warren Buffett made personal stock trades in companies Berkshire was simultaneously buying or selling on at least three occasions, contradicting his public statements about investment discipline. In 2014, Berkshire paid $896,000 to the FTC for failing to file required premerger notifications under the Hart-Scott-Rodino Act in connection with its acquisition of USG Corporation voting securities.',
    3, 3, 2, 3, 2,
    'ProPublica (2022); FTC press release (Aug. 2014); Bloomberg'
  ) on conflict (company_id, user_id) do nothing;

  -- McKesson
  select id into cid from companies where slug = 'mckesson';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Largest DEA Settlement in History for Opioid Distribution Failures; $7B National Opioid Settlement',
    'In January 2017, McKesson agreed to pay $150 million — the largest civil penalty in DEA history — for repeatedly failing to report suspicious orders of opioids to regulators, including oxycodone, despite being legally required to do so. McKesson had committed similar violations in 2008, paying a $13.25 million penalty, yet failed to implement its own compliance program. In 2021, McKesson joined Cardinal Health and AmerisourceBergen in a combined $21 billion National Opioid Settlement to resolve lawsuits from states and localities over the companies'' role in fueling the opioid epidemic. The DOJ noted McKesson''s repeated violations despite prior enforcement action.',
    1, 3, 1, 2, 1,
    'DEA press release (Jan. 2017); DOJ press release; National Opioids Settlement Executive Summary; Washington Post'
  ) on conflict (company_id, user_id) do nothing;

  -- Cigna
  select id into cid from companies where slug = 'cigna';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Algorithm Denied 300,000 Claims in Two Months at Average of 1.2 Seconds Each',
    'A March 2023 ProPublica investigation found that Cigna used a proprietary system called PXDX in which company doctors denied more than 300,000 insurance claims over a two-month period in 2022 at an average review time of 1.2 seconds per claim, without reading patient medical records. A former Cigna physician described the process as: "We literally click and submit — it takes all of 10 seconds to do 50 at a time." A federal class-action lawsuit filed in July 2023 accused Cigna of systematically denying claims in bulk in violation of federal insurance laws. Cigna''s own data showed approximately 80% of prior authorization denials appealed under Medicare Advantage plans were overturned.',
    1, 3, 1, 1, 1,
    'ProPublica (Mar. 2023); STAT News (July 2023); CBS News; Fierce Healthcare'
  ) on conflict (company_id, user_id) do nothing;

  -- Elevance Health
  select id into cid from companies where slug = 'elevance-health';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Largest U.S. Health Data Breach in History: 78.8 Million Records Stolen in 2015',
    'In February 2015, Anthem (now Elevance Health) disclosed that hackers had stolen the personal health information of approximately 78.8 million individuals — the largest healthcare data breach in U.S. history. The stolen data included names, Social Security numbers, medical ID numbers, dates of birth, and employment information. The breach began after at least one employee responded to a spear-phishing email. In October 2018, the HHS Office for Civil Rights levied a record $16 million HIPAA penalty. Anthem separately paid $48.2 million to state attorneys general. Total security-related spending following the breach exceeded $260 million.',
    2, 3, 2, 2, 2,
    'HHS OCR press release (Oct. 2018); HIPAA Journal; Wikipedia (Anthem medical data breach); BankInfoSecurity'
  ) on conflict (company_id, user_id) do nothing;

  -- Lockheed Martin
  select id into cid from companies where slug = 'lockheed-martin';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '1970s Global Bribery Scandals Toppled Foreign Governments; Directly Led to the Foreign Corrupt Practices Act',
    'Lockheed''s 1970s bribery scandal was one of the most consequential corporate corruption cases in history: the company paid $22 million in bribes to foreign officials to secure aircraft contracts, leading to the arrest of Japanese Prime Minister Kakuei Tanaka in 1976, the resignation of Dutch Prince Bernhard (who received a $1.1 million bribe), and political crises in Italy. Congress passed the Foreign Corrupt Practices Act in 1977 directly in response. In 1995, Lockheed Martin pleaded guilty to FCPA anti-bribery violations and paid $24.8 million in fines related to payments to an Egyptian politician. The Project on Government Oversight lists over $600 million in total fines and damages.',
    2, 2, 2, 3, 1,
    'Wikipedia (Lockheed bribery scandals); Stanford FCPA database; Corporate Research Project; POGO Federal Contractor Misconduct Database'
  ) on conflict (company_id, user_id) do nothing;

  -- Caterpillar
  select id into cid from companies where slug = 'caterpillar';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '$740 Million IRS Settlement for Deliberate Offshore Tax Fraud Scheme; $2.4B in Tax Avoided',
    'Caterpillar used a Swiss and Bermuda corporate structure to shift profits offshore and pay a 4–6% Swiss tax rate instead of the 35% U.S. rate, reducing its tax bill by an estimated $2.4 billion over more than a decade. A U.S. government-commissioned review concluded the arrangement constituted deliberate tax and financial reporting fraud, not mere negligence. The IRS claimed Caterpillar owed $2.3 billion in back taxes and penalties. In September 2022, Caterpillar settled for $740 million covering tax years 2007 through 2016. A whistleblower who raised concerns internally alleged it led to negative performance reviews and his reassignment.',
    2, 2, 2, 3, 2,
    'Bloomberg (June 2017); NPR Illinois (Sept. 2022); IRS via Jeff Newman Law; Citizens for Tax Justice'
  ) on conflict (company_id, user_id) do nothing;

  -- Uber
  select id into cid from companies where slug = 'uber';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '€290 Million GDPR Fine; "Greyball" Software Used to Evade Law Enforcement Globally',
    'In 2023, the Dutch Data Protection Authority fined Uber €290 million — the largest GDPR fine ever issued to a transportation company — for illegally transferring European driver data to U.S. servers without adequate safeguards. In 2017, The New York Times revealed Uber deployed a software tool called "Greyball" to serve fake versions of its app to law enforcement officers in cities where it was operating illegally, preventing regulators from ordering rides to confirm violations. In 2018, Uber paid $148 million to the FTC and admitted it falsely claimed to closely monitor internal access to customer data, following a 2016 data breach the company had concealed. The 2022 Uber Files revealed Uber secretly lobbied senior politicians including Emmanuel Macron and Joe Biden.',
    1, 3, 1, 2, 1,
    'Dutch DPA GDPR fine (2023); New York Times (2017 Greyball); FTC press release (2018); The Guardian (Uber Files, 2022)'
  ) on conflict (company_id, user_id) do nothing;

  -- Visa
  select id into cid from companies where slug = 'visa';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '$5.54 Billion Antitrust Settlement for 15+ Years of Interchange Fee Price-Fixing with Merchants',
    'Visa and Mastercard were sued in 2005 in a class-action antitrust case by merchants alleging the card networks conspired to fix interchange ("swipe") fees at artificially high levels for over 15 years, overcharging retailers billions of dollars annually. In February 2019, a district court approved a $5.54 billion settlement covering merchants who accepted Visa and Mastercard between 2004 and 2019. In June 2025, a federal court separately approved a $197.5 million settlement in an ATM fee antitrust case. The underlying litigation has continued with additional claims into its third decade. Visa also faces DOJ antitrust scrutiny for its debit card market practices as of 2024.',
    2, 3, 2, 3, 2,
    'Wikipedia (Payment card interchange fee litigation); Payment Card Settlement website; Bloomberg Law (ATM settlement, June 2025); DOJ debit card antitrust (2024)'
  ) on conflict (company_id, user_id) do nothing;

  -- Mastercard
  select id into cid from companies where slug = 'mastercard';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Co-Defendant in $5.54B Swipe Fee Antitrust Settlement; EC Fined €570M for Cross-Border Fee Blocking',
    'Mastercard was a named defendant in the 2005 payment card interchange fee antitrust class action, with merchants alleging the network conspired to fix swipe fees charged to businesses for over 15 years. The February 2019 court-approved settlement totaled $5.54 billion, shared by Visa, Mastercard, and defendant banks. The European Commission separately fined Mastercard €570 million in 2019 for blocking merchants from shopping for lower card fees across EU borders. Mastercard was also part of a $197.5 million ATM antitrust settlement approved in June 2025. The litigation has continued for over two decades with ongoing claims.',
    2, 3, 2, 3, 2,
    'Wikipedia (Payment card interchange fee litigation); European Commission (Jan. 2019); Bloomberg Law (June 2025)'
  ) on conflict (company_id, user_id) do nothing;

  -- PayPal
  select id into cid from companies where slug = 'paypal';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'CFPB: PayPal Enrolled Consumers in Credit Without Consent; NYDFS Cybersecurity Fine',
    'In 2015, the CFPB filed a complaint against PayPal alleging it illegally enrolled consumers in its PayPal Credit product without authorization, advertised promotional benefits it failed to honor, steered customers into using PayPal Credit instead of their preferred payment method, and then mishandled billing disputes. PayPal agreed to pay $15 million in consumer redress and a $10 million civil penalty. In January 2025, the New York State Department of Financial Services imposed a $2 million penalty on PayPal for cybersecurity violations stemming from a 2022 breach of its Form 1099-K tax document system that exposed Social Security numbers and dates of birth due to inadequate multi-factor authentication.',
    2, 3, 2, 3, 2,
    'CFPB press release (2015); NYDFS consent order (Jan. 2025); ACA International; Lexology'
  ) on conflict (company_id, user_id) do nothing;

  -- DuPont
  select id into cid from companies where slug = 'dupont';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '$670 Million PFOA Settlement After Contaminating Ohio and West Virginia Drinking Water for Decades',
    'DuPont discharged PFOA (C8), a "forever chemical" used in Teflon production, from its Washington Works plant in Parkersburg, West Virginia for decades, contaminating drinking water for over 70,000 people. In December 2005, the EPA imposed a $16.5 million fine — the largest civil administrative environmental penalty in agency history at the time — after finding DuPont had concealed its knowledge of PFOA toxicity from regulators. In 2017, DuPont settled approximately 3,500 personal injury lawsuits for $670.7 million. In June 2023, DuPont, Chemours, and Corteva agreed to pay $1.18 billion to settle claims from public water system operators nationwide.',
    1, 1, 1, 2, 1,
    'EPA press release (Dec. 2005); Forensis Group (litigation overview); New Jersey Monitor (Aug. 2025); Top Class Actions'
  ) on conflict (company_id, user_id) do nothing;

  -- Dow Inc.
  select id into cid from companies where slug = 'dow-inc';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    'Texas AG Sues for "Habitual" Pollution Violations; Over $1.1 Billion in Environmental Penalties',
    'Dow Inc. has accumulated over $1.1 billion in documented regulatory penalties since 2000 across 271 violation records. In February 2026, the Texas Attorney General filed a lawsuit against Dow Chemical alleging "habitual non-compliance" with wastewater pollution permits at its Gulf Coast chemical complex in Seadrift, Texas, citing hundreds of violations. A Louisiana state agency settled a decade of permit violations at a Dow plant for just $120,000 in 2023, days before a major explosion at the same facility. A broader DOJ settlement required Dow to reduce harmful air pollution at four U.S. chemical plants by upgrading industrial flares.',
    2, 1, 2, 3, 2,
    'Violation Tracker; Texas Tribune (Feb. 18, 2026); Houston Public Media (Feb. 2026); Louisiana Illuminator (Aug. 2023); DOJ press release'
  ) on conflict (company_id, user_id) do nothing;

  -- Morgan Stanley
  select id into cid from companies where slug = 'morgan-stanley';
  insert into reviews (company_id, user_id, headline, body, overall, environmental, ethical_business, consumer_trust, scandals, sources)
  values (cid, seed_user_id,
    '$2.6 Billion Mortgage Fraud Settlement; $35 Million SEC Fine for Exposing 15 Million Customer Records',
    'In February 2016, Morgan Stanley agreed to pay $2.6 billion to the DOJ and $550 million to New York State for misrepresenting the quality of residential mortgage-backed securities sold before the 2008 financial crisis. In August 2022, the SEC fined Morgan Stanley $35 million for extensive failures over five years to safeguard personal information of approximately 15 million customers — the firm hired a moving company with no data destruction experience to decommission servers, which were later auctioned with customer data intact. The OCC separately fined Morgan Stanley $60 million in 2020 for inadequate oversight of the decommissioning. Total penalties since 2000 exceed $10.9 billion.',
    2, 3, 2, 3, 2,
    'DOJ press release (Feb. 2016); SEC press release (Aug. 2022); OCC press release (Oct. 2020); Violation Tracker'
  ) on conflict (company_id, user_id) do nothing;

end $$;
