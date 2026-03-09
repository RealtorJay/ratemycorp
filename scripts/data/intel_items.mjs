// ── Intel Feed Seed Data ────────────────────────────────────────────────────
// Social media posts (tweets, TikToks), news articles, and research reports
// for major companies. All data sourced from public records and reporting.
//
// item_type: tweet | instagram | tiktok | youtube | linkedin | reddit | news | press_release | research | report
// subject_type: company | ceo | public_discourse
// category: environmental | labor | consumer | legal | financial | regulatory | scandal | positive | neutral | other

export const INTEL_ITEMS = [

  // ════════════════════════════════════════════════════════════════════════
  // STARBUCKS
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'starbucks',
    item_type: 'news',
    subject_type: 'company',
    title: 'Starbucks Sued Over Toxic Chemicals in Decaf Coffee — Methylene Chloride, Benzene, Toluene Found',
    body: 'A class-action lawsuit filed January 13, 2026 by Hagens Berman alleges that Starbucks\' decaf house blend contains methylene chloride (22 ppb — EPA deems unsafe at any level), benzene (28 ppb — 23 ppb above EPA threshold), and toluene (87 ppb — not authorized as food ingredient). The suit also challenges Starbucks\' "100% Ethical Coffee Sourcing" claim.',
    source_url: 'https://www.hbsslaw.com/cases/starbucks-consumer-class-action',
    source_name: 'Hagens Berman',
    category: 'scandal',
    published_at: '2026-01-13',
    is_pinned: true,
  },
  {
    company_slug: 'starbucks',
    item_type: 'news',
    subject_type: 'company',
    title: 'What\'s Actually in Starbucks Decaf Coffee? Lab Test Results Revealed',
    body: 'Independent lab testing found three volatile organic compounds in Starbucks decaf coffee: methylene chloride is a known carcinogen used as an industrial solvent, benzene is classified as a Group 1 carcinogen by IARC, and toluene is not authorized for use as a food ingredient. Methylene chloride is commonly used in one popular decaffeination process.',
    source_url: 'https://www.seattletimes.com/business/starbucks/starbucks-sued-over-alleged-chemicals-in-decaf-coffee-farm-violations/',
    source_name: 'Seattle Times',
    category: 'consumer',
    published_at: '2026-01-14',
  },
  {
    company_slug: 'starbucks',
    item_type: 'research',
    subject_type: 'company',
    title: 'Starbucks: The Gap Between Image and Reality',
    body: 'Starbucks has built its brand on ethical sourcing and progressive values, but the January 2026 lawsuit reveals a pattern of marketing vs. reality. The company\'s "Committed to 100% Ethical Coffee Sourcing" claim on every package has been challenged by evidence of farm labor violations including child labor. Meanwhile, testing found carcinogens in its decaf products. This follows years of worker unionization battles — over 400 U.S. stores have voted to unionize since 2021, with the company facing hundreds of unfair labor practice charges from the NLRB.',
    source_url: 'https://topclassactions.com/lawsuit-settlements/lawsuit-news/starbucks-class-action-alleges-coffee-not-ethically-sourced-and-contains-industrial-solvents/',
    source_name: 'Top Class Actions',
    category: 'labor',
    published_at: '2026-01-15',
  },
  {
    company_slug: 'starbucks',
    item_type: 'tweet',
    subject_type: 'ceo',
    embed_url: 'https://x.com/BrianNiccol/status/1882433024116248753',
    title: 'Starbucks CEO Brian Niccol on company direction',
    category: 'neutral',
    published_at: '2025-01-23',
  },

  // ════════════════════════════════════════════════════════════════════════
  // BAYER / MONSANTO
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'bayer',
    item_type: 'news',
    subject_type: 'company',
    title: 'Bayer Proposes $7.25 Billion Roundup Settlement — 170,000 Cancer Lawsuits',
    body: 'Bayer proposed a $7.25 billion class settlement in February 2026 to resolve current and future Roundup cancer claims, receiving preliminary court approval on March 4, 2026. This follows ~$11 billion already paid. Individual payouts estimated at $10,000-$165,000. The U.S. Supreme Court is reviewing whether federal pesticide labeling law preempts state failure-to-warn claims.',
    source_url: 'https://www.statnews.com/2026/02/17/bayer-settlement-lawsuits-roundup-weedkiller-cancer/',
    source_name: 'STAT News',
    category: 'legal',
    published_at: '2026-02-17',
    is_pinned: true,
  },
  {
    company_slug: 'bayer',
    item_type: 'research',
    subject_type: 'company',
    title: 'Roundup & Glyphosate: The $18 Billion Cancer Problem',
    body: 'When Bayer acquired Monsanto in 2018 for $63 billion, it inherited what would become the most expensive product liability case in corporate history. IARC classified glyphosate as "probably carcinogenic" in 2015. Key verdicts include $2 billion (Georgia, April 2025) and $611 million upheld (Missouri, May 2025). Bayer\'s stock has lost over 70% of its value since the Monsanto acquisition. The $7.25 billion proposed settlement on top of $11 billion already paid brings total liability to over $18 billion — roughly 30% of the original acquisition price.',
    source_url: 'https://cen.acs.org/environment/pesticides/bayer-roundup-glyphosate-cancer-class-action-lawsuit-settlement/104/web/2026/03',
    source_name: 'Chemical & Engineering News',
    category: 'scandal',
    published_at: '2026-03-04',
  },

  // ════════════════════════════════════════════════════════════════════════
  // JOHNSON & JOHNSON
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'johnson-and-johnson',
    item_type: 'news',
    subject_type: 'company',
    title: 'J&J Loses Third Bankruptcy Attempt to Cap Talc Cancer Liability',
    body: 'Johnson & Johnson\'s proposed $8 billion bankruptcy settlement for talcum powder cancer claims was rejected in March 2025. All three bankruptcy attempts have failed. The company faces 67,115+ lawsuits — the largest active MDL in the U.S. — from people alleging Baby Powder was contaminated with asbestos, causing mesothelioma and ovarian cancer.',
    source_url: 'https://www.sokolovelaw.com/product-liability/talcum-powder/johnson-and-johnson/',
    source_name: 'Sokolove Law',
    category: 'legal',
    published_at: '2025-03-15',
    is_pinned: true,
  },
  {
    company_slug: 'johnson-and-johnson',
    item_type: 'news',
    subject_type: 'company',
    title: '$1.5 Billion Verdict Against J&J in Baltimore Talc Case',
    body: 'A Baltimore jury awarded $1.5 billion in December 2025 to plaintiffs alleging Johnson & Johnson\'s talcum powder caused their cancer. This follows a $966 million verdict in Los Angeles (October 2025) and a $65.5 million verdict in Minnesota (December 2025). Mesothelioma talc cases have increased over 100% since 2021.',
    source_url: 'https://www.drugwatch.com/talcum-powder/settlements/',
    source_name: 'DrugWatch',
    category: 'legal',
    published_at: '2025-12-10',
  },
  {
    company_slug: 'johnson-and-johnson',
    item_type: 'research',
    subject_type: 'company',
    title: 'J&J\'s Bankruptcy Strategy: Using the Legal System to Avoid Accountability',
    body: 'Johnson & Johnson created a subsidiary called LTL Management, transferred talc liabilities to it, then filed for bankruptcy — a controversial "Texas Two-Step" maneuver designed to cap payments to cancer victims. Federal courts have rejected this three times, calling it an abuse of the bankruptcy system. With 67,000+ pending claims, juries consistently finding against J&J, and verdicts reaching $1.5 billion, the company faces a liability potentially exceeding $50 billion if resolved individually.',
    source_url: 'https://www.sokolovelaw.com/product-liability/talcum-powder/lawsuit-updates/',
    source_name: 'Legal Analysis',
    category: 'legal',
    published_at: '2026-01-05',
  },

  // ════════════════════════════════════════════════════════════════════════
  // 3M — PFAS
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: '3m',
    item_type: 'news',
    subject_type: 'company',
    title: '3M Agrees to $10.3 Billion PFAS Settlement with U.S. Water Systems',
    body: '3M agreed to pay $10.3 billion over 13 years to settle claims that PFAS "forever chemicals" contaminated U.S. public water supplies. The company manufactured PFAS for decades and produced AFFF firefighting foam. PFOA was classified as a confirmed human carcinogen by IARC in 2023. 3M faces 15,213 active lawsuits.',
    source_url: 'https://www.torhoermanlaw.com/pfas-lawsuit/',
    source_name: 'TorHoerman Law',
    category: 'environmental',
    published_at: '2025-06-01',
    is_pinned: true,
  },
  {
    company_slug: '3m',
    item_type: 'research',
    subject_type: 'company',
    title: 'PFAS "Forever Chemicals": Why They\'re Called That and Why It Matters',
    body: 'PFAS (per- and polyfluoroalkyl substances) are called "forever chemicals" because they never break down in the environment. 3M manufactured them from the 1940s until 2025 for use in Scotchgard, non-stick coatings, food packaging, and firefighting foam. PFAS are now found in the blood of 98% of Americans. The EPA classifies PFOA and PFOS as likely carcinogens linked to kidney, thyroid, and liver cancer. 3M knew about health risks internally for decades before public disclosure.',
    source_url: 'https://www.drugwatch.com/pfas-lawsuits/',
    source_name: 'DrugWatch',
    category: 'environmental',
    published_at: '2025-09-15',
  },

  // ════════════════════════════════════════════════════════════════════════
  // DUPONT — PFAS
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'dupont',
    item_type: 'news',
    subject_type: 'company',
    title: 'DuPont, Chemours, Corteva to Pay New Jersey Up to $2 Billion for PFAS Contamination',
    body: 'DuPont and its spinoffs Chemours and Corteva agreed to pay New Jersey up to $2 billion ($875M cash + up to $1.2B remediation) for PFAS contamination of waterways and drinking water. DuPont manufactured PFOA (C8) for Teflon while internal documents showed the company knew about health risks for decades.',
    source_url: 'https://topclassactions.com/lawsuit-settlements/lawsuit-news/dupont-chemours-corteva-to-pay-new-jersey-up-to-2b-to-settle-pfas-claims/',
    source_name: 'Top Class Actions',
    category: 'environmental',
    published_at: '2026-01-02',
    is_pinned: true,
  },
  {
    company_slug: 'dupont',
    item_type: 'research',
    subject_type: 'company',
    title: 'Dark Waters: How DuPont Covered Up PFAS Contamination for Decades',
    body: 'The story of DuPont\'s PFAS cover-up was dramatized in the 2019 film "Dark Waters." Corporate lawyer Robert Bilott spent 20 years fighting DuPont after discovering that the company had been dumping PFOA into the Ohio River, contaminating the drinking water of 70,000 people near Parkersburg, West Virginia. Internal DuPont documents from the 1960s showed the company knew PFOA was toxic. A community health study linked PFOA exposure to six diseases including kidney and testicular cancer.',
    source_url: 'https://www.drugwatch.com/news/2025/08/04/new-jersey-secures-875-million-pfas-settlement-from-dupont-chemours/',
    source_name: 'DrugWatch',
    category: 'scandal',
    published_at: '2025-08-04',
  },

  // ════════════════════════════════════════════════════════════════════════
  // McDONALD'S
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'mcdonalds',
    item_type: 'news',
    subject_type: 'company',
    title: 'PFAS "Forever Chemicals" Found in McDonald\'s Food Packaging — Class Action Filed',
    body: 'Testing found PFAS "forever chemicals" in McDonald\'s food wrappers and packaging. A class-action lawsuit alleges McDonald\'s knew about PFAS contamination but continued using it. PFAS exposure is linked to kidney, thyroid, and liver cancer and accumulates permanently in the body.',
    source_url: 'https://www.aboutlawsuits.com/mcdonalds-pfas-chemicals-class-action/',
    source_name: 'AboutLawsuits.com',
    category: 'consumer',
    published_at: '2023-08-15',
  },
  {
    company_slug: 'mcdonalds',
    item_type: 'research',
    subject_type: 'public_discourse',
    title: 'TikTok vs Reality: Are McDonald\'s Fries Actually Carcinogenic?',
    body: 'Viral TikTok videos claim McDonald\'s food contains "cigarette ingredients" (acrylamide) that cause cancer. The reality: acrylamide is present in ALL fried starchy foods — potatoes, bread, coffee — not unique to McDonald\'s. Studies link high doses to cancer in animals, but there\'s no evidence of increased cancer risk in humans at food-consumption levels. The California Prop 65 warnings at McDonald\'s are a legal requirement, not a unique danger indicator. However, the separate PFAS issue in packaging IS a legitimate concern.',
    source_url: 'https://www.snopes.com/news/2023/12/04/acrilane-and-mcdonalds-fries/',
    source_name: 'Snopes',
    category: 'consumer',
    published_at: '2024-01-10',
  },

  // ════════════════════════════════════════════════════════════════════════
  // SHEIN — TikTok Verified
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'shein',
    item_type: 'news',
    subject_type: 'public_discourse',
    title: 'Shein Clothing Contains 428x Permitted Phthalate Levels — Regulators Confirm TikTok Claims',
    body: 'TikTok creators went viral warning about toxic chemicals in Shein products. Regulatory investigations confirmed the claims: South Korean authorities found a Shein shoe line containing 428 times permitted phthalate levels (linked to breast, colon, and prostate cancer). Health Canada recalled a Shein children\'s jacket with nearly 20x allowable lead. Greenpeace\'s November 2025 report confirmed hazardous chemicals remain present.',
    source_url: 'https://www.greenpeace.org/static/planet4-eu-unit-stateless/2025/11/3ad070d9-20251114_shameonyoushein.pdf',
    source_name: 'Greenpeace',
    category: 'scandal',
    published_at: '2025-11-14',
    is_pinned: true,
  },
  {
    company_slug: 'shein',
    item_type: 'research',
    subject_type: 'company',
    title: 'The True Cost of $5 Fashion: Shein\'s Chemical and Labor Problem',
    body: 'Shein produces over 7,000 new styles daily at rock-bottom prices. But the cost is externalized: toxic chemicals (phthalates, lead, formaldehyde) in clothing, forced labor allegations in supply chains, and environmental devastation. The company\'s business model depends on avoiding the regulatory costs that traditional retailers bear. With multiple countries investigating and products being recalled, Shein\'s ability to maintain its growth trajectory while operating outside safety norms is increasingly under threat.',
    source_url: 'https://www.euroconsumers.org/systemic-failures-in-product-compliance-on-temu-and-shein/',
    source_name: 'Euroconsumers',
    category: 'labor',
    published_at: '2025-06-20',
  },

  // ════════════════════════════════════════════════════════════════════════
  // TEMU — TikTok Verified
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'temu',
    item_type: 'news',
    subject_type: 'public_discourse',
    title: 'Two-Thirds of Temu Products Fail European Safety Standards — Norway Considers Ban',
    body: 'Euroconsumers testing found almost two-thirds of Temu products were non-compliant with safety standards. The Danish Consumer Council found phthalates in Temu plastic toys at 240 times above the legal limit. The European Commission opened an investigation, and Norway considered banning the marketplace entirely.',
    source_url: 'https://chemtrust.org/news/toxic-chemicals-temu/',
    source_name: 'CHEM Trust',
    category: 'consumer',
    published_at: '2025-03-20',
    is_pinned: true,
  },

  // ════════════════════════════════════════════════════════════════════════
  // ULTRA-PROCESSED FOOD LAWSUIT — Multiple Companies
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'pepsico',
    item_type: 'news',
    subject_type: 'company',
    title: 'San Francisco Sues 10 Food Giants Over Ultra-Processed Foods Linked to Cancer',
    body: 'San Francisco filed a first-of-its-kind lawsuit in December 2025 against PepsiCo, Kraft Heinz, Mondelez, Post Holdings, Coca-Cola, General Mills, Nestle, Kellogg/Mars, ConAgra, and Mars. A November 2025 JAMA Oncology study found ultra-processed food consumption is associated with a 45% increased risk of colorectal cancer.',
    source_url: 'https://www.npr.org/2025/12/03/g-s1-100212/san-francisco-sues-manufacturers-ultraprocessed-foods',
    source_name: 'NPR',
    category: 'legal',
    published_at: '2025-12-03',
    is_pinned: true,
  },
  {
    company_slug: 'coca-cola',
    item_type: 'news',
    subject_type: 'company',
    title: 'Coca-Cola Named in San Francisco Ultra-Processed Food Cancer Lawsuit',
    body: 'Coca-Cola is one of 10 food/beverage manufacturers sued by San Francisco in December 2025 over ultra-processed products linked to 45% increased colorectal cancer risk. The lawsuit alleges these companies knowingly produce addictive, harmful products.',
    source_url: 'https://sfcityattorney.org/san-francisco-city-attorney-chiu-sues-largest-manufacturers-of-ultra-processed-foods/',
    source_name: 'SF City Attorney',
    category: 'legal',
    published_at: '2025-12-03',
  },
  {
    company_slug: 'nestle',
    item_type: 'research',
    subject_type: 'company',
    title: 'Nestle: From Baby Formula Scandal to Ultra-Processed Food Lawsuit',
    body: 'Nestle has faced decades of controversy. In the 1970s-80s, the company was boycotted for aggressively marketing baby formula in developing countries, contributing to infant malnutrition and death. Today, Nestle is named in San Francisco\'s ultra-processed food lawsuit linked to cancer. The company also faces criticism for water extraction practices — bottling water from drought-stricken communities for pennies and selling it for dollars. As the world\'s largest food company, Nestle\'s practices set industry standards for better or worse.',
    source_url: 'https://sfcityattorney.org/san-francisco-city-attorney-chiu-sues-largest-manufacturers-of-ultra-processed-foods/',
    source_name: 'Analysis',
    category: 'consumer',
    published_at: '2025-12-10',
  },

  // ════════════════════════════════════════════════════════════════════════
  // STANLEY — TikTok Viral
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'stanley',
    item_type: 'research',
    subject_type: 'public_discourse',
    title: 'Stanley Cups & Lead: What TikTok Got Right and Wrong',
    body: 'In late 2023, TikTok lead safety advocate "Lead Safe Mama" discovered that Stanley cups contain lead-based solder (~25% lead). The discovery went viral with millions of views. Stanley confirmed lead exists but stated it is sealed beneath a protective stainless steel cap. Snopes and Earthjustice confirmed that as long as the bottom cover is intact, there is no meaningful lead exposure during normal use. The lesson: TikTok can surface real safety concerns, but context matters.',
    source_url: 'https://www.snopes.com/fact-check/stanley-cup-lead/',
    source_name: 'Snopes',
    category: 'consumer',
    published_at: '2023-12-15',
    is_pinned: true,
  },

  // ════════════════════════════════════════════════════════════════════════
  // APPLE
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'apple',
    item_type: 'tweet',
    subject_type: 'ceo',
    embed_url: 'https://x.com/tim_cook/status/1879947876498186395',
    title: 'Tim Cook on Apple\'s future',
    category: 'neutral',
    published_at: '2025-01-16',
  },
  {
    company_slug: 'apple',
    item_type: 'research',
    subject_type: 'company',
    title: 'Apple\'s Supply Chain: Innovation Built on Controversy',
    body: 'Apple generates over $380 billion in annual revenue but its supply chain has faced persistent criticism. Foxconn factories experienced worker suicides in 2010, leading to the installation of suicide nets. Reports of child labor in cobalt mines supplying Apple\'s battery materials emerged in 2016. Apple has improved auditing but critics say the company profits enormously from manufacturing labor it doesn\'t directly employ, creating a buffer of plausible deniability.',
    source_name: 'Analysis',
    category: 'labor',
    published_at: '2025-06-01',
  },

  // ════════════════════════════════════════════════════════════════════════
  // TESLA / ELON MUSK
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'tesla',
    item_type: 'tweet',
    subject_type: 'ceo',
    embed_url: 'https://x.com/elonmusk/status/1897054625055232355',
    title: 'Elon Musk on Tesla and DOGE',
    category: 'financial',
    published_at: '2025-03-04',
  },
  {
    company_slug: 'tesla',
    item_type: 'research',
    subject_type: 'ceo',
    title: 'Elon Musk\'s Political Role: CEO, Government Official, and Culture War Figure',
    body: 'Elon Musk occupies a unique position in American business: CEO of Tesla, SpaceX, and xAI while simultaneously leading DOGE (Department of Government Efficiency) under the Trump administration. His X (formerly Twitter) posts directly move Tesla\'s stock price. His political activities raise unprecedented conflicts of interest — Tesla receives billions in government contracts and subsidies while Musk advises on government spending cuts. No CEO in history has simultaneously run major corporations while holding de facto government power.',
    source_name: 'Analysis',
    category: 'regulatory',
    published_at: '2025-02-15',
  },

  // ════════════════════════════════════════════════════════════════════════
  // META
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'meta',
    item_type: 'research',
    subject_type: 'company',
    title: 'Meta\'s Mental Health Crisis: What the Internal Documents Revealed',
    body: 'Internal Meta research leaked by whistleblower Frances Haugen in 2021 showed the company knew Instagram was harmful to teen mental health, particularly among girls. Studies showed Instagram worsened body image issues for 1 in 3 teen girls. Despite this knowledge, Meta continued features designed to maximize engagement. Multiple state attorneys general have sued Meta, and federal legislation targeting children\'s social media use has been proposed. Meta has made some changes but critics argue they\'re insufficient.',
    source_name: 'Analysis',
    category: 'consumer',
    published_at: '2025-04-20',
  },

  // ════════════════════════════════════════════════════════════════════════
  // AMAZON
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'amazon',
    item_type: 'research',
    subject_type: 'company',
    title: 'Amazon Warehouse Injury Rates: Double the Industry Average',
    body: 'Amazon\'s warehouse injury rate is consistently double the industry average. The company\'s relentless productivity quotas and surveillance systems push workers past safe limits. OSHA has fined Amazon multiple times for unsafe conditions. The company employs over 1.5 million people, making it the second-largest private employer in the U.S. Worker organizing efforts have gained momentum, with the Amazon Labor Union winning a historic election at Staten Island in 2022.',
    source_name: 'Analysis',
    category: 'labor',
    published_at: '2025-05-10',
  },

  // ════════════════════════════════════════════════════════════════════════
  // SANOFI — Zantac
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'sanofi',
    item_type: 'news',
    subject_type: 'company',
    title: 'Zantac Cancer Claims Continue — Drug Pulled from Market Over Carcinogen NDMA',
    body: 'Sanofi\'s Zantac (ranitidine) heartburn medication was pulled from the market in April 2020 after the FDA found it formed NDMA, a probable human carcinogen, especially at elevated temperatures. Individual cancer claims continue in court. Hundreds of plaintiffs allege they developed bladder, stomach, and other cancers from long-term Zantac use.',
    source_url: 'https://www.lawsuit-information-center.com/zantac-lawsuit-settlement-amount.html',
    source_name: 'Lawsuit Information Center',
    category: 'legal',
    published_at: '2025-09-01',
  },

  // ════════════════════════════════════════════════════════════════════════
  // REGENERON — Dupixent
  // ════════════════════════════════════════════════════════════════════════
  {
    company_slug: 'regeneron',
    item_type: 'news',
    subject_type: 'company',
    title: 'Dupixent Linked to Cutaneous T-Cell Lymphoma — First Lawsuit Filed',
    body: 'In January 2026, a man sued Sanofi and Regeneron alleging he developed cutaneous T-cell lymphoma after using Dupixent (dupilumab) for atopic dermatitis. This represents an emerging area of pharmaceutical litigation that could expand significantly.',
    source_url: 'https://www.sokolovelaw.com/dangerous-drugs/dupixent/',
    source_name: 'Sokolove Law',
    category: 'legal',
    published_at: '2026-01-15',
  },
]
