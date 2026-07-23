/**
 * client-config.js
 * ─────────────────────────────────────────────────────────────
 * Mind+Machine™ — Multi-Tenant Client Configuration Engine
 *
 * PURPOSE
 * This file is the single source of truth for all client-specific
 * data. Every other Netlify function imports from here instead of
 * hardcoding anything. Adding a new client in future means:
 *   1. Add their environment variables to Netlify
 *   2. Add one entry to CLIENT_REGISTRY below
 *   3. Zero other files need to change
 *
 * SECURITY
 * Nothing sensitive lives here. All passwords, logos, and display
 * names are read from Netlify environment variables at runtime.
 * This file is safe to store in GitHub.
 *
 * UPLOAD TO: netlify/functions/lib/client-config.js
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

// ─── CLIENT REGISTRY ─────────────────────────────────────────
// One entry per client. Keys like TF and RX map to your Netlify
// environment variable suffixes (PASSWORD_CLIENT_TF, etc.)
// To add a new client later: add one entry here + env vars on Netlify.

const CLIENT_REGISTRY = ['TF', 'RX'];

// ─── RSS FEEDS ───────────────────────────────────────────────
// These are the news sources for each client.
// Completely separate lists — no duplication.

const RSS_FEEDS_TF = [
  // Top Competitor Press Releases
  'https://www.cvshealth.com/news/press-releases.html',
  'https://www.optum.com/en/about-us/news.html',
  'https://www.evernorth.com/press-releases',
  'https://www.meritain.com/news/',
  'https://www.carelonrx.com/perspectives',
  'https://www.primetherapeutics.com/read',
  'https://magellanhealth.mediaroom.com/',
  'https://www.elevancehealth.com/newsroom',
  'https://www.anthem.com/press',
  'https://newsroom.cigna.com/latest-press-releases',
  'https://www.unitedhealthgroup.com/newsroom.html',
  'https://www.uhc.com/news-articles',
  'https://www.medimpact.com/clients/resources/press-releases',
  'https://www.employershealthco.com/resource-center/',
  'https://secure.proactrx.com/resources/news/',
  // Secondary Competitor News
  'https://www.judi.health/press',
  'https://www.smithrx.com/news',
  'https://smithrx.com/blog',
  'https://medone-rx.com/news/all-stories',
  'https://www.rightwayhealthcare.com/news',
  'https://affirmedrx.com/pharmacy-benefit-manager/',
  'https://crumdalespecialty.com/news/',
  'https://www.ringmastertech.com/news-press-releases/',
  'https://www.empirxhealth.com/category/news/',
  'https://innovativerxstrategies.com/',
  'https://www.nfp.com/about-nfp/newsroom/',
  'https://truveris.com/tag/newsroom/',
  'https://www.welldyne.com/news-and-insights/',
  'https://liviniti.com/news-insights/',
  'https://truerx.com/',
  'https://www.truescripts.com/news-and-events',
  'https://vytlone.com/blog/',
  'https://aon.mediaroom.com/',
  'https://www.coretrustpg.com/',
  // BCBS Affiliates
  'https://www.bcbstx.com/provider/education/education/news',
  'https://mediacenter.bcbsal.org/media-releases',
  'https://mediacenter.bcbsnc.com/news',
  'https://www.bcbsil.com/newsroom/news-releases',
  'https://www.highmark.com/newsroom/press-releases',
  'https://www.bcbsm.mibluedaily.com/categories/our-news',
  'https://capbluecross.mediaroom.com/',
  // Industry / Regulatory Sources
  'https://www.managedhealthcareexecutive.com/news',
  'https://www.beckerspayer.com/',
  'https://www.cms.gov/about-cms/contact/newsroom',
  'https://www.biopharmadive.com/topic/drug-pricing/',
  'https://phrma.org/en/Blog',
  'https://www.ftc.gov/news-events',
  'https://www.hhs.gov/',
  'https://www.reuters.com/',
  'https://www.kff.org/search/?post_type=press-release',
  'https://ncpa.org/news#releases',
  'https://www.forvismazars.us/forsights',
  'https://healthnewsillinois.com/category/press-releases/',
  'https://insurancenewsnet.com/topics/employee-health-benefits-news-articles',
  'https://www.jdsupra.com/topics/health-care-providers/',
  'https://drugstorenews.com/news',
  'https://www.fiercehealthcare.com/payers',
  'https://www.businesswire.com/portal/site/home/news/industry/?vnsId=175107',
  'https://www.aha.org/news',
  'https://www.forbes.com/healthcare/',
  'https://www.medicaleconomics.com/news',
  'https://www.benefitspro.com',
  'https://www.morningstar.com/news/pr-newswire',
];

const RSS_FEEDS_RX = [
  // Primary competitor news sources for RxBenefits
  'https://lucyrx.com/news/',
  'https://investors.goodrx.com/news-and-events/press-releases',
  'https://www.truescripts.com/blog',
  'https://aon.mediaroom.com/',
  'https://www.coretrustpg.com/news/news-home',
  'https://medone-rx.com/news',
  'https://www.rightwayhealthcare.com/news',
  'https://www.bcbsm.mibluedaily.com/categories/our-news',
  'https://www.highmark.com/newsroom/press-releases',
  'https://www.bcbsil.com/newsroom/news-releases',
  'https://www.cvshealth.com/news.html',
  'https://mediacenter.bcbsal.org/media-releases',
  'https://www.carelonrx.com/perspectives',
  'https://www.optum.com/en/about-us/news.html',
  'https://www.meritain.com/news/',
  'https://www.judi.health/press',
  'https://magellanhealth.mediaroom.com/home',
  'https://www.elevancehealth.com/newsroom',
  'https://www.anthem.com/press',
  'https://www.unitedhealthgroup.com/newsroom.html',
  'https://newsroom.cigna.com/latest-press-releases',
  'https://www.uhc.com/news-articles',
  'https://www.evernorth.com/press-releases',
  'https://smithrx.com/blog',
  'https://www.cvshealth.com/news/press-releases.html',
  'https://secure.proactrx.com/resources/news/',
  'https://www.mymatrixx.com/',
  'https://www.emblemhealth.com/news',
  'https://www.keenan.com/knowledge-center/news-and-insights/',
  'https://affirmedrx.com/pharmacy-benefit-manager/',
  'https://www.medimpact.com/clients/resources',
  'https://truveris.com/tag/newsroom/',
  'https://news.blueshieldca.com/news/news-releases',
  'https://www.empirxhealth.com/category/news/',
  'https://slate-rx.com/resources/news-events/',
  'https://crumdalespecialty.com/news/',
  'https://www.welldyne.com/news-and-insights/',
  'https://liviniti.com/news-insights/',
  'https://www.ringmastertech.com/news-press-releases/',
];

// ─── COMPETITORS ─────────────────────────────────────────────

const COMPETITORS_TF = {
  primary: [
    'CVS Caremark', 'OptumRx', 'MedImpact', "Employer's Health",
    'United Healthcare', 'Aetna', 'Cigna Healthcare', 'Elevance Health',
    'Capital Rx', 'Carelon', 'Express Scripts', 'Prime Therapeutics',
    'Magellan Health', 'UMR', 'Anthem', 'CVS Health',
  ],
  secondary: [
    'Smith Rx', 'MedOne Rx', 'Rightway Rx', 'Aon Rx Coalition',
    'Coretrust', 'TrueScripts', 'Liviniti', 'Mercer Coalition',
    'ProAct', 'Kennan Pharmacy Purchasing Coalition', 'AffirmedRx',
    'Maxor', 'EmpiRx', 'Innovative Rx Strategies', 'National CooperativeRx',
    'NFP', 'SlateRx', 'TrueRx', 'Welldyne', 'Capital Rx',
    'Lucy Rx', 'Elevance/Carelon Rx', 'Employers Health', 'Navitus',
    'ProAct Rx', 'Mercer Rx Coalition', 'NFP Rx Solutions',
    'WTW Collaborative', 'Health Action Council', 'RxCare Alliance',
  ],
  bcbsAffiliates: [
    'BCBS TX', 'BCBS AL', 'BCBS IL', 'BCBS NC',
    'Highmark BCBS', 'BCBS MI', 'Capital BCBS',
  ],
  consultants: [
    'Crumdale', 'Risk International', 'Rx-DNA', 'S & S Consulting',
    'Truveris', 'Ringmaster', 'Rx-DNA',
  ],
  parentCompanies: [
    'CVS Health Corporation', 'United Health Group',
    'The Cigna Group', 'MedImpact Holdings',
  ],
};

const COMPETITORS_RX = {
  primary: [
    'Aetna', 'Capital Rx', 'Carelon Rx', 'Cigna', 'CVS Caremark',
    'Elevance Health', 'Express Scripts', 'MedImpact', 'Optum Rx',
    'UMR', 'UNC Health Pharmacy', 'UnitedHealth Group', 'Employers Health Coalition',
    'MagellanRx',
  ],
  secondary: [
    'Rightway', 'Affirmedrx', 'BCBS IL', 'BCBS TX', 'LucyRx', 'Medone',
    'SmithRx', 'Allumarx', 'Aon Rx', 'Capital Rx', 'Coretrust', 'Empi Rx',
    'Liviniti', 'Maxor', 'National Cooperative Rx', 'NFP', 'proact', 'proactrx',
    'slaterx', 'truerx', 'truescripts', 'truveris', 'welldyne', 'Navitus',
    'WTW Collaborative', 'Health Action Council', 'RxCare Alliance', 'Highmark',
    'RxLogic',
  ],
};

// ─── SEARCH STRINGS ──────────────────────────────────────────

const SEARCH_STRINGS_TF = {
  competitorNews: [
    'CVS Health + news', 'Aetna + news', 'Anthem + news', 'Medimpact + news',
    'Optumrx + news', 'Employers Health + news', 'Cigna Healthcare + news',
    'United Healthcare + news', 'Capital Rx + news', 'Carelon Rx + news',
    'Elevance Health + news', 'Express Scripts + news', 'Prime Therapeutics + news',
    'Magellan health + news', 'blue cross blue shield + news', 'UMR + news',
    'CVS Caremark + news',
  ],
  biosimilars: [
    'CVS Health + biosimilars', 'Aetna + biosimilars', 'Anthem + biosimilars',
    'Medimpact + biosimilars', 'Optumrx + biosimilars', 'Employers Health + biosimilars',
    'Cigna Healthcare + biosimilars', 'United Healthcare + biosimilars',
    'Capital Rx + biosimilars', 'Carelon Rx + biosimilars', 'Elevance Health + biosimilars',
    'Express Scripts + biosimilars', 'Prime Therapeutics + biosimilars',
    'Magellan health + biosimilars', 'blue cross blue shield + biosimilars',
    'UMR + biosimilars', 'CVS Caremark + biosimilars',
  ],
  drugPricing: [
    'CVS Health + drug pricing', 'Aetna + drug pricing', 'Anthem + drug pricing',
    'Medimpact + drug pricing', 'Optumrx + drug pricing', 'Employers Health + drug pricing',
    'Cigna Healthcare + drug pricing', 'United Healthcare + drug pricing',
    'Capital Rx + drug pricing', 'Carelon Rx + drug pricing',
    'Elevance Health + drug pricing', 'Express Scripts + drug pricing',
    'Prime Therapeutics + drug pricing', 'Magellan health + drug pricing',
    'blue cross blue shield + drug pricing', 'UMR + drug pricing',
    'CVS Caremark + drug pricing',
  ],
  ftc: [
    'CVS Health + FTC', 'Aetna + FTC', 'Anthem + FTC', 'Medimpact + FTC',
    'Optumrx + FTC', 'Employers Health + FTC', 'Cigna Healthcare + FTC',
    'United Healthcare + FTC', 'Capital Rx + FTC', 'Carelon Rx + FTC',
    'Elevance Health + FTC', 'Express Scripts + FTC', 'Prime Therapeutics + FTC',
    'Magellan health + FTC', 'blue cross blue shield + FTC', 'UMR + FTC',
    'CVS Caremark + FTC',
  ],
  partnerships: [
    'CVS Health + partnerships', 'Aetna + partnerships', 'Anthem + partnerships',
    'Medimpact + partnerships', 'Optumrx + partnerships', 'Employers Health + partnerships',
    'Cigna Healthcare + partnerships', 'United Healthcare + partnerships',
    'Capital Rx + partnerships', 'Carelon Rx + partnerships',
    'Elevance Health + partnerships', 'Express Scripts + partnerships',
    'Prime Therapeutics + partnerships', 'Magellan health + partnerships',
    'blue cross blue shield + partnerships', 'UMR + partnerships',
    'CVS Caremark + partnerships',
  ],
  specialtyPharmacy: [
    'CVS Health + specialty pharmacy', 'Aetna + specialty pharmacy',
    'Anthem + specialty pharmacy', 'Medimpact + specialty pharmacy',
    'Optumrx + specialty pharmacy', 'Employers Health + specialty pharmacy',
    'Cigna Healthcare + specialty pharmacy', 'United Healthcare + specialty pharmacy',
    'Capital Rx + specialty pharmacy', 'Carelon Rx + specialty pharmacy',
    'Elevance Health + specialty pharmacy', 'Express Scripts + specialty pharmacy',
    'Prime Therapeutics + specialty pharmacy', 'Magellan health + specialty pharmacy',
    'blue cross blue shield + specialty pharmacy', 'UMR + specialty pharmacy',
    'CVS Caremark + specialty pharmacy',
  ],
  industryTrends: [
    '"Pharmacy Benefit Management" AND ("new technologies" OR "drug trends")',
    '"PBM" AND ("new technologies" OR "drug trends")',
    '"PBM" AND ("GLP-1" OR "biosimilars" OR "cell gene therapy")',
    '"Pharmacy Benefits Management" AND ("GLP-1" OR "biosimilars" OR "cell gene therapy")',
    '"PBM" AND ("new competitors" OR "market entry")',
    '"Pharmacy Benefits Management" AND ("new competitors" OR "market entry")',
    '"PBM" AND ("financial solutions" OR "patient assistance programs" OR "discount cards")',
    '"PBM" AND ("product solutions" OR "employer solutions" OR "consumer solutions")',
    '"PBM" AND ("broker" OR "employee benefits") AND "M&A"',
    '"PBM" AND ("impact of new technologies" OR "emerging drug trends")',
    '"PBM" AND ("GLP-1 therapies" OR "biosimilar adoption" OR "cell and gene therapy market")',
    '"PBM" AND ("new market entrants" OR "competitive landscape")',
    '"PBM" AND ("patient affordability initiatives" OR "financial assistance programs")',
    '"PBM" AND ("employer solutions" OR "consumer-centric offerings")',
    '"PBM" AND ("brokerage M&A" OR "employee benefits consolidation")',
    '"PBM" AND ("biosimilar substitution strategies" OR "generic drug utilization")',
    '"PBM" AND ("patient adherence programs" OR "medication therapy management")',
    '"PBM" AND ("employer wellness programs" OR "consumer engagement tools")',
    '"PBM" AND ("brokerage mergers" OR "employee benefits consulting firms")',
    'PBM AND "Discount Card"',
    '"product solutions" AND PBM AND "employer pharmacy spend" AND "consumer pharmacy spend" AND "drug trend"',
  ],
  regulatoryUpdates: [
    '"PBM" AND ("regulatory updates" OR "regulatory changes")',
    '"Pharmacy Benefits Management" AND ("regulatory updates" OR "regulatory changes")',
    '"PBM" AND ("healthcare reform" OR "government regulations")',
    '"PBM" AND ("Medicare Part D" OR "ACA") AND "regulatory impact"',
    '"PBM" AND ("state regulations" OR "interoperability rules" OR "transparency requirements")',
    '"PBM" AND "FTC" AND ("antitrust" OR "competition")',
    '"PBM" AND "FDA" AND ("drug approvals" OR "generic drug competition")',
    '"PBM" AND "CMS" AND ("regulatory changes" OR "policy updates")',
    '"PBM" AND ("pharmacy benefit manager transparency" OR "PBM transparency rule") AND "compliance"',
    '"PBM" AND ("transparency" OR "disclosure") AND ("regulatory mandates" OR "reporting requirements")',
    '"PBM" AND ("interoperability" OR "data sharing") AND ("regulatory requirements" OR "compliance")',
    '"PBM" AND ("CMS Interoperability Rule" OR "Patient Access Rule") AND "impact"',
    '"PBM" AND ("340B Drug Pricing Program" OR "Medicare Part D") AND "regulatory updates"',
    '"PBM" AND ("drug pricing" OR "reimbursement") AND ("regulatory impact" OR "policy changes")',
    '"PBM" AND ("industry trends" OR "future outlook") AND "regulatory environment"',
    '"PBM" AND ("value-based care" OR "pay-for-performance") AND "regulatory landscape"',
  ],
  macroeconomicTrends: [
    '"healthcare spending" AND ("inflation" OR "economic downturn")',
    '"PBM" AND ("labor shortage" OR "workforce crisis")',
    '"consumer spending" AND ("healthcare costs" OR "prescription drugs")',
    '"economic policy" AND ("healthcare reform" OR "PBM")',
    '"healthcare inflation" AND ("drug prices" OR "medical services")',
    '"rising healthcare costs" AND ("inflationary pressures" OR "economic uncertainty")',
    '"consumer spending habits" AND ("healthcare expenses" OR "prescription drug costs")',
    '"disposable income" AND ("healthcare affordability" OR "PBM")',
    '"healthcare workforce shortage" AND ("PBM" OR "pharmacy services")',
    '"nursing shortage" AND ("healthcare costs" OR "drug delivery")',
    '"government regulation" AND ("PBM" OR "pharmacy benefit manager")',
    '"healthcare policy" AND ("drug pricing" OR "biosimilar adoption")',
    '"economic stimulus package" AND ("healthcare spending" OR "prescription drug costs")',
    '"fiscal policy" AND ("healthcare access" OR "PBM")',
  ],
};

const SEARCH_STRINGS_RX = {
  competitors: [
    'Aetna', 'Capital Rx', 'Carelon Rx', 'Cigna', 'CVS Caremark',
    'Elevance Health', 'Express Scripts', 'MedImpact', 'Optum Rx',
    'UMR', 'UNC Health Pharmacy', 'UnitedHealth Group',
    'Employers Health Coalition', 'MagellanRx',
  ],
  secondaryCompetitors: [
    'Rightway', 'Affirmedrx', 'amazon pharmacy', 'BCBS IL', 'BCBS TX',
    'LucyRx', 'goodrx', 'mark cuban cost plus', 'Medone', 'SmithRx',
    '"Carelon Rx" and "Carelonrx"', 'Allumarx', 'Aon Rx', 'Coretrust',
    'Empi Rx', 'Liviniti', 'Maxor', 'National Cooperative Rx', 'NFP',
    'proact pbm', 'slaterx', 'truerx', 'truescripts', 'truveris', 'welldyne',
    'Navitus', 'WTW Collaborative', 'Health Action Council', 'RxCare Alliance',
    'Highmark', 'RxLogic',
  ],
  industry: [
    '340b program updates', 'drug pricing transparency', 'GLP-1 weight loss drugs',
    'costco pharmacy', 'digital health and pbms', 'pharmacogenomics',
    'pharmacy automation', 'pharmacy benefit carveout', 'Pharmacy Benefits Managers',
    'Specialty Drug Costs', 'Telepharmacy', 'biosimilar OR biobetter',
    '"Pharmacy employer drug benefits trends', 'formularies', 'High Cost Drug Coverages',
    'Integrated Healthcare Model', 'payor and pbm', 'pbm client retention',
    'pbm competitive landscape', 'pbm cost management strategies',
    'pbm growth strategies', 'pbm industry analysis', 'pbm market share',
    'pbm industry analyst', 'pbm member', 'pbm partnerships',
    'pbm pricing challenges', 'pbm satisfaction', 'pharmacy cost trends',
    'pharmacy chain agreements', 'pharmaceutical industry',
    'Pharmacy Industry thought leadership', 'pharmacy pricing', 'pharmacy trends',
    'PharmaVoice', 'rebate-pass-through model', 'Reports on Health Insurance',
    'Specialty Drug Programs', 'STAT', 'transparent pbms',
  ],
  legalLegislative: [
    'drug pricing reform', 'FTC investigation pbm', 'pbm legislation',
    'pbm reform', '"pharmacy and "lawsuit"', 'state pbm law',
    'drug manufacture lawsuits', 'employer pbm contracts',
    'Pharmacy Benefits Managers', 'Inflation Reduction Act',
    'Consolidated Appropriations Act', 'pbm lawsuits', 'policy and medicine',
    'LexBlog',
  ],
  pipelineUpdates: [
    'drug pipeline', 'current drugs approved that are about to have patent expiration',
    'new approved drugs by FDA', 'first generic approves after patent expiration',
  ],
  macro: [
    'Federal Reserve Economics System', 'US Bureau of Economic Analysis',
    'IBIS World',
  ],
  antiPbmRhetoric: [
    'GLP-1s', 'PBM News',
  ],
};

// ─── FOCUS AREAS / CATEGORIES ────────────────────────────────

const FOCUS_AREAS_TF = {
  themes: [
    'Competitor Specific', 'Industry News', 'Product Updates',
    'Macroeconomic Trends', 'Regulatory Updates',
  ],
  categories: [
    'Competitor News', 'Partnerships / Collaboration', 'Pricing & Discount',
    'Marketing & Messaging Shifts', 'Organizational News/HR', 'Product Updates',
    'Growth', 'Pricing & Discount Strategies', 'Marketing & Messaging Shifts',
    'Macroeconomic Factors', 'Regulatory Updates', 'Industry Trends',
  ],
  focusAreas: [
    'Pharmacy Benefit Management', 'PBM', 'Specialty Pharmacy', 'Health Insurer',
    'TPA', 'Consumer Engagement',
  ],
  audienceFocus: [
    'Payers', 'Patients', 'Pharmacies', 'Healthcare Providers',
  ],
  businessLine: [
    'PBM', 'CVS Caremark', 'Optum Rx', 'Express Scripts', 'MedImpact', 'Ingenio',
  ],
  healthInsurers: ['Aetna', 'United Health Care', 'Cigna Healthcare', 'Anthem'],
  tpas: ['Meritain Health', 'UMR', 'Allegiance'],
};

const FOCUS_AREAS_RX = {
  themes: [
    'Competitor Specific', 'Industry News', 'Legal / Legislative',
    'Pipeline Updates', 'Macro', 'Anti-PBM Rhetoric',
  ],
  categories: [
    'Competitor News', 'Regulatory Updates', 'Industry Trends',
    'Drug Pricing', 'Pharmacy Innovation', 'PBM Legislation',
    'Specialty Pharmacy', 'Biosimilars', 'GLP-1', 'M&A',
  ],
  focusAreas: [
    'Pharmacy Benefit Management', 'PBM', 'Drug Pricing Reform',
    'Specialty Drugs', 'Biosimilars', 'GLP-1 Therapies',
    'PBM Legislation', 'Pharmacy Automation', 'Transparent PBMs',
  ],
};

// ─── REPORT DEFINITIONS ──────────────────────────────────────
// These match the Netlify environment variables you already created.

const REPORTS_TF = [
  { key: 'primary',   envKey: 'REPORT_PRIMARY_CLIENT_TF',   icon: '📰', freq: 'Daily'     },
  { key: 'secondary', envKey: 'REPORT_SECONDARY_CLIENT_TF', icon: '📅', freq: 'Biweekly'  },
  { key: 'tertiary',  envKey: 'REPORT_TERTIARY_CLIENT_TF',  icon: '📊', freq: 'Quarterly' },
];

const REPORTS_RX = [
  { key: 'primary',    envKey: 'REPORT_PRIMARY_CLIENT_RX',    icon: '📰', freq: 'Daily'   },
  { key: 'secondary',  envKey: 'REPORT_SECONDARY_CLIENT_RX',  icon: '📅', freq: 'Weekly'  },
  { key: 'tertiary',   envKey: 'REPORT_TERTIARY_CLIENT_RX',   icon: '📊', freq: 'Quarterly'},
  { key: 'quaternary', envKey: 'REPORT_QUATERNARY_CLIENT_RX', icon: '📋', freq: 'Annual'  },
];

// ─── COLOUR THEMES ───────────────────────────────────────────
// Each client gets their own colour. Safe to store here — not sensitive.

const THEME_TF = {
  primary:    '#0053a0',   // Thermo Fisher corporate blue
  secondary:  '#e87722',   // Thermo Fisher orange accent
  accent:     '#00b0f0',
  background: '#f4f7fb',
};

const THEME_RX = {
  primary:    '#00539b',   // RxBenefits blue
  secondary:  '#f26522',   // RxBenefits orange
  accent:     '#6db33f',
  background: '#f5f9f5',
};

// ─── GEMINI AI SCORING PROMPT TEMPLATES ──────────────────────
// These tell the AI what to look for when scoring articles.
// Client-specific so scores are actually relevant per client.

const SCORING_PROMPT_TF = `You are a pharmaceutical market intelligence analyst for a leading MedTech company.
Score the following article for strategic relevance on a scale of 1-10.

SCORE HIGH (8-10) if the article covers:
- Any of these competitors: CVS Caremark, OptumRx, MedImpact, Express Scripts, Carelon, Elevance Health, United Healthcare, Aetna, Cigna, Anthem, Capital Rx, Prime Therapeutics, Magellan Health, UMR
- Pharmacy Benefit Management (PBM) industry news
- Drug pricing, biosimilars, or specialty pharmacy developments
- FTC investigations or regulatory actions against PBMs
- GLP-1 therapies, biosimilar adoption, cell and gene therapy
- Healthcare M&A, partnerships, or major contracts
- Macroeconomic factors affecting drug costs or healthcare spending

SCORE MEDIUM (4-7) if the article covers:
- General healthcare industry trends
- BCBS affiliate news
- Secondary PBM competitors (Rightway, AffirmedRx, SmithRx, etc.)
- Pharmaceutical pricing policy

SCORE LOW (1-3) if the article is:
- Unrelated to healthcare or PBMs
- Consumer lifestyle content
- Local news with no industry relevance

Return ONLY a JSON object with these fields:
{
  "score": <number 1-10>,
  "category": "<one of: Competitor News | Regulatory Updates | Industry Trends | Drug Pricing | Biosimilars | Specialty Pharmacy | M&A | Macroeconomic | GLP-1 | Other>",
  "summary": "<one sentence explaining why this score was assigned>",
  "keyCompetitors": ["<competitor names mentioned, if any>"]
}`;

const SCORING_PROMPT_RX = `You are a pharmacy benefit management market intelligence analyst for RxBenefits.
Score the following article for strategic relevance on a scale of 1-10.

SCORE HIGH (8-10) if the article covers:
- Any of these competitors: Aetna, Capital Rx, Carelon Rx, Cigna, CVS Caremark, Elevance Health, Express Scripts, MedImpact, Optum Rx, UMR, UnitedHealth Group, MagellanRx
- PBM legislation, reform, or FTC investigations
- Drug pricing transparency or reform
- GLP-1 weight loss drugs and PBM formulary decisions
- Biosimilars and biobetter developments
- Specialty drug costs and coverage
- Amazon pharmacy or new market entrants threatening traditional PBMs
- Anti-PBM rhetoric from Congress or media
- State PBM laws and compliance requirements

SCORE MEDIUM (4-7) if the article covers:
- General pharmacy industry trends
- Secondary competitors (Rightway, AffirmedRx, LucyRx, SmithRx, etc.)
- Healthcare workforce or macroeconomic factors
- BCBS affiliate news affecting pharmacy benefits

SCORE LOW (1-3) if the article is:
- Unrelated to pharmacy benefits or PBMs
- Consumer lifestyle content
- Local news with no industry relevance

Return ONLY a JSON object with these fields:
{
  "score": <number 1-10>,
  "category": "<one of: Competitor News | PBM Legislation | Drug Pricing | GLP-1 | Biosimilars | Specialty Pharmacy | Anti-PBM | Pipeline | Macroeconomic | Other>",
  "summary": "<one sentence explaining why this score was assigned>",
  "keyCompetitors": ["<competitor names mentioned, if any>"]
}`;

// ─── FEEDLY STREAM IDs ───────────────────────────────────────
// These come from your Netlify environment variables.
// Set FEEDLY_STREAM_ID_CLIENT_TF and FEEDLY_STREAM_ID_CLIENT_RX
// in Netlify → Site configuration → Environment variables.

// ─── MAIN EXPORT FUNCTION ────────────────────────────────────
/**
 * getClientConfig(clientId)
 *
 * Call this from any Netlify function. Pass the clientId string
 * ('TF' or 'RX') and get back everything you need for that client.
 *
 * Example:
 *   const { getClientConfig } = require('./lib/client-config');
 *   const config = getClientConfig('TF');
 *   console.log(config.displayName); // "Thermo Fisher"
 *   console.log(config.rssFeeds);    // [...array of URLs...]
 */
function getClientConfig(clientId) {
  if (!clientId) {
    throw new Error('getClientConfig: clientId is required (e.g. "TF" or "RX")');
  }

  const id = clientId.toUpperCase();

  // Read display name and logo from environment variables (set on Netlify)
  const displayName = process.env[`DISPLAY_NAME_CLIENT_${id}`];
  const logoUrl     = process.env[`LOGO_URL_CLIENT_${id}`];
  const password    = process.env[`PASSWORD_CLIENT_${id}`]; // used by auth.js only

  if (!displayName) {
    throw new Error(`getClientConfig: No configuration found for client "${id}". Check Netlify environment variables.`);
  }

  // Build the reports list by reading env vars
  const reportEnvKeys = {
    TF: REPORTS_TF,
    RX: REPORTS_RX,
  };
  const reportDefs = reportEnvKeys[id] || [];
  const reports = reportDefs.map(r => ({
    key:   r.key,
    name:  process.env[r.envKey] || r.envKey,
    icon:  r.icon,
    freq:  r.freq,
  }));

  // Build the full config object
  const configs = {
    TF: {
      clientId:       'TF',
      displayName,
      logoUrl,
      password,       // only auth.js should read this
      theme:          THEME_TF,
      reports,
      rssFeeds:       RSS_FEEDS_TF,
      competitors:    COMPETITORS_TF,
      searchStrings:  SEARCH_STRINGS_TF,
      focusAreas:     FOCUS_AREAS_TF,
      scoringPrompt:  SCORING_PROMPT_TF,
      feedlyStreamId: process.env['FEEDLY_STREAM_ID_CLIENT_TF'] || null,
    },
    RX: {
      clientId:       'RX',
      displayName,
      logoUrl,
      password,
      theme:          THEME_RX,
      reports,
      rssFeeds:       RSS_FEEDS_RX,
      competitors:    COMPETITORS_RX,
      searchStrings:  SEARCH_STRINGS_RX,
      focusAreas:     FOCUS_AREAS_RX,
      scoringPrompt:  SCORING_PROMPT_RX,
      feedlyStreamId: process.env['FEEDLY_STREAM_ID_CLIENT_RX'] || null,
    },
  };

  if (!configs[id]) {
    throw new Error(`getClientConfig: Client "${id}" is not registered. Add it to CLIENT_REGISTRY.`);
  }

  return configs[id];
}

/**
 * getAllClients()
 *
 * Returns the list of all registered client IDs.
 * Used by scheduled-digest.js to loop through all clients.
 *
 * Example:
 *   const { getAllClients } = require('./lib/client-config');
 *   const clients = getAllClients(); // ['TF', 'RX']
 */
function getAllClients() {
  return CLIENT_REGISTRY;
}

/**
 * validateClientPassword(clientId, password)
 *
 * Used ONLY by auth.js to check if a password is correct.
 * Returns true or false. Never returns the actual password.
 *
 * Example:
 *   const valid = validateClientPassword('TF', 'TFAdmin@123');
 *   // true
 */
function validateClientPassword(clientId, password) {
  if (!clientId || !password) return false;
  const id = clientId.toUpperCase();
  const storedPassword = process.env[`PASSWORD_CLIENT_${id}`];
  if (!storedPassword) return false;
  return storedPassword === password;
}

/**
 * getClientPublicProfile(clientId)
 *
 * Returns ONLY the data that is safe to send to the browser.
 * Strips out passwords and internal scoring prompts.
 * Used by auth.js when returning client data after login.
 */
function getClientPublicProfile(clientId) {
  const config = getClientConfig(clientId);
  return {
    clientId:      config.clientId,
    displayName:   config.displayName,
    logoUrl:       config.logoUrl,
    theme:         config.theme,
    reports:       config.reports,
    focusAreas:    config.focusAreas,
    // searchStrings and competitors are included so the UI can show them
    competitors:   config.competitors,
    searchStrings: config.searchStrings,
    // password and scoringPrompt are intentionally excluded
  };
}

module.exports = {
  getClientConfig,
  getAllClients,
  validateClientPassword,
  getClientPublicProfile,
};
