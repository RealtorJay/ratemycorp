// ── Education, Career, Family, Financial, Net Worth seed data ─────────────────
// V2 deep intelligence data for key politicians

export const EDUCATION = [
  // ── Trump
  { politician_slug: 'donald-trump', institution: 'Kew-Forest School', degree: null, field_of_study: null, start_year: 1952, end_year: 1959 },
  { politician_slug: 'donald-trump', institution: 'New York Military Academy', degree: null, field_of_study: null, start_year: 1959, end_year: 1964 },
  { politician_slug: 'donald-trump', institution: 'Fordham University', degree: null, field_of_study: 'Business', start_year: 1964, end_year: 1966 },
  { politician_slug: 'donald-trump', institution: 'University of Pennsylvania (Wharton)', degree: 'B.S.', field_of_study: 'Economics', start_year: 1966, end_year: 1968 },
  // ── Biden
  { politician_slug: 'joe-biden', institution: 'Archmere Academy', degree: null, field_of_study: null, start_year: 1957, end_year: 1961 },
  { politician_slug: 'joe-biden', institution: 'University of Delaware', degree: 'B.A.', field_of_study: 'History & Political Science', start_year: 1961, end_year: 1965 },
  { politician_slug: 'joe-biden', institution: 'Syracuse University College of Law', degree: 'J.D.', field_of_study: 'Law', start_year: 1965, end_year: 1968 },
  // ── Sanders
  { politician_slug: 'bernie-sanders', institution: 'University of Chicago', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1960, end_year: 1964 },
  // ── Warren
  { politician_slug: 'elizabeth-warren', institution: 'University of Houston', degree: 'B.S.', field_of_study: 'Speech Pathology', start_year: 1966, end_year: 1970 },
  { politician_slug: 'elizabeth-warren', institution: 'Rutgers Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1973, end_year: 1976 },
  // ── McConnell
  { politician_slug: 'mitch-mcconnell', institution: 'University of Louisville', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1960, end_year: 1964, honors: 'With honors' },
  { politician_slug: 'mitch-mcconnell', institution: 'University of Kentucky College of Law', degree: 'J.D.', field_of_study: 'Law', start_year: 1964, end_year: 1967 },
  // ── Cruz
  { politician_slug: 'ted-cruz', institution: 'Princeton University', degree: 'A.B.', field_of_study: 'Public Policy', start_year: 1988, end_year: 1992, honors: 'cum laude' },
  { politician_slug: 'ted-cruz', institution: 'Harvard Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1992, end_year: 1995, honors: 'magna cum laude' },
  // ── AOC
  { politician_slug: 'alexandria-ocasio-cortez', institution: 'Boston University', degree: 'B.A.', field_of_study: 'International Relations & Economics', start_year: 2007, end_year: 2011, honors: 'cum laude' },
  // ── Pelosi
  { politician_slug: 'nancy-pelosi', institution: 'Trinity College (Washington, D.C.)', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1958, end_year: 1962 },
  // ── Schumer
  { politician_slug: 'chuck-schumer', institution: 'Harvard College', degree: 'A.B.', field_of_study: 'Government', start_year: 1967, end_year: 1971 },
  { politician_slug: 'chuck-schumer', institution: 'Harvard Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1971, end_year: 1974 },
  // ── Thune
  { politician_slug: 'john-thune', institution: 'Biola University', degree: 'B.A.', field_of_study: 'Business', start_year: 1979, end_year: 1983 },
  { politician_slug: 'john-thune', institution: 'University of South Dakota', degree: 'M.B.A.', field_of_study: 'Business Administration', start_year: 1983, end_year: 1984 },
  // ── Cotton
  { politician_slug: 'tom-cotton', institution: 'Harvard College', degree: 'A.B.', field_of_study: 'Government', start_year: 1995, end_year: 1999 },
  { politician_slug: 'tom-cotton', institution: 'Harvard Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1999, end_year: 2002 },
  // ── Tim Scott
  { politician_slug: 'tim-scott', institution: 'Presbyterian College', degree: null, field_of_study: 'Political Science', start_year: 1984, end_year: 1986, notes: 'Transferred' },
  { politician_slug: 'tim-scott', institution: 'Charleston Southern University', degree: 'B.S.', field_of_study: 'Political Science', start_year: 1986, end_year: 1988 },
  // ── Rand Paul
  { politician_slug: 'rand-paul', institution: 'Baylor University', degree: null, field_of_study: 'Biology', start_year: 1981, end_year: 1984, notes: 'Did not complete degree' },
  { politician_slug: 'rand-paul', institution: 'Duke University School of Medicine', degree: 'M.D.', field_of_study: 'Medicine (Ophthalmology)', start_year: 1984, end_year: 1988 },
  // ── Booker
  { politician_slug: 'cory-booker', institution: 'Stanford University', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1987, end_year: 1991 },
  { politician_slug: 'cory-booker', institution: 'University of Oxford', degree: 'M.A.', field_of_study: 'History', start_year: 1992, end_year: 1994, honors: 'Rhodes Scholar' },
  { politician_slug: 'cory-booker', institution: 'Yale Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1994, end_year: 1997 },
  // ── Jeffries
  { politician_slug: 'hakeem-jeffries', institution: 'Georgetown University', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1988, end_year: 1992 },
  { politician_slug: 'hakeem-jeffries', institution: 'New York University School of Law', degree: 'J.D.', field_of_study: 'Law', start_year: 1994, end_year: 1997 },
  // ── Raskin
  { politician_slug: 'jamie-raskin', institution: 'Harvard College', degree: 'A.B.', field_of_study: 'Government', start_year: 1979, end_year: 1983, honors: 'magna cum laude' },
  { politician_slug: 'jamie-raskin', institution: 'Harvard Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 1983, end_year: 1987 },
  // ── DeSantis
  { politician_slug: 'ron-desantis', institution: 'Yale University', degree: 'B.A.', field_of_study: 'History', start_year: 1997, end_year: 2001, honors: 'magna cum laude, Captain of baseball team' },
  { politician_slug: 'ron-desantis', institution: 'Harvard Law School', degree: 'J.D.', field_of_study: 'Law', start_year: 2002, end_year: 2005, honors: 'cum laude' },
  // ── Newsom
  { politician_slug: 'gavin-newsom', institution: 'Santa Clara University', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1985, end_year: 1989 },
  // ── Mike Johnson
  { politician_slug: 'mike-johnson', institution: 'Louisiana State University', degree: 'B.A.', field_of_study: 'Business Administration', start_year: 1990, end_year: 1995 },
  { politician_slug: 'mike-johnson', institution: 'Southern University Law Center', degree: 'J.D.', field_of_study: 'Law', start_year: 1995, end_year: 1998 },
  // ── Fetterman
  { politician_slug: 'john-fetterman', institution: 'Albright College', degree: 'B.A.', field_of_study: 'Finance', start_year: 1987, end_year: 1991 },
  { politician_slug: 'john-fetterman', institution: 'University of Connecticut', degree: 'M.B.A.', field_of_study: 'Business', start_year: 1993, end_year: 1995 },
  { politician_slug: 'john-fetterman', institution: 'Harvard Kennedy School', degree: 'M.P.P.', field_of_study: 'Public Policy', start_year: 1995, end_year: 1999 },
  // ── Wes Moore
  { politician_slug: 'wes-moore', institution: 'Johns Hopkins University', degree: 'B.A.', field_of_study: 'Political Science', start_year: 1998, end_year: 2001 },
  { politician_slug: 'wes-moore', institution: 'University of Oxford', degree: 'M.Litt.', field_of_study: 'International Relations', start_year: 2001, end_year: 2003, honors: 'Rhodes Scholar' },
  // ── Elon Musk
  { politician_slug: 'elon-musk', institution: "Queen's University (Ontario)", degree: null, field_of_study: 'Business', start_year: 1989, end_year: 1991 },
  { politician_slug: 'elon-musk', institution: 'University of Pennsylvania', degree: 'B.S.', field_of_study: 'Physics & Economics', start_year: 1991, end_year: 1995 },
  { politician_slug: 'elon-musk', institution: 'Stanford University', degree: null, field_of_study: 'Applied Physics (PhD)', start_year: 1995, end_year: 1995, notes: 'Dropped out after 2 days' },
]

export const CAREER_HISTORY = [
  // ── Trump
  { politician_slug: 'donald-trump', position_title: 'CEO', organization: 'The Trump Organization', sector: 'private', start_date: '1971-01-01', description: 'Real estate development, hotels, casinos, golf courses, branding' },
  { politician_slug: 'donald-trump', position_title: 'Host / Executive Producer', organization: 'The Apprentice (NBC)', sector: 'media', start_date: '2004-01-01', end_date: '2015-06-01', description: 'Reality TV host for 14 seasons' },
  { politician_slug: 'donald-trump', position_title: '45th President', organization: 'United States Government', sector: 'public', start_date: '2017-01-20', end_date: '2021-01-20' },
  // ── Biden
  { politician_slug: 'joe-biden', position_title: 'Public Defender', organization: 'Wilmington, Delaware', sector: 'legal', start_date: '1968-01-01', end_date: '1970-01-01' },
  { politician_slug: 'joe-biden', position_title: 'U.S. Senator', organization: 'U.S. Senate', sector: 'public', start_date: '1973-01-03', end_date: '2009-01-15', description: '36 years, Delaware' },
  { politician_slug: 'joe-biden', position_title: '47th Vice President', organization: 'United States Government', sector: 'public', start_date: '2009-01-20', end_date: '2017-01-20' },
  // ── McConnell
  { politician_slug: 'mitch-mcconnell', position_title: 'Chief Legislative Assistant', organization: 'Senator Marlow Cook', sector: 'public', start_date: '1968-01-01', end_date: '1970-01-01' },
  { politician_slug: 'mitch-mcconnell', position_title: 'Deputy Assistant Attorney General', organization: 'U.S. Department of Justice', sector: 'public', start_date: '1974-01-01', end_date: '1975-01-01' },
  { politician_slug: 'mitch-mcconnell', position_title: 'Judge-Executive', organization: 'Jefferson County, Kentucky', sector: 'public', start_date: '1977-01-01', end_date: '1984-01-01' },
  // ── Sanders
  { politician_slug: 'bernie-sanders', position_title: 'Carpenter / Documentary Filmmaker', organization: 'Self-employed', sector: 'private', start_date: '1964-01-01', end_date: '1981-01-01', description: 'Various jobs including carpenter, filmmaker, writer before entering politics' },
  { politician_slug: 'bernie-sanders', position_title: 'Mayor', organization: 'City of Burlington, Vermont', sector: 'public', start_date: '1981-03-01', end_date: '1989-04-01' },
  { politician_slug: 'bernie-sanders', position_title: 'U.S. Representative', organization: 'U.S. House of Representatives', sector: 'public', start_date: '1991-01-03', end_date: '2007-01-03', description: 'Vermont At-Large, 16 years' },
  // ── Warren
  { politician_slug: 'elizabeth-warren', position_title: 'Law Professor', organization: 'Harvard Law School', sector: 'academic', start_date: '1995-01-01', end_date: '2012-01-01', description: 'Leo Gottlieb Professor of Law, specializing in bankruptcy and commercial law' },
  { politician_slug: 'elizabeth-warren', position_title: 'Chair', organization: 'Congressional Oversight Panel (TARP)', sector: 'public', start_date: '2008-11-01', end_date: '2010-11-01' },
  { politician_slug: 'elizabeth-warren', position_title: 'Special Advisor', organization: 'Consumer Financial Protection Bureau', sector: 'public', start_date: '2010-09-01', end_date: '2011-08-01', description: 'Set up the CFPB before running for Senate' },
  // ── Pelosi
  { politician_slug: 'nancy-pelosi', position_title: 'Chair', organization: 'California Democratic Party', sector: 'public', start_date: '1981-01-01', end_date: '1983-01-01' },
  { politician_slug: 'nancy-pelosi', position_title: 'Finance Chair', organization: 'Democratic Senatorial Campaign Committee', sector: 'public', start_date: '1985-01-01', end_date: '1986-01-01' },
  // ── Elon Musk
  { politician_slug: 'elon-musk', position_title: 'Co-founder', organization: 'Zip2', sector: 'private', start_date: '1995-01-01', end_date: '1999-02-01', description: 'City guide software company, sold to Compaq for $307M' },
  { politician_slug: 'elon-musk', position_title: 'Co-founder / CEO', organization: 'X.com (became PayPal)', sector: 'private', start_date: '1999-03-01', end_date: '2002-10-01', description: 'Online payment company, sold to eBay for $1.5B' },
  { politician_slug: 'elon-musk', position_title: 'Founder / CEO', organization: 'SpaceX', sector: 'private', start_date: '2002-05-01', is_current: true, description: 'Space launch services, Starlink satellite internet' },
  { politician_slug: 'elon-musk', position_title: 'CEO', organization: 'Tesla, Inc.', sector: 'private', start_date: '2008-10-01', is_current: true, description: 'Electric vehicles, energy storage' },
  { politician_slug: 'elon-musk', position_title: 'Owner / CTO', organization: 'X (formerly Twitter)', sector: 'media', start_date: '2022-10-27', is_current: true, description: 'Acquired for $44B' },
  // ── Rick Scott
  { politician_slug: 'rick-scott', position_title: 'CEO', organization: 'Columbia/HCA', sector: 'private', start_date: '1987-01-01', end_date: '1997-07-01', description: 'Largest for-profit hospital chain; paid $1.7B in fraud fines' },
  // ── Schumer
  { politician_slug: 'chuck-schumer', position_title: 'U.S. Representative', organization: 'U.S. House of Representatives', sector: 'public', start_date: '1981-01-03', end_date: '1999-01-03', description: 'New York 9th/10th district, 18 years' },
  // ── DeSantis
  { politician_slug: 'ron-desantis', position_title: 'Navy JAG Officer', organization: 'U.S. Navy', sector: 'military', start_date: '2004-01-01', end_date: '2010-01-01', description: 'Served at Guantanamo Bay and with SEAL Team One in Iraq' },
  // ── Wes Moore
  { politician_slug: 'wes-moore', position_title: 'Paratrooper', organization: 'U.S. Army, 82nd Airborne Division', sector: 'military', start_date: '2005-01-01', end_date: '2007-01-01', description: 'Served in Afghanistan, Bronze Star recipient' },
  { politician_slug: 'wes-moore', position_title: 'CEO', organization: 'Robin Hood Foundation', sector: 'nonprofit', start_date: '2017-01-01', end_date: '2021-12-01', description: 'NYC anti-poverty nonprofit, largest in the city' },
]

export const FAMILY_CONNECTIONS = [
  // ── Trump
  { politician_slug: 'donald-trump', relation_type: 'spouse', relation_name: 'Melania Trump', occupation: 'Former model, First Lady', relevant_holdings: 'Published memoir, NFT collection' },
  { politician_slug: 'donald-trump', relation_type: 'child', relation_name: 'Donald Trump Jr.', occupation: 'Executive VP, Trump Organization', employer: 'Trump Organization', relevant_holdings: 'Trump Organization equity, media ventures' },
  { politician_slug: 'donald-trump', relation_type: 'child', relation_name: 'Ivanka Trump', occupation: 'Former Senior Advisor to the President', relevant_holdings: 'Fashion brand (dissolved), real estate investments' },
  { politician_slug: 'donald-trump', relation_type: 'in-law', relation_name: 'Jared Kushner', occupation: 'Founder, Affinity Partners', employer: 'Affinity Partners', relevant_holdings: '$2B investment from Saudi Arabia sovereign wealth fund, Kushner Companies real estate' },
  { politician_slug: 'donald-trump', relation_type: 'child', relation_name: 'Eric Trump', occupation: 'Executive VP, Trump Organization', employer: 'Trump Organization', relevant_holdings: 'Trump Organization operations' },
  // ── Biden
  { politician_slug: 'joe-biden', relation_type: 'spouse', relation_name: 'Jill Biden', occupation: 'Professor, Northern Virginia Community College', notes: 'First First Lady to hold a paying job while in the White House (Ed.D. from University of Delaware)' },
  { politician_slug: 'joe-biden', relation_type: 'child', relation_name: 'Hunter Biden', occupation: 'Attorney, Artist', relevant_holdings: 'Convicted of federal gun charges, pleaded guilty to tax evasion. Former Burisma board member ($50K/month). Pardoned by father December 2024.' },
  // ── Pelosi
  { politician_slug: 'nancy-pelosi', relation_type: 'spouse', relation_name: 'Paul Pelosi', occupation: 'Investor, Financial Capital Resources', relevant_holdings: 'Apple, Alphabet, Nvidia, Visa stock and options — trades with suspicious timing relative to congressional action. Assaulted in home invasion October 2022.' },
  // ── McConnell
  { politician_slug: 'mitch-mcconnell', relation_type: 'spouse', relation_name: 'Elaine Chao', occupation: 'Former Secretary of Transportation, former Secretary of Labor', relevant_holdings: 'Family shipping business (Foremost Group) with deep Chinese business ties. Father James Chao is a wealthy shipping magnate.' },
  // ── Musk
  { politician_slug: 'elon-musk', relation_type: 'parent', relation_name: 'Errol Musk', occupation: 'Engineer, Mine Owner', relevant_holdings: 'Zambian emerald mine ownership (disputed by Elon), South African real estate' },
  { politician_slug: 'elon-musk', relation_type: 'child', relation_name: 'Vivian Jenna Wilson', occupation: 'Student', notes: 'Transgender daughter who legally changed name to disassociate from father. Publicly critical of him.' },
  { politician_slug: 'elon-musk', relation_type: 'sibling', relation_name: 'Kimbal Musk', occupation: 'Entrepreneur, Restaurant owner', employer: 'The Kitchen Restaurant Group', relevant_holdings: 'Tesla board member, Big Green nonprofit' },
  // ── Manchin
  { politician_slug: 'joe-manchin', relation_type: 'spouse', relation_name: 'Gayle Manchin', occupation: 'Former FEMA Senior Official, former WV First Lady', notes: 'Former co-chair of the Appalachian Regional Commission' },
  { politician_slug: 'joe-manchin', relation_type: 'child', relation_name: 'Heather Bresch', occupation: 'Former CEO, Mylan Pharmaceuticals', relevant_holdings: 'Led EpiPen price increases from $100 to $600+. Received $19M compensation in 2016. MBA degree controversy (WVU retroactively awarded then rescinded).' },
  // ── Schumer
  { politician_slug: 'chuck-schumer', relation_type: 'child', relation_name: 'Jessica Schumer', occupation: 'Lobbyist', employer: 'Amazon', relevant_holdings: 'Registered Amazon lobbyist while father was Senate leader' },
  // ── Cornyn
  { politician_slug: 'john-cornyn', relation_type: 'spouse', relation_name: 'Sandy Hansen Cornyn', occupation: 'Attorney', notes: 'Former Texas Assistant Attorney General' },
  // ── Rick Scott
  { politician_slug: 'rick-scott', relation_type: 'spouse', relation_name: 'Ann Scott', occupation: 'Investor', relevant_holdings: 'Extensive stock portfolio. Scott placed assets in trust but wife\'s holdings raised conflict-of-interest questions during Medicare legislation votes.' },
  // ── JD Vance
  { politician_slug: 'jd-vance', relation_type: 'spouse', relation_name: 'Usha Chilukuri Vance', occupation: 'Attorney (former)', employer: 'Munger, Tolles & Olson (resigned)', relevant_holdings: 'Clerked for Chief Justice Roberts and Justice Kavanaugh. Resigned from law firm upon VP nomination. Yale Law classmate of Vance.' },
  // ── Newsom
  { politician_slug: 'gavin-newsom', relation_type: 'spouse', relation_name: 'Jennifer Siebel Newsom', occupation: 'Documentary filmmaker, First Partner', notes: 'Made films about gender inequality. Previously married to Kimberly Guilfoyle (now Don Jr.\'s partner), who was an SF DA and Fox News host.' },
]

export const NET_WORTH = [
  { politician_slug: 'donald-trump', year: 2024, estimated_min: 250000000000, estimated_max: 650000000000, source: 'Forbes / Bloomberg', notes: 'Highly variable due to Trump Media stock, real estate valuation disputes' },
  { politician_slug: 'elon-musk', year: 2024, estimated_min: 19000000000000, estimated_max: 25000000000000, source: 'Forbes Real-Time', notes: 'World\'s wealthiest person, driven by Tesla and SpaceX valuations' },
  { politician_slug: 'nancy-pelosi', year: 2023, estimated_min: 11400000000, estimated_max: 25200000000, source: 'OpenSecrets / House Disclosures', notes: 'Range from financial disclosures, primarily from Paul Pelosi investments' },
  { politician_slug: 'rick-scott', year: 2023, estimated_min: 25000000000, estimated_max: 50000000000, source: 'OpenSecrets', notes: 'Healthcare fortune from Columbia/HCA, invested heavily in own campaigns' },
  { politician_slug: 'mark-warner', year: 2023, estimated_min: 20000000000, estimated_max: 22000000000, source: 'OpenSecrets', notes: 'Telecom venture capital fortune (Nextel)' },
  { politician_slug: 'jb-pritzker', year: 2024, estimated_min: 350000000000, estimated_max: 360000000000, source: 'Forbes', notes: 'Hyatt Hotels heir, Pritzker family fortune' },
  { politician_slug: 'jim-justice', year: 2024, estimated_min: 130000000000, estimated_max: 180000000000, source: 'Forbes', notes: 'Coal and agriculture magnate' },
  { politician_slug: 'greg-abbott', year: 2023, estimated_min: 2000000000, estimated_max: 3000000000, source: 'OpenSecrets', notes: 'Includes personal injury settlement and investments' },
  { politician_slug: 'joe-biden', year: 2023, estimated_min: 800000000, estimated_max: 1000000000, source: 'OpenSecrets', notes: 'Book deals and speaking fees post-VP' },
  { politician_slug: 'bernie-sanders', year: 2023, estimated_min: 200000000, estimated_max: 350000000, source: 'OpenSecrets', notes: 'Book royalties from bestsellers, three homes' },
  { politician_slug: 'alexandria-ocasio-cortez', year: 2023, estimated_min: 2000000, estimated_max: 5000000, source: 'OpenSecrets', notes: 'Primarily from salary and modest savings' },
  { politician_slug: 'mitch-mcconnell', year: 2023, estimated_min: 3000000000, estimated_max: 3500000000, source: 'OpenSecrets', notes: 'Family shipping business through wife Elaine Chao' },
  { politician_slug: 'chuck-schumer', year: 2023, estimated_min: 100000000, estimated_max: 200000000, source: 'OpenSecrets', notes: 'Primarily from real estate and investments' },
  { politician_slug: 'elizabeth-warren', year: 2023, estimated_min: 700000000, estimated_max: 1200000000, source: 'OpenSecrets', notes: 'Cambridge MA home, Harvard salary savings, book royalties' },
  { politician_slug: 'ron-desantis', year: 2023, estimated_min: 120000000, estimated_max: 200000000, source: 'OpenSecrets', notes: 'Relatively modest for a governor, book advance and savings' },
  { politician_slug: 'josh-shapiro', year: 2023, estimated_min: 100000000, estimated_max: 200000000, source: 'OpenSecrets', notes: 'Primarily from legal career savings' },
  { politician_slug: 'gavin-newsom', year: 2023, estimated_min: 2000000000, estimated_max: 3000000000, source: 'Forbes', notes: 'PlumpJack wine/hospitality empire, Getty family connections' },
  { politician_slug: 'richard-blumenthal', year: 2023, estimated_min: 7000000000, estimated_max: 12000000000, source: 'OpenSecrets', notes: 'Married to heiress of Malkin real estate fortune (Empire State Building ownership)' },
  { politician_slug: 'dave-mccormick', year: 2024, estimated_min: 15000000000, estimated_max: 25000000000, source: 'Forbes', notes: 'Former Bridgewater Associates CEO' },
  { politician_slug: 'pete-ricketts', year: 2024, estimated_min: 18000000000, estimated_max: 22000000000, source: 'Forbes', notes: 'TD Ameritrade fortune, Chicago Cubs co-owner family' },
  { politician_slug: 'glenn-youngkin', year: 2023, estimated_min: 40000000000, estimated_max: 46000000000, source: 'Forbes', notes: 'Former Carlyle Group co-CEO' },
  { politician_slug: 'michael-mccaul', year: 2023, estimated_min: 10000000000, estimated_max: 12000000000, source: 'OpenSecrets', notes: 'Through wife\'s family (Lowry Mays/Clear Channel fortune)' },
  { politician_slug: 'scott-bessent', year: 2024, estimated_min: 60000000000, estimated_max: 80000000000, source: 'Forbes', notes: 'Key Square Group hedge fund fortune' },
  { politician_slug: 'doug-burgum', year: 2024, estimated_min: 100000000000, estimated_max: 120000000000, source: 'Forbes', notes: 'Great Plains Software sale to Microsoft, Kilbourne Group' },
]

export const FINANCIAL_DISCLOSURES = [
  // ── Pelosi stock trades
  { politician_slug: 'nancy-pelosi', disclosure_year: 2022, filing_type: 'periodic', asset_description: 'Apple Inc. (AAPL) Call Options', transaction_type: 'purchase', transaction_date: '2022-06-17', asset_value_min: 100000000, asset_value_max: 500000000, source_type: 'stock_act', notes: 'Paul Pelosi purchased call options before CHIPS Act hearings' },
  { politician_slug: 'nancy-pelosi', disclosure_year: 2022, filing_type: 'periodic', asset_description: 'NVIDIA Corp (NVDA) Call Options', transaction_type: 'purchase', transaction_date: '2022-07-26', asset_value_min: 100000000, asset_value_max: 500000000, source_type: 'stock_act', notes: 'Paul Pelosi purchased before semiconductor subsidy vote' },
  { politician_slug: 'nancy-pelosi', disclosure_year: 2023, filing_type: 'periodic', asset_description: 'Alphabet Inc. (GOOG) Stock', transaction_type: 'purchase', transaction_date: '2023-03-22', asset_value_min: 50000000, asset_value_max: 100000000, source_type: 'stock_act', notes: 'Purchased during antitrust investigation debates' },
  // ── Tuberville STOCK Act violations
  { politician_slug: 'tommy-tuberville', disclosure_year: 2022, filing_type: 'periodic', asset_description: 'Multiple defense stocks', transaction_type: 'purchase', asset_value_min: 5000000, asset_value_max: 50000000, source_type: 'senate_disclosure', notes: 'Over 130 STOCK Act violations — failed to disclose trades in defense stocks while on Armed Services Committee' },
  // ── Rick Scott
  { politician_slug: 'rick-scott', disclosure_year: 2022, filing_type: 'annual', asset_description: 'Blind trust assets', asset_value_min: 5000000000, asset_value_max: 20000000000, income_type: 'dividends', source_type: 'senate_disclosure', notes: 'Extensive portfolio in healthcare, energy, financial sectors' },
  // ── Trump
  { politician_slug: 'donald-trump', disclosure_year: 2024, filing_type: 'candidate', asset_description: 'Trump Media & Technology Group (DJT)', asset_value_min: 100000000000, asset_value_max: 500000000000, source_type: 'fec_filing', notes: 'Majority stake in Truth Social parent company, highly volatile stock' },
  { politician_slug: 'donald-trump', disclosure_year: 2024, filing_type: 'candidate', asset_description: 'Mar-a-Lago and Trump real estate portfolio', asset_value_min: 50000000000, asset_value_max: 200000000000, source_type: 'fec_filing', notes: 'Value disputed in NY fraud case — AG alleged Trump inflated values by billions' },
  // ── Musk
  { politician_slug: 'elon-musk', disclosure_year: 2024, filing_type: 'other', asset_description: 'Tesla Inc. common stock', asset_value_min: 5000000000000, asset_value_max: 8000000000000, source_type: 'sec_filing', notes: 'Approximately 13% of Tesla; value fluctuates with stock price' },
  { politician_slug: 'elon-musk', disclosure_year: 2024, filing_type: 'other', asset_description: 'SpaceX equity', asset_value_min: 7000000000000, asset_value_max: 9000000000000, source_type: 'other', notes: 'Private company, estimated based on latest funding round ($350B+ valuation)' },
]
