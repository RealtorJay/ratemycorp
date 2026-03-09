// ── Promises and Corporate Connections for newly seeded politicians ──────────
// Covers senators, house members, governors, and executive branch

export const NEW_PROMISES = [
  // ── John Thune
  { politician_slug: 'john-thune', category: 'taxes', promise_text: 'Pledged to make the 2017 Tax Cuts and Jobs Act permanent.', source_type: 'press_release', status: 'stalled', verdict_notes: 'Has introduced legislation to extend TCJA provisions but hasn\'t achieved permanent extension.' },
  { politician_slug: 'john-thune', category: 'economy', promise_text: 'Promised to protect South Dakota agriculture and ethanol mandates.', source_type: 'campaign_speech', status: 'kept', verdict_notes: 'Has consistently advocated for ethanol mandates and farm bill protections.' },

  // ── Tom Cotton
  { politician_slug: 'tom-cotton', category: 'immigration', promise_text: 'Promised to cut legal immigration by 50% through the RAISE Act.', source_type: 'press_release', status: 'stalled', verdict_notes: 'RAISE Act introduced but never received a floor vote despite Cotton\'s advocacy.' },
  { politician_slug: 'tom-cotton', category: 'defense', promise_text: 'Called for deploying active-duty military against George Floyd protesters in NYT op-ed.', source_type: 'other', status: 'broken', verdict_notes: 'Military was not deployed. Op-ed led to resignation of NYT editorial page editor.' },

  // ── Tim Scott
  { politician_slug: 'tim-scott', category: 'criminal_justice', promise_text: 'Proposed the JUSTICE Act for police reform after George Floyd\'s murder.', source_type: 'press_release', status: 'stalled', verdict_notes: 'Bill blocked by Democrats who wanted more comprehensive reforms. No police reform passed.' },
  { politician_slug: 'tim-scott', category: 'economy', promise_text: 'Championed Opportunity Zones to drive investment into distressed communities.', source_type: 'press_release', status: 'compromised', verdict_notes: 'Opportunity Zones passed in 2017 tax law but studies show most investment went to already-gentrifying areas, not the poorest communities.' },

  // ── Susan Collins
  { politician_slug: 'susan-collins', category: 'healthcare', promise_text: 'Voted to save the ACA, saying she believed in protecting pre-existing conditions.', source_type: 'press_release', status: 'kept', verdict_notes: 'Voted against the "skinny repeal" of the ACA in 2017, one of three Republicans to do so.' },
  { politician_slug: 'susan-collins', category: 'other', promise_text: 'Said Kavanaugh would respect Roe v. Wade precedent when she voted to confirm him.', source_type: 'interview', status: 'broken', verdict_notes: 'Kavanaugh voted to overturn Roe v. Wade in Dobbs (2022). Collins said she felt "misled."' },

  // ── Lisa Murkowski
  { politician_slug: 'lisa-murkowski', category: 'environment', promise_text: 'Promised to balance energy development with environmental protection in Alaska.', source_type: 'campaign_speech', status: 'compromised', verdict_notes: 'Supported Willow Project (drilling) but also voted for some conservation measures.' },
  { politician_slug: 'lisa-murkowski', category: 'other', promise_text: 'Voted to convict Trump in second impeachment trial and pledged accountability.', source_type: 'press_release', status: 'kept', verdict_notes: 'One of seven Republicans to vote to convict. Won 2022 re-election despite Trump opposition.' },

  // ── Rand Paul
  { politician_slug: 'rand-paul', category: 'defense', promise_text: 'Promised to end "forever wars" and opposed military intervention without congressional authorization.', source_type: 'campaign_speech', status: 'kept', verdict_notes: 'Has consistently voted against military authorizations and foreign aid packages.' },
  { politician_slug: 'rand-paul', category: 'healthcare', promise_text: 'Vowed to repeal and replace the Affordable Care Act with a free-market solution.', source_type: 'campaign_speech', status: 'broken', verdict_notes: 'Voted against the "skinny repeal" because it didn\'t go far enough. No replacement materialized.' },

  // ── Rick Scott
  { politician_slug: 'rick-scott', category: 'economy', promise_text: 'Proposed "sunsetting" all federal laws every five years, including Social Security and Medicare.', source_type: 'press_release', status: 'stalled', verdict_notes: 'Plan was widely attacked by both parties. McConnell publicly rejected it. Scott later modified the proposal.' },

  // ── Tommy Tuberville
  { politician_slug: 'tommy-tuberville', category: 'defense', promise_text: 'Blocked 450+ military promotions for months to protest Pentagon abortion travel policy.', source_type: 'press_release', status: 'kept', verdict_notes: 'Single-handedly held up military promotions from February to December 2023, including Joint Chiefs nominees.' },
  { politician_slug: 'tommy-tuberville', category: 'campaign_finance', promise_text: 'Pledged to follow STOCK Act reporting requirements.', source_type: 'other', status: 'broken', verdict_notes: 'Made over 130 stock trades without proper disclosure, including defense stocks while on Armed Services Committee.' },

  // ── Marsha Blackburn
  { politician_slug: 'marsha-blackburn', category: 'corporate_regulation', promise_text: 'Led fight to repeal FCC net neutrality rules, claiming it would "free the internet."', source_type: 'press_release', status: 'kept', verdict_notes: 'Net neutrality was repealed under Trump FCC in 2017. Blackburn received over $600K from telecom industry.' },

  // ── Chuck Schumer
  { politician_slug: 'chuck-schumer', category: 'economy', promise_text: 'Promised to pass a major infrastructure bill and bring manufacturing jobs back to America.', source_type: 'press_release', status: 'kept', verdict_notes: 'Led passage of the $1.2T Infrastructure Investment and Jobs Act (2021) and CHIPS Act (2022).' },
  { politician_slug: 'chuck-schumer', category: 'corporate_regulation', promise_text: 'Pledged to hold Big Tech accountable and pass antitrust legislation.', source_type: 'interview', status: 'broken', verdict_notes: 'Despite multiple hearings, no major tech antitrust bill passed during his time as Majority Leader.' },

  // ── Amy Klobuchar
  { politician_slug: 'amy-klobuchar', category: 'corporate_regulation', promise_text: 'Introduced the American Innovation and Choice Online Act to regulate Big Tech platforms.', source_type: 'press_release', status: 'stalled', verdict_notes: 'Bill had bipartisan support but never received a floor vote despite Klobuchar\'s advocacy.' },

  // ── Chris Murphy
  { politician_slug: 'chris-murphy', category: 'other', promise_text: 'Promised to pass meaningful gun safety legislation after Sandy Hook (2012).', source_type: 'press_release', status: 'compromised', verdict_notes: 'After a decade of failed efforts, co-authored the Bipartisan Safer Communities Act (2022) — the first major gun law in 30 years, but far short of original goals.' },

  // ── Cory Booker
  { politician_slug: 'cory-booker', category: 'criminal_justice', promise_text: 'Co-authored the First Step Act for criminal justice reform.', source_type: 'press_release', status: 'kept', verdict_notes: 'The First Step Act passed in 2018 with bipartisan support, reducing sentences and improving prison conditions. Over 30,000 inmates benefited.' },

  // ── Mark Kelly
  { politician_slug: 'mark-kelly', category: 'other', promise_text: 'Promised to fight for universal background checks on gun purchases.', source_type: 'campaign_speech', status: 'compromised', verdict_notes: 'Helped pass the Bipartisan Safer Communities Act but universal background checks were not included.' },

  // ── Raphael Warnock
  { politician_slug: 'raphael-warnock', category: 'healthcare', promise_text: 'Promised to cap insulin prices at $35 for all Americans.', source_type: 'campaign_speech', status: 'compromised', verdict_notes: 'Insulin cap was included in the Inflation Reduction Act but only applies to Medicare recipients, not all Americans.' },

  // ── Mike Johnson
  { politician_slug: 'mike-johnson', category: 'economy', promise_text: 'Pledged to cut federal spending and not raise the debt ceiling without spending reforms.', source_type: 'press_release', status: 'broken', verdict_notes: 'Passed a clean continuing resolution to avoid a government shutdown without the spending cuts he demanded.' },

  // ── Hakeem Jeffries
  { politician_slug: 'hakeem-jeffries', category: 'criminal_justice', promise_text: 'Promised to fight for police reform and the George Floyd Justice in Policing Act.', source_type: 'press_release', status: 'stalled', verdict_notes: 'The George Floyd Justice in Policing Act passed the House but died in the Senate twice.' },

  // ── MTG
  { politician_slug: 'marjorie-taylor-greene', category: 'other', promise_text: 'Repeatedly called for impeaching Joe Biden from her first day in Congress.', source_type: 'press_release', status: 'compromised', verdict_notes: 'Impeachment inquiry was launched but no articles of impeachment were voted on before Biden left office.' },

  // ── Jamie Raskin
  { politician_slug: 'jamie-raskin', category: 'campaign_finance', promise_text: 'Led the constitutional case for Trump\'s conviction in the second impeachment trial.', source_type: 'press_release', status: 'compromised', verdict_notes: 'Made the constitutional argument and won bipartisan support (57-43 guilty vote) but fell short of 2/3 needed for conviction.' },

  // ── DeSantis
  { politician_slug: 'ron-desantis', category: 'education', promise_text: 'Promised "Parents\' Rights in Education" — the "Don\'t Say Gay" law banning classroom discussion of sexual orientation.', source_type: 'press_release', status: 'kept', verdict_notes: 'Signed HB 1557 in March 2022. Later expanded to all grades. Faced legal challenges and Disney conflict.' },
  { politician_slug: 'ron-desantis', category: 'corporate_regulation', promise_text: 'Vowed to punish Disney for opposing the "Don\'t Say Gay" law.', source_type: 'press_release', status: 'compromised', verdict_notes: 'Dissolved Disney\'s Reedy Creek Improvement District, but Disney sued and eventually reached a settlement restoring many of its self-governing powers.' },

  // ── Greg Abbott
  { politician_slug: 'greg-abbott', category: 'immigration', promise_text: 'Launched Operation Lone Star to secure the Texas-Mexico border unilaterally.', source_type: 'press_release', status: 'kept', verdict_notes: 'Deployed Texas National Guard, installed razor wire, bused 100,000+ migrants to Democratic cities. Cost taxpayers $11B+.' },

  // ── Newsom
  { politician_slug: 'gavin-newsom', category: 'environment', promise_text: 'Signed executive order banning sale of new gas-powered cars by 2035.', source_type: 'press_release', status: 'stalled', verdict_notes: 'Executive order signed in 2020. Implementation in progress through CARB regulations but faces industry and legal challenges.' },
  { politician_slug: 'gavin-newsom', category: 'healthcare', promise_text: 'Promised single-payer healthcare for California.', source_type: 'campaign_speech', status: 'broken', verdict_notes: 'Despite campaign promises, Newsom did not push single-payer legislation through the California legislature.' },

  // ── Shapiro
  { politician_slug: 'josh-shapiro', category: 'criminal_justice', promise_text: 'Led the grand jury investigation exposing abuse by over 300 Catholic priests in Pennsylvania.', source_type: 'press_release', status: 'kept', verdict_notes: 'As AG, published the landmark 2018 grand jury report that led to criminal charges and national reform efforts.' },

  // ── Whitmer
  { politician_slug: 'gretchen-whitmer', category: 'economy', promise_text: 'Campaigned on "Fix the Damn Roads" infrastructure promise.', source_type: 'campaign_speech', status: 'compromised', verdict_notes: 'Road conditions improved with federal infrastructure money but original bonding proposal was blocked by the legislature.' },

  // ── Trump
  { politician_slug: 'donald-trump', category: 'immigration', promise_text: 'Promised Mexico would pay for a border wall.', source_type: 'campaign_speech', status: 'broken', verdict_notes: 'Mexico never paid for the wall. Partial wall was built using diverted military funds and congressional appropriations.' },
  { politician_slug: 'donald-trump', category: 'economy', promise_text: 'Promised to eliminate the national debt in 8 years.', source_type: 'interview', status: 'broken', verdict_notes: 'National debt increased by $7.8 trillion during Trump\'s first term, from $19.9T to $27.7T.' },
  { politician_slug: 'donald-trump', category: 'taxes', promise_text: 'Signed the Tax Cuts and Jobs Act, promising it would pay for itself through economic growth.', source_type: 'press_release', status: 'broken', verdict_notes: 'CBO estimated the TCJA added $1.9 trillion to the deficit over 10 years. Growth did not offset revenue losses.' },
  { politician_slug: 'donald-trump', category: 'executive_order', promise_text: 'Issued executive order withdrawing from the Paris Climate Agreement (first term, rejoined by Biden, withdrawn again in 2025).', source_type: 'press_release', status: 'kept', verdict_notes: 'Withdrew twice from the Paris Agreement. The U.S. is the only country to withdraw.' },

  // ── JD Vance
  { politician_slug: 'jd-vance', category: 'economy', promise_text: 'Called Trump "America\'s Hitler" in 2016, then became his VP.', source_type: 'other', status: 'broken', verdict_notes: 'Complete reversal — went from fierce Trump critic to running mate in less than 6 years.' },

  // ── Elon Musk
  { politician_slug: 'elon-musk', category: 'economy', promise_text: 'Promised to cut $2 trillion from federal spending through DOGE.', source_type: 'interview', status: 'stalled', verdict_notes: 'Initial claims of $2T in cuts, later revised down. Actual verified savings remain disputed. Mass firings of federal employees have been legally challenged.' },
  { politician_slug: 'elon-musk', category: 'other', promise_text: 'Promised to make Twitter/X a platform for free speech and reduce censorship.', source_type: 'press_release', status: 'compromised', verdict_notes: 'Reinstated banned accounts but also suspended journalists and accounts critical of him. Introduced paid verification that led to impersonation chaos.' },

  // ── RFK Jr.
  { politician_slug: 'robert-f-kennedy-jr', category: 'healthcare', promise_text: 'Promised to "Make America Healthy Again" by reforming food and pharmaceutical industries.', source_type: 'campaign_speech', status: 'stalled', verdict_notes: 'As HHS Secretary, has proposed removing fluoride from water and reviewing vaccine schedules. Most proposals face regulatory and legal hurdles.' },
]

export const NEW_CONNECTIONS = [
  // ── Thune
  { politician_slug: 'john-thune', company_name: 'AT&T', connection_type: 'campaign_donation', amount_cents: 38000000, amount_display: '$380,000', cycle: '2022', description: 'AT&T PAC and employees to Thune campaigns — Thune led telecom deregulation efforts', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00004572', source_type: 'opensecrets', is_verified: true },
  // ── Cotton
  { politician_slug: 'tom-cotton', company_name: 'Lockheed Martin', connection_type: 'campaign_donation', amount_cents: 28000000, amount_display: '$280,000', cycle: '2022', description: 'Lockheed Martin PAC and defense employees to Cotton campaigns — Cotton serves on Armed Services', source_url: 'https://www.opensecrets.org/politicians/industries?cid=N00033363', source_type: 'opensecrets', is_verified: true },
  // ── Scott (Tim)
  { politician_slug: 'tim-scott', company_name: 'Goldman Sachs', connection_type: 'campaign_donation', amount_cents: 42000000, amount_display: '$420,000', cycle: '2022', description: 'Goldman Sachs PAC and employees to Scott campaigns — Scott chairs Banking Committee', source_url: 'https://www.opensecrets.org/politicians/industries?cid=N00031782', source_type: 'opensecrets', is_verified: true },
  // ── Collins
  { politician_slug: 'susan-collins', company_name: 'Pfizer', connection_type: 'campaign_donation', amount_cents: 12000000, amount_display: '$120,000', cycle: '2020', description: 'Pfizer PAC and pharma employees to Collins campaigns — Collins on Health Committee', source_url: 'https://www.opensecrets.org/politicians/industries?cid=N00008251', source_type: 'opensecrets', is_verified: true },
  // ── Tuberville
  { politician_slug: 'tommy-tuberville', company_name: 'Raytheon', connection_type: 'stock_ownership', amount_cents: 5000000, amount_display: '$50,000+', cycle: '2022', description: 'Failed to properly disclose stock trades in defense companies while on Armed Services Committee', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00043505', source_type: 'stock_act', is_verified: true },
  // ── Blackburn
  { politician_slug: 'marsha-blackburn', company_name: 'AT&T', connection_type: 'campaign_donation', amount_cents: 65000000, amount_display: '$650,000', cycle: '2022', description: 'AT&T PAC and telecom industry to Blackburn — led fight against net neutrality', source_url: 'https://www.opensecrets.org/politicians/industries?cid=N00003105', source_type: 'opensecrets', is_verified: true },
  // ── Schumer
  { politician_slug: 'chuck-schumer', company_name: 'Goldman Sachs', connection_type: 'campaign_donation', amount_cents: 110000000, amount_display: '$1,100,000', cycle: '2022', description: 'Goldman Sachs PAC and employees — largest Wall Street donor to Schumer over career', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00001093', source_type: 'opensecrets', is_verified: true },
  { politician_slug: 'chuck-schumer', company_name: 'JPMorgan Chase', connection_type: 'campaign_donation', amount_cents: 82000000, amount_display: '$820,000', cycle: '2022', description: 'JPMorgan Chase PAC and employees to Schumer — career total from financial sector', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00001093', source_type: 'opensecrets', is_verified: true },
  // ── Rick Scott
  { politician_slug: 'rick-scott', company_name: 'Pfizer', connection_type: 'campaign_donation', amount_cents: 25000000, amount_display: '$250,000', cycle: '2022', description: 'Pharma industry to Scott — former hospital chain CEO, healthcare sector ties', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00043290', source_type: 'opensecrets', is_verified: true },
  // ── Trump
  { politician_slug: 'donald-trump', company_name: 'ExxonMobil', connection_type: 'industry_pac', amount_cents: 150000000, amount_display: '$1,500,000+', cycle: '2024', description: 'Oil and gas industry PAC support for Trump 2024 campaign and affiliated committees', source_url: 'https://www.opensecrets.org/2024-presidential-race', source_type: 'opensecrets', is_verified: true },
  // ── Musk / DOGE
  { politician_slug: 'elon-musk', company_name: 'Tesla', connection_type: 'stock_ownership', amount_cents: 700000000000, amount_display: '$70B+ (Tesla stake)', description: 'CEO and ~13% owner of Tesla. Potential conflicts with federal EV policies, EPA regulations, and NHTSA safety investigations while heading DOGE.', source_url: 'https://www.sec.gov/cgi-bin/browse-edgar?company=tesla', source_type: 'sec_filing', is_verified: true },
  // ── DeSantis
  { politician_slug: 'ron-desantis', company_name: 'Publix', connection_type: 'campaign_donation', amount_cents: 10000000, amount_display: '$100,000', cycle: '2022', description: 'Publix Super Markets heir Julie Fancelli donated to DeSantis. Publix received early COVID vaccine distribution priority in Florida.', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00035523', source_type: 'fec_filing', is_verified: true },
  // ── MTG
  { politician_slug: 'marjorie-taylor-greene', company_name: 'MyPillow', connection_type: 'campaign_donation', amount_cents: 500000, amount_display: '$5,000', cycle: '2022', description: 'MyPillow CEO Mike Lindell donated to MTG campaigns and related PACs', source_url: 'https://www.opensecrets.org/politicians/summary?cid=N00045417', source_type: 'fec_filing', is_verified: true },
  // ── Newsom
  { politician_slug: 'gavin-newsom', company_name: 'Alphabet', connection_type: 'campaign_donation', amount_cents: 45000000, amount_display: '$450,000', cycle: '2022', description: 'Google/Alphabet employees and PACs to Newsom campaigns and ballot measure efforts', source_url: 'https://cal-access.sos.ca.gov/', source_type: 'fec_filing', is_verified: true },
  // ── Abbott
  { politician_slug: 'greg-abbott', company_name: 'ExxonMobil', connection_type: 'campaign_donation', amount_cents: 55000000, amount_display: '$550,000', cycle: '2022', description: 'ExxonMobil and oil/gas industry to Abbott campaigns — Texas is the largest oil-producing state', source_url: 'https://www.opensecrets.org/', source_type: 'opensecrets', is_verified: true },
]
