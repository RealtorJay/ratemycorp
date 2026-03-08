import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Stars from '../components/Stars'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import './LandingPage.css'

const CATEGORIES = [
  { icon: '🌍', title: 'Environmental Impact', desc: 'Carbon footprint, pollution, sustainability pledges vs. reality.' },
  { icon: '⚖️', title: 'Ethical Business', desc: 'Labor practices, supply chains, fair trade, and worker rights.' },
  { icon: '🛡️', title: 'Consumer Trust', desc: 'Data privacy, product safety, honest pricing, and recalls.' },
  { icon: '📰', title: 'Corporate Scandals', desc: 'Lawsuits, cover-ups, fraud, and public controversies.' },
]

const STEPS = [
  { n: '01', title: 'Search a Company', desc: 'Look up any brand to see their community ethics scorecard.' },
  { n: '02', title: 'Read the Reports', desc: 'Browse anonymous, fact-checked reports from other consumers.' },
  { n: '03', title: 'Spend with Values', desc: 'Make informed decisions about which companies deserve your money.' },
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
  const [trending, setTrending] = useState([])
  const [ticker, setTicker] = useState([])

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, slug, industry, website, avg_overall, review_count')
      .order('review_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setTrending(data || []))

    supabase
      .from('companies')
      .select('id, name, website, avg_overall')
      .order('review_count', { ascending: false })
      .limit(20)
      .then(({ data }) => setTicker(data || []))
  }, [])

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
              <span className="hero-stat-n">4</span>
              <span>Rating Categories</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-n">100%</span>
              <span>Anonymous</span>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <span className="hero-stat-n">54+</span>
              <span>Companies Tracked</span>
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

      {/* CTA */}
      <section className="section cta-section">
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
