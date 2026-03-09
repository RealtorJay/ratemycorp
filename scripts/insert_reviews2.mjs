import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const SEED_USER = '00000000-0000-0000-0000-000000000099'

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const REVIEWS = [
  {
    company_name: "Nike",
    title: "Nike: Systemic Factory Labor Abuses, Supply Chain Exploitation & EEOC Subpoena Enforcement",
    body: `Nike's global supply chain has been the subject of sustained documented labor exploitation stretching from the 1990s through the present day. The company's own FY2023 Impact Report acknowledges its 120 finished-goods footwear suppliers operate across 11 countries, with 44% in Vietnam, 30% in Indonesia, and 20% in China — jurisdictions with documented wage theft and unsafe conditions.

The Asia Floor Wage Alliance and Global Labor Justice–International Labor Rights Forum published findings in 2023 that workers in Nike's supply chain were owed at least $9.3 million in unpaid wages from surveyed factories alone. A coalition of 20 unions filed an OECD complaint in 2023 alleging Nike's supply chain partners carried out 'unprecedented' layoffs, arbitrary pay cuts, and unpaid wages during and after the COVID-19 pandemic — with particular harm to Cambodian factory workers at Ramatex, which closed in June 2020 owing an estimated $1.4 million in severance.

Nike itself faced direct enforcement when the EEOC filed a subpoena enforcement action against the company — a rare action that required federal court intervention to compel document production regarding workplace discrimination complaints at Nike's Beaverton, Oregon headquarters. Separately, Nike was sued in a California class action (filed 2023) under Labor Code §2698 for failing to pay workers for all time worked and denying mandatory meal and rest periods at its retail operations.

In the well-documented RICO-adjacent case Nike, Inc. v. Kasky (U.S. Supreme Court, No. 02-575), Nike's deliberate public misrepresentations about labor conditions in its Asian factories — submitted as public statements to avoid regulatory scrutiny — reached the U.S. Supreme Court level. Nike ultimately settled the case for $1.5 million paid to the Fair Labor Association rather than face full trial on fraud grounds. The pattern reveals a corporation that has repeatedly prioritized marketing investments over genuine supply chain accountability.`,
    sources: "EEOC v. Nike — Subpoena Enforcement Action (D. Or.); Nike, Inc. v. Kasky, 539 U.S. 654 (2003), settled for $1.5M to Fair Labor Association; Asia Floor Wage Alliance & Global Labor Justice Report (2023) documenting $9.3M in unpaid wages; OECD Complaint filed by 20 unions (2023); Worker Rights Consortium Ramatex Report (2020); California Labor Code Class Action (2023); Nike FY2023 Impact Report (supply chain disclosures)",
    score_environment: 2,
    score_ethical: 2,
    score_consumer: 3,
    score_scandal: 2
  },
  {
    company_name: "Home Depot",
    title: "Home Depot: 2014 Data Breach Affecting 56M Customers, $17.5M Multistate AG Settlement & OSHA Worker Safety Failures",
    body: `Home Depot's September 2014 data breach remains one of the largest retail payment card breaches in U.S. history. Attackers exploited a vendor credential to access Home Depot's self-checkout systems across the U.S. and Canada for approximately five months, compromising payment card information for roughly 40 million customers and email addresses for an additional 53 million consumers. The company failed to detect the intrusion for five months despite possessing security tools that flagged suspicious activity.

In November 2020, Home Depot entered a $17.5 million multistate settlement with 46 state attorneys general (led by Texas AG Ken Paxton and others). Under the settlement, Home Depot was required to implement a comprehensive information security program, including designation of a Chief Information Security Officer reporting to senior leadership. A separate consumer class action settled for $13 million, with final approval granted by the U.S. District Court for the Northern District of Georgia.

Home Depot accumulated over $324 million in penalties across 362 violation records per Good Jobs First's Violation Tracker database. OSHA repeatedly cited Home Depot for serious and repeat violations: a 2014 OSHA citation at its North Kimball Avenue Chicago store resulted in charges for one willful violation — failing to remove a damaged powered industrial truck from service — along with repeat forklift inspection violations (OSHRC Docket No. 14-0423).

A California wage-and-hour class action (Case No. 3:19-cv-01766-AJB-AGS) was filed in 2019, and a separate $72.5 million wage settlement resolved claims that Home Depot failed to factor incentive bonuses into overtime calculations, affecting thousands of hourly workers.`,
    sources: "Multistate AG Data Breach Settlement — $17.5M (November 2020); Delaware AG Press Release (November 24, 2020); In re: The Home Depot Inc. Customer Data Security Breach Litigation (N.D. Ga.); OSHRC Docket No. 14-0423; Class Action Case No. 3:19-cv-01766-AJB-AGS; Violation Tracker (Good Jobs First) — $324M+ in total penalties; $72.5M overtime class settlement",
    score_environment: 2,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "CVS Health",
    title: "CVS Health: $5 Billion National Opioid Settlement & DOJ Complaint Alleging Illegal Opioid Prescription Filling",
    body: `CVS Health's role in the opioid epidemic represents one of the most costly and consequential corporate accountability failures in U.S. pharmacy history. In November 2022, CVS agreed to a $5 billion national opioid settlement — the largest portion of a combined $10 billion agreement alongside Walgreens — to resolve claims brought by state, local, and tribal governments across the United States. CVS's $5 billion payment was structured as payments over ten years. The settlement received sign-on confirmation from required state and subdivision participation thresholds in June 2023, making it enforceable.

Most critically, in December 2024 the DOJ and U.S. Department of Health and Human Services unsealed a federal complaint in the U.S. District Court for the District of Rhode Island alleging that from October 2013 to the present, CVS violated the federal Controlled Substances Act by filling prescriptions for dangerous quantities of opioids, dangerous drug combinations, and prescriptions that were invalid on their face, and then billed Medicare and Medicaid for these improper fills in violation of the False Claims Act. The government alleged CVS's internal metrics and performance evaluation systems created pressure on pharmacists to fill prescriptions quickly — overriding professional judgment about whether prescriptions were legitimate.

CVS also faced DEA administrative actions in 2016 resulting in a $22 million penalty for failure to maintain effective controls against diversion of Schedule II controlled substances in Florida pharmacies — requiring surrender of DEA registrations. Rhode Island's participation in the national settlement yielded over $56 million for that state alone.`,
    sources: "National Opioid Settlement — CVS $5 Billion (November 2, 2022); Rhode Island AG Press Release — $56M+ state share (2023); DOJ/HHS Federal Complaint, D.R.I. (unsealed December 2024) — False Claims Act / Controlled Substances Act violations; DEA Administrative Settlement — CVS Florida pharmacies, $22M (2016); HHS-OIG enforcement page; opioidsettlementtracker.com",
    score_environment: 2,
    score_ethical: 1,
    score_consumer: 1,
    score_scandal: 1
  },
  {
    company_name: "Target",
    title: "Target Corporation: 2013 Mega Data Breach — 41M Cards Compromised, $18.5M Multistate Settlement & $10M Consumer Fund",
    body: `The Target data breach of November–December 2013 remains a defining case study in corporate cybersecurity negligence. Attackers obtained network credentials from a third-party HVAC vendor, Fazio Mechanical Services, and used them to infiltrate Target's corporate network. The malware deployed on Target's point-of-sale systems scraped payment card track data during transaction authorization, ultimately exfiltrating payment card information from approximately 41 million customer accounts and contact information — including names, addresses, phone numbers, and email addresses — of more than 60 million customers.

Target's internal security team and the monitoring service FireEye generated automated alerts during the intrusion; those alerts were reportedly ignored. In May 2017, Target agreed to an $18.5 million multistate settlement with 47 states and the District of Columbia — at the time the largest data breach settlement of its kind — requiring a comprehensive information security program, a qualified CISO, and external security audits.

In March 2015, Target separately agreed to pay $10 million into a consumer class action settlement fund in the U.S. District Court for the District of Minnesota (In re: Target Corporation Customer Data Security Breach Litigation, MDL No. 14-2522), with final approval granted by the U.S. Court of Appeals for the Eighth Circuit in 2018. Target also paid approximately $67 million to Visa and $19 million to MasterCard to reimburse issuing banks. The company's total estimated breach costs exceeded $292 million, partially offset by $90 million in insurance recoveries.`,
    sources: "Multistate AG Settlement — $18.5M (May 2017); California AG Press Release (2017); In re: Target Corporation Customer Data Security Breach Litigation, MDL No. 14-2522 (D. Minn.) — $10M consumer fund; Eighth Circuit approval (2018); Visa settlement $67M; Mastercard settlement $19M; Total breach costs: $292M",
    score_environment: 3,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "Costco Wholesale",
    title: "Costco: EPA Clean Air Act Refrigerant Violations, NLRA Confidentiality Rule Violations & Gender Discrimination Settlement",
    body: `Costco Wholesale Corporation has faced regulatory enforcement actions across environmental compliance, labor law, and employment discrimination. In 2014, Costco entered a consent decree with the EPA and the U.S. Department of Justice (DOJ Case No. 90-5-2-1-09643) resolving Clean Air Act violations at 274 stores across California, Arizona, Nevada, and Hawaii. The EPA alleged Costco violated Section 608 of the Clean Air Act by failing to conduct required leak detection monitoring and recordkeeping for refrigerants used in grocery refrigeration systems. Costco agreed to pay a $335,000 civil penalty and invest approximately $2 million over three years in refrigerant leak detection improvements. The consent decree was lodged in the U.S. District Court for the Northern District of California.

On the labor front, the NLRB found in May 2025 that Costco violated Section 8(a)(1) of the National Labor Relations Act by maintaining an overly broad confidentiality policy for workplace investigations — instructing employees not to discuss employment terms with coworkers, unlawfully chilling protected concerted activity.

In a class action filed in 2004 and certified in 2012, over 1,250 current and former female Costco employees alleged the company systematically denied them promotions to assistant general manager and general manager positions because of their gender. Judge Edward M. Chen approved an $8 million class action settlement in May 2014. A separate EEOC harassment case resulted in a $250,000 jury verdict against Costco for failing to protect a female employee from a stalking male customer at its Glenview, Illinois warehouse.`,
    sources: "EPA Clean Air Act Consent Decree — Costco Wholesale Corporation (2014), DOJ Case No. 90-5-2-1-09643, $335,000 penalty; NLRB Section 8(a)(1) Violation Finding (May 2025); Ellis v. Costco Wholesale Corp., $8M gender discrimination settlement approved May 27, 2014 (N.D. Cal.); EEOC v. Costco Wholesale Corp. — $250,000 jury verdict (7th Cir., 2018); EPA enforcement page: epa.gov/enforcement",
    score_environment: 2,
    score_ethical: 3,
    score_consumer: 4,
    score_scandal: 3
  },
  {
    company_name: "Starbucks",
    title: "Starbucks: Record-Breaking NLRB Violations — 130+ Illegal Acts Found, 771 ULP Charges & Systemic Union Busting Campaign",
    body: `Starbucks Corporation has amassed what labor law experts have described as the most extensive documented record of National Labor Relations Act violations in the NLRB's 90-year history. Beginning in late 2021 when Workers United launched a unionization campaign in Buffalo, New York, Starbucks embarked on a systematic, documented campaign to suppress worker organizing across hundreds of locations.

By February 2024, NLRB regional offices had docketed 771 open or settled unfair labor practice charges against Starbucks or its law firm, Littler Mendelson. NLRB Administrative Law Judges had issued findings that Starbucks broke the law in 130 separate instances across six states, including the unlawful firing or forced resignation of 12 pro-union workers and the firing of two additional workers who cooperated with NLRB investigations.

On March 1, 2023, ALJ Robert Ringler issued a landmark decision finding Starbucks guilty of 'egregious and widespread misconduct' demonstrating 'a general disregard for employees' fundamental rights,' requiring reinstatement, back pay, and rare 'consequential damages' for financially harmed workers. The case McKinney ex rel. NLRB v. Starbucks Corp., No. 22-cv-2292 (W.D. Tenn.) resulted in a court-ordered temporary injunction requiring Starbucks to reinstate unlawfully fired workers.

Starbucks also faced UK Parliamentary scrutiny in 2012 after paying just £8.6 million in corporation tax over 14 years of UK operations despite generating £1.2 billion in UK revenues — using transfer pricing arrangements (royalties to Dutch subsidiary, intercompany coffee purchases from Switzerland) to shift profits offshore. Following a consumer boycott, Starbucks voluntarily paid £20 million in UK corporate tax as a reputational concession.`,
    sources: "NLRB — 771 ULP charges docketed (as of February 2024); ALJ Robert Ringler Decision (March 1, 2023) — 'egregious and widespread misconduct'; McKinney ex rel. NLRB v. Starbucks Corp., No. 22-cv-2292 (W.D. Tenn.); NLRB v. Starbucks Corp., No. 23-1953 (3d Cir. 2024); NLRB Cases 02-CA-303077 and 02-CA-304431 (Aug. 2024); U.S. Senate HELP Committee Majority Staff Report (2022); UK Parliamentary Public Accounts Committee hearing (November 2012); Starbucks £20M voluntary UK tax payment (2013)",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 3,
    score_scandal: 1
  },
  {
    company_name: "McDonald's",
    title: "McDonald's: NLRB Joint-Employer Settlement, $26M California Wage Theft Judgment & Systemic Franchise Labor Abuses",
    body: `McDonald's Corporation has been at the center of U.S. labor law debates for over a decade, driven by allegations that the company and its franchisees engaged in systematic wage theft and retaliation against organizing workers.

The most consequential NLRB proceeding began in 2015 when the SEIU filed complaints alleging McDonald's and its franchisees retaliated against hundreds of workers who participated in Fight for $15 strikes. The consolidated case was designated NLRB Case No. 02-CA-093893, and involved McDonald's USA LLC, McDonald's Restaurants of Illinois Inc., and 29 franchisee operators. After years of litigation, in 2019 the NLRB approved a settlement in which McDonald's franchisees established a $250,000 remediation fund for affected workers.

A California wage theft class action covering approximately 34,000 employees at corporate-owned locations resulted in a $26 million settlement approved by Los Angeles Superior Court. Workers alleged McDonald's failed to pay wages for all time worked, denied required meal and rest breaks, and failed to provide accurate wage statements — violations of California Labor Code provisions.

McDonald's was also cited across multiple jurisdictions for wage manipulation practices including shaving hours and failing to pay overtime premiums. The company's franchise model, which places corporate pressure on franchisees to maximize profit margins, has been widely documented as structurally enabling wage theft at scale. International franchise operations have separately faced consumer protection enforcement actions in the EU and Australia.`,
    sources: "NLRB Case No. 02-CA-093893 — McDonald's USA LLC joint-employer settlement; NLRB Board Approval of Settlement (2019); California Wage Theft Class Action — $26M settlement, approximately 34,000 employees (Los Angeles Superior Court); SEIU Fight for $15 ULP complaints (filed 2015); Violation Tracker: violationtracker.goodjobsfirst.org/parent/mcdonalds",
    score_environment: 2,
    score_ethical: 2,
    score_consumer: 3,
    score_scandal: 2
  },
  {
    company_name: "Disney",
    title: "Disney: $233M Wage Theft Settlement, $2.75M CCPA Record Fine & $43M Gender Pay Discrimination Resolution",
    body: `Walt Disney Company has faced a cascade of enforcement actions spanning wage theft, consumer privacy, and employment discrimination. In the largest wage theft settlement in California history, Orange County Superior Court approved on September 17, 2025 a $233 million settlement in Grace et al. v. Walt Disney Co. et al., Case No. 30-2019-01116850. The case covered 51,478 Disneyland Resort employees who were systematically underpaid under Anaheim's Measure L living wage ordinance — a voter-approved law requiring businesses receiving city tax subsidies to pay higher minimum wages. Judge William Claster found the settlement fair and adequate, distributing $179.575 million to class members and $17.475 million in civil penalties.

On February 11, 2026, California Attorney General Rob Bonta announced the largest civil penalty ever levied under the California Consumer Privacy Act: Disney was required to pay $2.75 million and comprehensively overhaul its opt-out mechanisms after the AG found Disney failed to honor consumer requests to opt out of the sale and sharing of personal information through third-party advertising technologies embedded in its apps and websites — violations of Cal. Civil Code §1798.100 et seq.

Additionally, the class action Rasmussen et al. v. The Walt Disney Company, Case No. 19STCV10974 (Los Angeles Superior Court), alleged systematic gender pay discrimination against female employees. In November 2024, Disney agreed to a $43.25 million settlement. The SEC previously settled disclosure charges against Disney (Release No. 34-50882) for failing to disclose relationships between the company and its directors.`,
    sources: "Grace et al. v. Walt Disney Co. et al., Case No. 30-2019-01116850 (Orange County Superior Court) — $233M settlement approved Sept. 17, 2025; California AG Rob Bonta Press Release (Feb. 11, 2026) — $2.75M CCPA penalty (largest ever); Rasmussen et al. v. Walt Disney Company, Case No. 19STCV10974 (L.A. Superior Court) — $43.25M gender pay settlement (Nov. 2024); SEC Release No. 34-50882 — director disclosure settlement",
    score_environment: 2,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "Philip Morris International",
    title: "Philip Morris: DOJ RICO Conviction for Tobacco Fraud Conspiracy, Corrective Statements & Decades of WHO Deception",
    body: `Philip Morris International and its U.S. affiliate Philip Morris USA (a subsidiary of Altria Group) were found liable in the landmark case United States v. Philip Morris USA Inc. et al., Docket No. 1:99-cv-02496 (D.D.C.), filed by the U.S. Department of Justice on September 22, 1999 under the Racketeer Influenced and Corrupt Organizations Act (18 U.S.C. §1961 et seq.).

On August 17, 2006, after a nine-month bench trial, U.S. District Judge Gladys Kessler issued a 1,683-page opinion finding that Philip Morris, Altria, R.J. Reynolds, and co-defendants engaged in a 50-year conspiracy to defraud the American public. The court found the defendants violated RICO by: (1) deliberately suppressing and misrepresenting research on the health effects of cigarettes and secondhand smoke; (2) denying the addictiveness of nicotine while internally manipulating nicotine delivery; (3) deliberately marketing cigarettes to children through the 'Marlboro Man' and 'Joe Camel' campaigns while publicly denying such targeting; and (4) coordinating through industry front organizations including the Tobacco Industry Research Committee and the Council for Tobacco Research.

Judge Kessler imposed injunctive remedies including corrective statement requirements ultimately implemented beginning October 1, 2023, with retailers required to display DOJ-approved corrective statements in over 220,000 retail locations for 21 months through June 30, 2025 — a remedy that required over 15 years of additional litigation and multiple appeals to enforce. The November 1998 Master Settlement Agreement between the tobacco industry and 46 state attorneys general required collectively paying a minimum of $206 billion over 25 years — the largest civil settlement in U.S. history. Altria/Philip Morris USA bore approximately 49% of the total.`,
    sources: "United States v. Philip Morris USA Inc. et al., No. 1:99-cv-02496 (D.D.C., filed Sept. 22, 1999); Judge Gladys Kessler Opinion (Aug. 17, 2006) — 1,683 pages, RICO liability finding; Corrective statements implementation Oct. 1, 2023–June 30, 2025 (220,000+ retail locations); Master Settlement Agreement (November 1998) — $246B industry total; DOJ Civil Division — Litigation Against Tobacco Companies; WHO Framework Convention on Tobacco Control interference findings",
    score_environment: 1,
    score_ethical: 1,
    score_consumer: 1,
    score_scandal: 1
  },
  {
    company_name: "Ford Motor Company",
    title: "Ford Motor Company: $165M NHTSA Consent Order for Recall Failures & EPA Clean Air Act Defeat Device Settlement",
    body: `Ford Motor Company has faced two of the most significant vehicle safety and emissions enforcement actions in U.S. automotive history. In 2024, the National Highway Traffic Safety Administration announced a consent order against Ford requiring the company to pay up to $165 million — the second-largest civil penalty in NHTSA's history — for failing to comply with federal recall requirements. The investigation found that Ford failed to recall vehicles with defective rearview cameras in a timely manner and provided inaccurate and incomplete recall information to NHTSA as required by the National Traffic and Motor Vehicle Safety Act.

The recall originated from a 2020 action covering more than 600,000 Ford trucks, SUVs, vans, and cars. Under the consent order terms: Ford must immediately pay a $65 million fine; an additional $55 million is deferred pending compliance; and $45 million must be invested in developing a safety data analytics system. The base term is three years.

Separately, the EPA reached a settlement with Ford Motor Company under the Clean Air Act in which Ford agreed to pay $7.8 million to resolve allegations that Ford had illegally installed a defeat device — software designed to detect emissions testing conditions and reduce emissions controls during testing while allowing higher emissions during normal driving — in certain vehicle models and at engine manufacturing facilities. The EPA enforcement page for the Ford settlement is published at epa.gov/enforcement/ford-motor-company-clean-air-act-settlement.`,
    sources: "NHTSA Consent Order — Ford Motor Company, $165M civil penalty (2024); NHTSA Press Release: 'Ford Consent Order; $165 Million Civil Penalty'; EPA Ford Motor Company Clean Air Act Settlement — $7.8M (epa.gov/enforcement/ford-motor-company-clean-air-act-settlement); National Traffic and Motor Vehicle Safety Act violations; NBC News (2024): 'Ford agrees to $165 million NHTSA penalty'",
    score_environment: 2,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "Berkshire Hathaway",
    title: "Berkshire Hathaway: PacifiCorp $575M Wildfire Settlement, FTC $896K Premerger Penalty & Subsidiary Environmental Violations",
    body: `Berkshire Hathaway's diversified conglomerate structure means its enforcement exposure is primarily borne through subsidiaries. The most recent and financially significant action involves PacifiCorp, the Berkshire Hathaway Energy-owned Pacific Northwest utility, which in February 2026 agreed to pay $575 million to resolve U.S. federal government damage claims related to six wildfires in Oregon and California that burned approximately 290,000 acres of federal land. Five fires — Archie Creek, Echo Mountain Complex, Slater, South Obenchain, and 242 fires — ignited during Labor Day weekend 2020, scorching 250,000 acres. The sixth, the McKinney Fire, started in July 2022 burning 39,000 additional acres.

The DOJ settlement resolves claims that PacifiCorp's transmission lines negligently caused the fires through inadequate maintenance and failure to de-energize lines during high fire-risk conditions. PacifiCorp faces additional exposure from private civil suits — wildfire damage claims have surged to $46 billion as of mid-2025, threatening the subsidiary's credit rating.

At the corporate level, the FTC and DOJ filed a civil complaint on August 20, 2014, in the U.S. District Court for the District of Columbia alleging Berkshire violated Hart-Scott-Rodino premerger notification requirements when it acquired voting securities of USG Corporation without the required filing — Berkshire agreed to pay an $896,000 civil penalty. BNSF Railway faces EPA scrutiny for hazardous materials spills from derailments. GEICO faced a D.C. Department of Insurance consent order for discriminatory auto insurance underwriting practices.`,
    sources: "PacifiCorp $575M DOJ wildfire settlement (February 2026); FTC/DOJ — Berkshire Hathaway $896,000 HSR civil penalty (August 20, 2014, D.D.C.); FTC Press Release: 'Berkshire Hathaway Inc. to Pay $896,000'; GEICO D.C. Department of Insurance consent order (2021–2022); BNSF EPA CERCLA derailment citations (2023); S&P Global wildfire claims reporting ($46B exposure); Violation Tracker: violationtracker.goodjobsfirst.org/parent/berkshire-hathaway",
    score_environment: 2,
    score_ethical: 3,
    score_consumer: 3,
    score_scandal: 2
  },
  {
    company_name: "Caterpillar",
    title: "Caterpillar: $740M IRS Tax Evasion Settlement, EPA Clean Air Act Violations & OFCCP Racial Discrimination Finding",
    body: `Caterpillar Inc. has faced substantial federal enforcement actions spanning tax evasion, environmental violations, and employment discrimination. The most financially significant was Caterpillar's October 2022 settlement with the IRS resolving all federal tax issues for fiscal years 2007 through 2016. The IRS had sought $2.3 billion in back taxes, interest, and penalties since 2015, targeting a scheme in which Caterpillar routed profits from its globally successful parts business through its Swiss subsidiary, CSARL (Caterpillar SARL), to take advantage of a Swiss tax rate of approximately 4–6% rather than the U.S. corporate rate.

Federal agents raided three Caterpillar offices in March 2017. The IRS ultimately agreed to a settlement of $740 million in total tax for 2007–2016, with final assessed tax of $490 million — crucially, the IRS waived all accuracy-related penalties. U.S. Senate Finance Committee Chairmen Ron Wyden and Sheldon Whitehouse subsequently requested DOJ answers regarding whether political pressure influenced the decision to forgo criminal prosecution and waive penalties.

The EPA reached a settlement with Caterpillar Inc. under the Clean Air Act for violations at its engine manufacturing facilities involving improper emissions testing and certification procedures, published at epa.gov/enforcement/caterpillar-inc-clean-air-act-settlement. The California Air Resources Board reached a separate settlement with Caterpillar in January 2023 for related emissions violations. The U.S. Department of Labor's OFCCP announced on May 21, 2024 that Caterpillar agreed to pay $800,000 to resolve allegations of racial discrimination in its hiring processes at its Decatur, Illinois facilities.`,
    sources: "Caterpillar IRS Settlement — $740M total ($490M assessed tax, penalties waived), October 2022, tax years 2007–2016; Caterpillar Inc. 8-K filing (September 8, 2022); DOL/OFCCP Press Release — $800,000 racial hiring discrimination settlement, Decatur IL (May 21, 2024); EPA Clean Air Act Settlement — Caterpillar Inc. (epa.gov/enforcement/caterpillar-inc-clean-air-act-settlement); California ARB Settlement — Caterpillar Inc. (January 2023); Senate Finance Committee Letters — Wyden/Whitehouse to DOJ (March 2024)",
    score_environment: 2,
    score_ethical: 1,
    score_consumer: 3,
    score_scandal: 1
  },
  {
    company_name: "Uber Technologies",
    title: "Uber: DOJ Data Breach Cover-Up Non-Prosecution Agreement, $148M AG Settlement, FTC Consent Orders & $100M NJ Driver Misclassification",
    body: `Uber Technologies has accumulated one of the most extensive federal and state enforcement records of any technology company. In July 2022, Uber entered a non-prosecution agreement with the U.S. Attorney's Office for the Northern District of California, in which the company admitted to covering up a massive 2016 data breach that exposed the personal information of 57 million riders and drivers. Rather than disclosing the breach as required by law, Uber paid the hackers $100,000 disguised as a 'bug bounty' payment. Former Uber Chief Security Officer Joseph Sullivan was convicted by a federal jury on October 5, 2022, of obstruction of justice and misprision of a felony. Uber separately paid $148 million in a 50-state settlement with all state attorneys general for the breach cover-up.

The FTC maintained two separate consent orders with Uber: FTC File No. 152-3082 required a $20 million judgment for deceptive earnings claims made to driver recruits (overstating median incomes by $8,000–$21,000 in specific cities); and FTC File No. 152-3054 (consent order C-4662), requiring a comprehensive privacy program after Uber employees used an internal tool called 'God View' to track consumers without authorization.

In 2022, Uber and Rasier LLC paid $100 million to the New Jersey Department of Labor and Workforce Development after an audit found Uber improperly classified hundreds of thousands of New Jersey drivers as independent contractors, denying them unemployment insurance contributions. The DOJ also reached a settlement requiring Uber to pay $1.7 million to over 65,000 riders with disabilities for discriminatory wait-time fees, resolving ADA violations (July 18, 2022).`,
    sources: "DOJ Non-Prosecution Agreement — Uber Technologies (N.D. Cal., July 2022); United States v. Joseph Sullivan — CSO conviction (October 5, 2022); 50-state AG settlement — $148M; FTC File No. 152-3082 — $20M consent order (2017); FTC File No. 152-3054, Consent Order C-4662 (2018); NJ DOL/AG Press Release — $100M driver misclassification (2022); DOJ OPA — $1.7M ADA disability discrimination settlement (July 18, 2022)",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 2,
    score_scandal: 1
  },
  {
    company_name: "Visa",
    title: "Visa Inc.: DOJ Antitrust Monopolization Suit (2024), $5.54B Merchant Interchange Settlement & Debit Market Dominance Charges",
    body: `Visa Inc. faces the most significant antitrust challenge in its corporate history following the U.S. Department of Justice's filing of a civil antitrust complaint on September 24, 2024. The case, United States v. Visa Inc., Case No. 1:24-CV-7214 (S.D.N.Y.), alleges that Visa has unlawfully maintained a monopoly over the U.S. debit card network market in violation of Section 2 of the Sherman Act.

Visa controls more than 60% of all U.S. debit card transactions, processing approximately $3.8 trillion in annual debit card volume. The DOJ complaint alleges Visa used its dominant market position to: (1) enter into exclusionary agreements with banks and fintech companies that incentivized routing debit transactions exclusively through Visa's network; (2) paid billions of dollars in 'incentives' to merchants and banks on condition they not route transactions away from Visa to competing networks; and (3) suppressed competition from PIN debit networks, mobile payment providers, and new entrants by threatening to withdraw routing incentives.

This follows Visa's participation in the massive merchant interchange class action, In re Payment Card Interchange Fee and Merchant Discount Antitrust Litigation, MDL No. 1:05-md-01720 (E.D.N.Y.), in which Visa and Mastercard (along with more than 25 issuing banks) agreed to a combined settlement of approximately $5.54 billion to compensate merchants for anticompetitive interchange fees charged from January 2004 through January 2019. The DOJ contends Visa's exclusionary practices cost U.S. merchants and consumers billions of dollars annually in artificially elevated network fees.`,
    sources: "United States v. Visa Inc., Case No. 1:24-CV-7214 (S.D.N.Y., filed September 24, 2024) — Sherman Act Section 2 monopolization; DOJ Press Release: 'Justice Department Sues Visa for Monopolizing Debit Markets' (September 24, 2024); In re Payment Card Interchange Fee and Merchant Discount Antitrust Litigation, MDL No. 1:05-md-01720 (E.D.N.Y.) — $5.54B settlement; Second Circuit upheld settlement; NPR coverage (September 24, 2024)",
    score_environment: 3,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "Mastercard",
    title: "Mastercard: €570M EU Antitrust Fine, $5.54B U.S. Interchange Settlement & DOJ Sherman Act Consent Decree",
    body: `Mastercard Incorporated has been the subject of major antitrust enforcement actions on both sides of the Atlantic. In January 2019, the European Commission fined Mastercard €570,566,000 (approximately $648 million USD) for restricting competition in cross-border card payment services, violating EU antitrust rules under Article 101 of the Treaty on the Functioning of the European Union. The EC investigation (opened April 2013, Case AT.40049 — Mastercard II) found that Mastercard's rules required acquiring banks to apply the interchange fees of the country where the merchant was located — preventing merchants in high-fee countries from obtaining lower fees offered by banks in other EU member states. Mastercard received a 10% reduction in the fine for cooperating with the investigation.

In the United States, Mastercard was co-defendant in In re Payment Card Interchange Fee and Merchant Discount Antitrust Litigation, MDL No. 1:05-md-01720 (E.D.N.Y.), along with Visa and over 25 issuing banks. A 2019 settlement of approximately $5.54 billion compensated merchants — Mastercard's share was approximately $1.25 billion. The underlying claims concerned anticompetitive agreements that artificially elevated interchange fees paid by merchants from January 2004 to January 2019.

A prior DOJ consent decree addressed Mastercard's merchant agreement rules under Section 1 of the Sherman Act. In 2025, the European Commission announced a new investigation into Visa and Mastercard fees, signaling continued regulatory scrutiny. The combined antitrust liability across EU and U.S. jurisdictions exceeds $2 billion.`,
    sources: "European Commission Fine — Case AT.40049 (Mastercard II), €570,566,000 (January 22, 2019); European Commission Press Release IP-19-582; In re Payment Card Interchange Fee and Merchant Discount Antitrust Litigation, MDL No. 1:05-md-01720 (E.D.N.Y.) — $5.54B total settlement; Second Circuit upheld settlement; DOJ Sherman Act consent decree; European Commission new investigation (2025)",
    score_environment: 3,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 2
  },
  {
    company_name: "PayPal Holdings",
    title: "PayPal: CFPB $25M Enforcement Action for Illegal Credit Enrollment, Venmo FTC Settlement & FinCEN Compliance Failures",
    body: `PayPal Holdings, Inc. and its subsidiaries have faced a series of consumer financial protection enforcement actions. In May 2015, the CFPB filed a complaint and proposed consent order against PayPal, Inc. and its subsidiary Bill Me Later, Inc. (Civil Action No. 1:15-cv-01426-RDB, D. Md.) for illegally signing up consumers for its PayPal Credit product without their knowledge or authorization. The CFPB alleged PayPal: enrolled consumers in PayPal Credit without their clear consent during account sign-up; failed to honor promotional financing offers it advertised; and mishandled billing disputes by providing incorrect information to consumers and delaying credit payments. PayPal agreed to pay $15 million in consumer redress and a $10 million civil money penalty — $25 million total — and overhaul its credit enrollment and dispute resolution practices.

The FTC separately reached a settlement with PayPal (In the Matter of PayPal, Inc., FTC File No. 162-3102) regarding its Venmo subsidiary, resolving allegations that Venmo made deceptive representations about the privacy and security of consumer financial data and failed to disclose the full implications of Venmo's default public transaction settings. Venmo agreed to a comprehensive privacy program and biennial independent audits.

In the money transmission space, PayPal has faced state-level FinCEN-adjacent compliance investigations regarding its cryptocurrency trading platform and foreign exchange operations. PayPal also challenged the CFPB's Prepaid Card Rule in PayPal, Inc. v. CFPB, No. 21-5057 (D.C. Cir. 2023), with the D.C. Circuit vacating certain short-form disclosure requirements in 2024.`,
    sources: "CFPB Consent Order — PayPal/Bill Me Later, Civil Action No. 1:15-cv-01426-RDB (D. Md., May 19, 2015) — $25M ($15M redress + $10M penalty); CFPB Press Release: 'CFPB Takes Action Against PayPal for Illegally Signing Up Consumers for Unwanted Online Credit'; FTC File No. 162-3102 — Venmo/PayPal privacy settlement; PayPal, Inc. v. CFPB, No. 21-5057 (D.C. Cir. 2023); consumerfinance.gov/enforcement/actions/bill-me-later-paypal",
    score_environment: 3,
    score_ethical: 2,
    score_consumer: 2,
    score_scandal: 3
  },
  {
    company_name: "Dow",
    title: "Dow Inc.: EPA Multi-Law Settlement, Bhopal Legacy Liability & PFAS Contamination Exposure",
    body: `Dow Inc. (the post-2019 spinoff from DowDuPont) carries substantial environmental enforcement liability, both directly and through its predecessor entities. The EPA published a settlement with The Dow Chemical Company resolving alleged violations of the Clean Air Act (CAA), Clean Water Act (CWA), and Resource Conservation and Recovery Act (RCRA) at Dow's chemical manufacturing facilities, with Dow agreeing to pay a $2.5 million civil penalty and implement operational improvements. The EPA enforcement page is published at epa.gov/enforcement/dow-chemical-company-settlement.

The most significant legacy liability involves Union Carbide Corporation — acquired by Dow Chemical in 2001 — and the 1984 Bhopal, India disaster, in which a methyl isocyanate gas leak from Union Carbide's pesticide plant killed at least 3,787 people immediately and caused over 500,000 injuries according to Indian government estimates, with long-term casualties estimated at over 15,000–20,000. Indian courts convicted Union Carbide India Limited (UCIL) of negligence; a $470 million settlement was reached in 1989 between Union Carbide Corporation and the Indian government.

Regarding PFAS, the broader DowDuPont ecosystem — particularly through spinoffs Chemours, DuPont, and Corteva — agreed to a $1.185 billion PFAS settlement (MDL No. 2:18-mn-2873, D.S.C.) related to PFAS drinking water contamination, and Dow's operations have faced state PFAS monitoring requirements. Dow's chemical manufacturing facilities across the Gulf Coast have accumulated hundreds of millions in environmental penalties over decades of operations.`,
    sources: "EPA Dow Chemical Company Settlement (epa.gov/enforcement/dow-chemical-company-settlement) — $2.5M civil penalty (CAA/CWA/RCRA); Union Carbide Bhopal Settlement — $470M (1989); Bhopal death toll: Indian government estimates 3,787 immediate; PFAS MDL No. 2:18-mn-2873 (D.S.C.) — $1.185B DuPont/Chemours/Corteva settlement (related corporate family); Business and Human Rights Centre — Union Carbide/Dow Bhopal litigation tracking",
    score_environment: 1,
    score_ethical: 1,
    score_consumer: 2,
    score_scandal: 1
  },
  {
    company_name: "Morgan Stanley",
    _exact: true,
    title: "Morgan Stanley: $249M DOJ/SEC Block Trading Fraud Settlement, $35M Data Protection Fine & FINRA Penalties",
    body: `Morgan Stanley has faced a series of significant enforcement actions across multiple regulatory fronts. The most financially consequential was the January 2024 resolution of the block trading fraud investigation. Morgan Stanley entered a non-prosecution agreement with the U.S. Attorney's Office for the Southern District of New York, agreeing to pay more than $153 million to the United States — comprising $72.5 million in forfeiture of illegal profits, $64 million in restitution to sellers harmed by the disclosures, and a $16.9 million fine — plus a simultaneous SEC settlement of approximately $96 million, bringing the combined total to $249 million.

The investigation found that Morgan Stanley's equity syndicate desk, led by Managing Director Pawan Passi, disclosed material non-public information about impending block trades to select buy-side clients from at least June 2018 through August 2021, allowing those clients to trade ahead of the blocks at the expense of the sellers. The SEC charged Morgan Stanley and Pawan Passi with fraud under Section 10(b) of the Securities Exchange Act (SEC Press Release No. 2024-6, January 12, 2024). Passi separately entered a deferred prosecution agreement and agreed to a $250,000 personal penalty.

In September 2022, Morgan Stanley Smith Barney LLC agreed to pay a $35 million SEC penalty for failing to adequately protect the personal information of approximately 15 million customers — including improper disposal of thousands of decommissioned hard drives and servers that were later resold by an unauthorized vendor. In 2024, FINRA fined Morgan Stanley $1.6 million for failing to close out municipal securities transactions in violation of MSRB Rule G-12 over a five-year period.`,
    sources: "DOJ USAO-SDNY Non-Prosecution Agreement — Morgan Stanley (January 12, 2024) — $153M+ federal payment; SEC Press Release No. 2024-6 (January 12, 2024) — Fraud charges, Morgan Stanley/Pawan Passi; Combined $249M resolution (DOJ + SEC); SEC $35M data protection penalty (September 20, 2022) — 15 million customers; FINRA $1.6M fine — MSRB Rule G-12 municipal securities failures (2024)",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 2,
    score_scandal: 1
  },
  {
    company_name: "Cigna",
    title: "Cigna Group: $172M False Claims Act Settlement for Medicare Advantage Fraud & Systematic Risk Adjustment Manipulation",
    body: `Cigna Group agreed to pay $172,294,350 to resolve False Claims Act allegations announced by the U.S. Department of Justice. The settlement resolved two separate tranches of allegations. The primary component — $135,294,350 — resolved a government investigation (E.D. Pa.) finding that Cigna submitted and failed to delete inaccurate and unsupported diagnosis codes for Medicare Advantage enrollees to the Centers for Medicare and Medicaid Services (CMS) for risk adjustment purposes.

Medicare Advantage insurers receive higher payments from CMS for sicker patients, and the government alleged Cigna systematically added diagnosis codes during chart review processes — identifying 'new' diagnoses — without ensuring those diagnoses were actually valid and clinically supported in the patient's medical record, resulting in inflated risk adjustment payments.

The second tranche — $37 million — resolved qui tam whistleblower claims under United States ex rel. Cutler v. Cigna Corp. et al., No. 3:21-cv-00748 (M.D. Tenn.), which specifically targeted unsupported diagnoses generated through Cigna's home visit program, in which nurses visited Medicare Advantage members at home and added diagnoses that were not subsequently treated or addressed by the member's treating physician. The whistleblower, a former Cigna employee, was awarded $8,140,000 from the home visit settlement tranche. The Cigna resolution is part of a broader DOJ enforcement focus on Medicare Advantage risk adjustment fraud that has yielded nearly $2 billion in False Claims Act healthcare settlements in FY2022 alone.`,
    sources: "DOJ OPA Press Release: 'Cigna Group to Pay $172 Million to Resolve False Claims Act Allegations'; USAO-EDPA Press Release; United States ex rel. Cutler v. Cigna Corp. et al., No. 3:21-cv-00748 (M.D. Tenn.) — $37M qui tam; Primary settlement — $135,294,350 (E.D. Pa. investigation); HHS-OIG enforcement page; Whistleblower award — $8,140,000; FY2022 DOJ healthcare FCA collections — nearly $2B",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 1,
    score_scandal: 1
  },
  {
    company_name: "Elevance Health",
    title: "Elevance Health (Anthem): $115M Data Breach Settlement, DOJ False Claims Act Medicare Fraud Suit & 2025 Kickback Complaint",
    body: `Elevance Health, Inc. (formerly Anthem Inc.) has faced major enforcement actions on multiple fronts: cybersecurity, Medicare fraud, and anti-kickback violations. In February 2015, Anthem disclosed the largest healthcare data breach in U.S. history — attackers accessed a database containing records for approximately 78.8 million current and former members and employees, obtaining Social Security numbers, birth dates, health care ID numbers, home addresses, email addresses, and employment information.

On August 16, 2018, U.S. District Court Judge Lucy Koh (N.D. Cal.) granted final approval of a $115 million class action settlement in In re Anthem, Inc. Data Breach Litigation — the largest data breach class action settlement in history at that time. Anthem separately agreed to pay $39.5 million in a multistate AG settlement announced in June 2020, resolving a coalition investigation led by New York Attorney General Letitia James (which yielded $13.45 million for New York State alone).

On the Medicare fraud front, the DOJ sued Anthem in March 2020 under the False Claims Act, alleging Anthem's risk adjustment practices caused more than $100 million in Medicare Advantage overpayments. A federal judge ruled the case must proceed. Most recently, on May 1, 2025, the DOJ filed a 217-page complaint (No. 21-cv-11777, D. Mass.) naming Elevance Health alongside Aetna and Humana, alleging the companies paid hundreds of millions of dollars in illegal kickbacks to insurance brokers from 2016 through at least 2021 to steer Medicare beneficiaries into their Medicare Advantage plans, violating the Anti-Kickback Statute and the False Claims Act.`,
    sources: "In re Anthem, Inc. Data Breach Litigation (N.D. Cal.) — $115M settlement approved August 16, 2018; Multistate AG Settlement — $39.5M (June 2020); NY AG Letitia James Press Release; DOJ False Claims Act complaint against Anthem (March 2020) — $100M+ Medicare Advantage overpayments; DOJ Complaint No. 21-cv-11777 (D. Mass., filed May 1, 2025) — kickback/False Claims Act allegations",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 1,
    score_scandal: 1
  },
  {
    company_name: "UnitedHealth Group",
    title: "UnitedHealth Group: DOJ False Claims Act Suit Alleging $7.2B+ Medicare Advantage Overpayments & Change Healthcare Cyberattack",
    body: `UnitedHealth Group faces the largest active Medicare fraud enforcement action in U.S. history. The DOJ intervened in a whistleblower case — United States ex rel. Poehling v. UnitedHealth Group, Inc. (C.D. Cal.) — alleging UHG engaged in a systematic scheme to submit unsupported and inaccurate diagnosis codes for Medicare Advantage enrollees to obtain inflated risk adjustment payments from CMS. The government alleged Medicare paid UnitedHealth more than $7.2 billion in excess payments from 2009 through 2016 based on fraudulent coding. A key component involves UHG's 'chart review' programs, in which company nurses reviewed members' medical records to add new diagnoses — generating additional revenue — while doing nothing to actually treat those conditions.

Compounding the Medicare fraud exposure, UnitedHealth Group suffered the most catastrophic cyberattack in U.S. healthcare history on February 21, 2024. ALPHV/BlackCat ransomware breached Change Healthcare — a health technology subsidiary of UHG's Optum division — exploiting the absence of multi-factor authentication on a Citrix remote access portal. The breach disrupted claims processing across the U.S. healthcare system for weeks, affecting an estimated one-third of all Americans' health records and causing approximately $2.9 billion in downstream costs. UHG ultimately paid a $22 million ransom.

The Senate Finance Committee summoned UHG CEO Andrew Witty to testify on May 1, 2024, where he confirmed the basic MFA security failure. HHS Office for Civil Rights launched a HIPAA investigation (45 C.F.R. Parts 160, 164). The American Hospital Association estimated the attack caused $1 billion per month in additional costs to the hospital sector.`,
    sources: "United States ex rel. Poehling v. UnitedHealth Group Inc. (C.D. Cal.) — DOJ intervention; $7.2B alleged overpayments (2009–2016); Change Healthcare cyberattack — February 21, 2024; Senate Finance Committee hearing — CEO Andrew Witty testimony (May 1, 2024); HHS OCR HIPAA investigation (2024); $22M ransom payment confirmed by UHG; American Hospital Association — $1B/month cost estimate; DOJ criminal investigation re: Antitrust Division (2024)",
    score_environment: 3,
    score_ethical: 1,
    score_consumer: 1,
    score_scandal: 1
  },
  {
    company_name: "Procter & Gamble",
    title: "Procter & Gamble: EPA Air Pollution Settlement, $8M Benzene Aerosol Class Action & FTC Anticompetitive Acquisition Challenges",
    body: `Procter & Gamble Company has accumulated regulatory enforcement exposure across environmental compliance, product safety, and antitrust law. On the environmental front, the EPA settled with Procter & Gamble Manufacturing Company in April 1996 under the Clean Air Act, penalizing the company $381,000 for installing methanol emissions control equipment eight years late at its Sacramento, California facility. The California Air Resources Board subsequently reached a settlement with P&G regarding Consumer Products Regulation violations: P&G self-disclosed that between 2001 and 2004 its fine fragrance products exceeded the required 75% VOC (volatile organic compound) limit, resulting in excess air pollutant emissions.

In 2022, P&G faced a major product safety crisis when FDA testing found elevated levels of benzene — a known human carcinogen — in certain Old Spice and Secret brand aerosol products. P&G agreed to an $8 million class action settlement (MDL Case No. 2:22-MD-03025, S.D. Ohio) to resolve consumer claims that the company failed to disclose benzene contamination in its dry shampoo, antiperspirant, and deodorant aerosol sprays.

The FTC has twice challenged P&G acquisitions on antitrust grounds: in 2005, the FTC imposed a consent order on the $57 billion Gillette acquisition requiring divestiture of Rembrandt teeth whitening, Crest SpinBrush, and Right Guard deodorant businesses; and in December 2020, the FTC filed suit to block P&G's acquisition of Billie, Inc. women's razor brand (FTC File No. 2010099), alleging P&G was using its dominant market position to eliminate a growing competitive threat — P&G ultimately abandoned the acquisition.`,
    sources: "EPA/P&G Air Pollution Settlement — $381,000 (April 1, 1996, Sacramento CA); California ARB Settlement — P&G VOC violations 2001–2004 (self-disclosed); P&G Benzene Class Action MDL No. 2:22-MD-03025 (S.D. Ohio) — $8M settlement; FTC Consent Order — P&G/Gillette Acquisition (September 2005); FTC Complaint — P&G/Billie Inc. Acquisition (December 2020), FTC File No. 2010099; Violation Tracker: violationtracker.goodjobsfirst.org/parent/procter-and-gamble",
    score_environment: 2,
    score_ethical: 3,
    score_consumer: 2,
    score_scandal: 3
  },
]

async function getCompanyId(name) {
  const { data } = await sb
    .from('companies')
    .select('id')
    .ilike('name', `%${name.split(' ')[0]}%`)
    .limit(5)
  if (!data || data.length === 0) return null
  // Try exact match first
  const { data: exact } = await sb
    .from('companies')
    .select('id, name')
    .ilike('name', `%${name}%`)
    .limit(3)
  if (exact && exact.length > 0) return exact[0].id
  return data[0].id
}

async function main() {
  let inserted = 0, skipped = 0, errors = 0

  for (const r of REVIEWS) {
    // Find company — search by full name first, then first word
    let { data: companies } = await sb
      .from('companies')
      .select('id, name')
      .ilike('name', `%${r.company_name}%`)
    if (!companies || companies.length === 0) {
      const result = await sb
        .from('companies')
        .select('id, name')
        .ilike('name', `%${r.company_name.split(' ')[0]}%`)
      companies = result.data
    }

    if (!companies || companies.length === 0) {
      console.log(`SKIP (no company): ${r.company_name}`)
      skipped++
      continue
    }

    // Find best match — prefer exact substring match of full company name
    let company = companies.find(c => c.name.toLowerCase().includes(r.company_name.toLowerCase()))
    if (!company) company = companies.find(c => c.name.toLowerCase().includes(r.company_name.toLowerCase().split(' ')[0]))
    if (!company) company = companies[0]

    console.log(`Inserting for ${company.name} (${company.id}): ${r.title.substring(0, 60)}...`)

    const avg = Math.round((r.score_environment + r.score_ethical + r.score_consumer + r.score_scandal) / 4)
    const { error } = await sb.from('reviews').upsert({
      company_id: company.id,
      user_id: SEED_USER,
      headline: r.title,
      body: r.body,
      sources: r.sources,
      environmental: r.score_environment,
      ethical_business: r.score_ethical,
      consumer_trust: r.score_consumer,
      scandals: r.score_scandal,
      overall: avg,
    }, { onConflict: 'company_id,user_id' })

    if (error) {
      console.error(`ERROR: ${r.company_name}: ${error.message}`)
      errors++
    } else {
      console.log(`  OK`)
      inserted++
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${errors} errors`)
}

main()
