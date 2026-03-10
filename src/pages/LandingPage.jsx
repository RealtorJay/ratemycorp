import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Stars from '../components/Stars'
import CompanyLogo from '../components/CompanyLogo'
import FollowButton from '../components/FollowButton'
import NewsletterSignup from '../components/NewsletterSignup'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './LandingPage.css'

const CATEGORIES = [
  { icon: '🌍', title: 'Environmental Impact', desc: 'EPA violations, carbon emissions, toxic waste, oil spills, greenwashing, and sustainability pledges vs. documented reality.' },
  { icon: '⚖️', title: 'Ethical Business', desc: 'DOJ/OSHA violations, labor exploitation, union-busting, supply chain abuses, wage theft, and foreign bribery (FCPA).' },
  { icon: '🛡️', title: 'Consumer Trust', desc: 'FTC actions, FDA violations, data privacy breaches, product safety recalls, deceptive pricing, and class action history.' },
  { icon: '📰', title: 'Corporate Scandals', desc: 'Congressional investigations, DOJ criminal cases, SEC enforcement, FBI probes, and documented cover-ups.' },
]

const STEPS = [
  { n: '01', title: 'Search a Company', desc: 'Look up any brand to see their full ethics scorecard, sourced from DOJ, SEC, EPA, and FTC records.' },
  { n: '02', title: 'Read the Evidence', desc: 'Browse documented reports citing real case numbers, settlement amounts, and government agency findings.' },
  { n: '03', title: 'Spend with Values', desc: 'Make informed decisions with evidence — not PR spin — about which companies deserve your dollar.' },
]

const METHODOLOGY = [
  { label: 'Sources', items: ['DOJ settlements & indictments', 'SEC enforcement actions', 'EPA fines & consent decrees', 'OSHA citations', 'FTC & FDA actions'] },
  { label: 'Research', items: ['Court records & PACER', 'Congressional testimony', 'IRS tax disclosures', 'Whistleblower accounts', 'FBI & FinCEN filings'] },
  { label: 'Scoring', items: ['1–5 scale per category', 'Weighted by severity', 'Recency factored in', 'Pattern vs. isolated incidents', 'Remediation credit'] },
]

function scoreClass(score) {
  if (score >= 4) return 'score-good'
  if (score >= 3) return 'score-mixed'
  if (score >= 2) return 'score-poor'
  if (score > 0)  return 'score-harmful'
  return 'score-none'
}

function scoreLabel(score) {
  if (score >= 4) return 'Good'
  if (score >= 3) return 'Mixed'
  if (score >= 2) return 'Poor'
  if (score > 0)  return 'Harmful'
  return 'No data'
}

export default function LandingPage() {
  const { user, preferences, onboardingDone } = useAuth()
  const [trending, setTrending] = useState([])
  const [ticker, setTicker] = useState([])
  const [stats, setStats] = useState({ companies: 0, reviews: 0 })
  const [forYou, setForYou] = useState([])

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, slug, industry, website, avg_overall, review_count')
      .gt('review_count', 0)
      .order('review_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setTrending(data || []))

    supabase
      .from('companies')
      .select('id, name, slug, website')
      .gt('review_count', 0)
      .order('review_count', { ascending: false })
      .limit(30)
      .then(({ data }) => setTicker(data || []))

    Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }).gt('review_count', 0),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
    ]).then(([co, re]) => setStats({ companies: co.count || 0, reviews: re.count || 0 }))
  }, [])

  // Fetch personalized "For You" companies
  useEffect(() => {
    if (!user || !onboardingDone || !preferences?.industries?.length) {
      setForYou([])
      return
    }
    supabase
      .from('companies')
      .select('id, name, slug, industry, website, avg_overall, review_count')
      .in('industry', preferences.industries)
      .gt('review_count', 0)
      .order('review_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setForYou(data || []))
  }, [user, onboardingDone, preferences])

  return (
    <div className="landing">
      <NavBar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">Consumer Watchdog Platform</span>
          <h1 className="hero-headline">
            Know who you're<br />giving your money to.
          </h1>
          <p className="hero-sub">
            CorpWatch rates companies on environmental impact, ethical practices,
            consumer trust, and corporate scandals — so you can spend with your values.
          </p>
          <div className="hero-actions">
            <Link to="/companies" className="btn btn-primary btn-lg">Investigate Companies</Link>
            <Link to="/auth?mode=signup" className="btn btn-outline btn-lg">Submit a Report</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-n">{stats.companies || '50+'}</span>
              <span>Companies Tracked</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-n">{stats.reviews || '—'}</span>
              <span>Reports Filed</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-n">4</span>
              <span>Rating Dimensions</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-n">10+</span>
              <span>Gov't Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo ticker */}
      {ticker.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker-track">
            {[...ticker, ...ticker].map((c, i) => (
              <Link key={`${c.id}-${i}`} to={`/companies/${c.slug}`} className="ticker-item">
                <CompanyLogo name={c.name} website={c.website} size={28} />
                <span className="ticker-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* For You (personalized, logged-in users with onboarding done) */}
      {forYou.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <div className="section-header">
              <div>
                <h2 className="section-title">For You</h2>
                <p className="section-sub">Companies in the industries you care about.</p>
              </div>
              <Link to="/companies" className="btn-ghost-muted">Browse all →</Link>
            </div>
            <div className="scorecard-grid">
              {forYou.map((c) => (
                <Link key={c.id} to={`/companies/${c.slug}`} className="scorecard">
                  <div className="scorecard-top">
                    <CompanyLogo name={c.name} website={c.website} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="scorecard-name">{c.name}</div>
                      {c.industry && <div className="scorecard-industry">{c.industry}</div>}
                    </div>
                    <div className="scorecard-score">
                      <span className={`scorecard-score-val ${scoreClass(c.avg_overall)}`}>
                        {c.avg_overall > 0 ? Number(c.avg_overall).toFixed(1) : '—'}
                      </span>
                      <span className={`scorecard-score-label ${scoreClass(c.avg_overall)}`}>
                        {scoreLabel(c.avg_overall)}
                      </span>
                    </div>
                  </div>
                  <div className="scorecard-footer">
                    <Stars rating={c.avg_overall || 0} size="sm" showNumber={false} />
                    <span className="scorecard-reviews">{c.review_count} reports</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sign up CTA for non-logged-in users */}
      {!user && (
        <section className="section">
          <div className="section-inner" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <p style={{ color: '#888', fontSize: '0.95rem', margin: '0 0 16px' }}>
              Sign up to get personalized recommendations based on your values and interests.
            </p>
            <Link to="/auth?mode=signup" className="btn btn-outline">Create Free Account</Link>
          </div>
        </section>
      )}

      {/* Scorecards */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Company Scorecards</h2>
              <p className="section-sub">Community-rated across ethics, environment, and accountability.</p>
            </div>
            <Link to="/companies" className="btn-ghost-muted">View all →</Link>
          </div>
          <div className="scorecard-grid">
            {trending.length > 0 ? trending.map((c) => (
              <Link key={c.id} to={`/companies/${c.slug}`} className="scorecard">
                <div className="scorecard-top">
                  <CompanyLogo name={c.name} website={c.website} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="scorecard-name">{c.name}</div>
                    {c.industry && <div className="scorecard-industry">{c.industry}</div>}
                  </div>
                  <div className="scorecard-score">
                    <span className={`scorecard-score-val ${scoreClass(c.avg_overall)}`}>
                      {c.avg_overall > 0 ? Number(c.avg_overall).toFixed(1) : '—'}
                    </span>
                    <span className={`scorecard-score-label ${scoreClass(c.avg_overall)}`}>
                      {scoreLabel(c.avg_overall)}
                    </span>
                  </div>
                </div>
                <div className="scorecard-footer">
                  <Stars rating={c.avg_overall || 0} size="sm" showNumber={false} />
                  <span className="scorecard-reviews">{c.review_count} reports</span>
                </div>
              </Link>
            )) : [1,2,3,4,5,6].map((n) => (
              <div key={n} className="scorecard skeleton">
                <div className="scorecard-top">
                  <div className="skeleton-block" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-line" style={{ width: '55%' }} />
                    <div className="skeleton-line" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we rate */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 className="section-title">What We Rate</h2>
            <p className="section-sub">Four dimensions every conscious consumer should know about.</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((c) => (
              <div key={c.title} className="category-card">
                <span className="category-icon">{c.icon}</span>
                <h3 className="category-title">{c.title}</h3>
                <p className="category-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} className="step">
                <div className="step-num">Step {s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title">How We Rate</h2>
            <p className="section-sub">Every score is backed by documented public records — not opinions.</p>
          </div>
          <div className="methodology-grid">
            {METHODOLOGY.map((col) => (
              <div key={col.label} className="methodology-col">
                <div className="methodology-label">{col.label}</div>
                <ul className="methodology-list">
                  {col.items.map((item) => (
                    <li key={item} className="methodology-item">
                      <span className="methodology-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="methodology-note">
            Reports cite specific case numbers, settlement amounts, and government agency findings.
            Ratings reflect documented behavior — not perception or brand reputation.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Weekly corporate accountability reports.</h2>
          <p className="cta-sub">
            Get the worst offenders, biggest fines, and latest government actions delivered to your inbox every week. Free.
          </p>
          <NewsletterSignup source="landing_cta" />
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Know something the public should?</h2>
          <p className="cta-sub">
            Submit an anonymous, evidence-based report. All submissions are reviewed before publishing.
          </p>
          <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">Submit a Report</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">CorpWatch</span>
          <p className="footer-copy">© {new Date().getFullYear()} CorpWatch. Holding corporations accountable.</p>
        </div>
      </footer>
    </div>
  )
}
