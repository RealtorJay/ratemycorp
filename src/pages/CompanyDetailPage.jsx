import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Stars from '../components/Stars'
import RatingBar from '../components/RatingBar'
import ReviewCard from '../components/ReviewCard'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import StockWidget from '../components/StockWidget'
import FollowButton from '../components/FollowButton'
import './CompanyDetailPage.css'

const RATING_CATEGORIES = [
  { key: 'avg_environmental',    label: 'Environmental Impact' },
  { key: 'avg_ethical_business', label: 'Ethical Business' },
  { key: 'avg_consumer_trust',   label: 'Consumer Trust' },
  { key: 'avg_scandals',         label: 'Corporate Scandals' },
]

const PARTY_COLORS = {
  Democrat: '#4B9CD3',
  Republican: '#E03C3C',
  Independent: '#888',
}

const CONNECTION_LABELS = {
  campaign_donation:    'Campaign Donation',
  super_pac:            'Super PAC',
  lobbying_client:      'Lobbying Client',
  revolving_door_from:  'Revolving Door (From)',
  revolving_door_to:    'Revolving Door (To)',
  board_seat:           'Board Seat',
  stock_ownership:      'Stock Ownership',
  family_connection:    'Family Connection',
  bundler:              'Bundler',
  industry_pac:         'Industry PAC',
}

const SCANDAL_TYPE_LABELS = {
  environmental: 'Environmental',
  labor: 'Labor & Workforce',
  fraud: 'Fraud',
  safety: 'Safety',
  privacy: 'Privacy',
  antitrust: 'Antitrust',
  corruption: 'Corruption',
  discrimination: 'Discrimination',
  regulatory: 'Regulatory',
  other: 'Other',
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  major: '#f97316',
  moderate: '#eab308',
  minor: '#a3a3a3',
}

export default function CompanyDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [connections, setConnections] = useState([])
  const [scandals, setScandals] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    setLoading(true)
    const { data: co, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !co) { setNotFound(true); setLoading(false); return }
    setCompany(co)

    const [revsRes, connRes, scandalsRes] = await Promise.all([
      supabase
        .from('reviews')
        .select('*')
        .eq('company_id', co.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('politician_company_connections')
        .select('*, politicians(id, slug, full_name, party, chamber, state, title, accountability_score)')
        .eq('company_id', co.id)
        .order('amount_cents', { ascending: false }),
      supabase
        .from('company_scandals')
        .select('*')
        .eq('company_id', co.id)
        .order('date_started', { ascending: false }),
    ])

    setReviews(revsRes.data || [])
    setConnections(connRes.data || [])
    setScandals(scandalsRes.data || [])
    setLoading(false)
  }

  const handleWriteReview = () => {
    if (!user) navigate(`/auth?redirect=/companies/${slug}/review`)
    else navigate(`/companies/${slug}/review`)
  }

  if (loading) return <LoadingScreen />
  if (notFound) return <NotFound />

  return (
    <div className="detail-page">
      <NavBar />

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <CompanyLogo name={company.name} website={company.website} size={72} />
          <div className="detail-header-info">
            <div className="detail-breadcrumb">
              <Link to="/companies">Companies</Link> / {company.name}
            </div>
            <h1 className="detail-name">{company.name}</h1>
            <div className="detail-meta">
              {company.industry && <span className="detail-industry">{company.industry}</span>}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="detail-website">
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="detail-rating-row">
              <span className="detail-big-rating">{Number(company.avg_overall).toFixed(1)}</span>
              <Stars rating={company.avg_overall} size="lg" showNumber={false} />
              <span className="detail-review-count">{company.review_count} reviews</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={handleWriteReview}>
              + Submit a Report
            </button>
            <FollowButton companyId={company.id} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-body-inner">
          {/* Sidebar: rating breakdown */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Rating Breakdown</h3>
              <div className="rating-bars">
                {RATING_CATEGORIES.map((cat) => (
                  <RatingBar key={cat.key} label={cat.label} value={company[cat.key]} />
                ))}
              </div>
            </div>
            <StockWidget
              ticker={company.stock_ticker}
              companyName={company.name}
              isPublic={company.is_public !== false}
            />

            {/* Company Info */}
            {(company.ceo_name || company.headquarters || company.founded_year || company.stock_ticker || company.market_cap) && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">
                  {company.ceo_name ? 'Leadership' : 'Company Info'}
                </h3>
                {company.ceo_name && (
                  <div className="leadership-info">
                    <div className="leadership-avatar">
                      {company.ceo_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="leadership-detail">
                      <div className="leadership-name">{company.ceo_name}</div>
                      <div className="leadership-role">{company.ceo_title || 'CEO'}</div>
                    </div>
                  </div>
                )}
                {company.headquarters && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">HQ</span>
                    <span className="leadership-meta-value">{company.headquarters}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">Founded</span>
                    <span className="leadership-meta-value">{company.founded_year}</span>
                  </div>
                )}
                {company.stock_ticker && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">Ticker</span>
                    <span className="leadership-meta-value">{company.stock_ticker}</span>
                  </div>
                )}
                {company.market_cap && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">Market Cap</span>
                    <span className="leadership-meta-value">{company.market_cap}</span>
                  </div>
                )}
                {company.employee_count && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">Employees</span>
                    <span className="leadership-meta-value">{company.employee_count}</span>
                  </div>
                )}
                {company.lobbying_spend && (
                  <div className="leadership-meta-row">
                    <span className="leadership-meta-label">Lobbying</span>
                    <span className="leadership-meta-value leadership-lobbying">{company.lobbying_spend}</span>
                  </div>
                )}
              </div>
            )}

            {/* Political Connections sidebar preview */}
            {connections.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Political Ties ({connections.length})</h3>
                <div className="sidebar-pol-connections">
                  {connections.slice(0, 5).map((c) => {
                    const pol = c.politicians
                    if (!pol) return null
                    const partyColor = PARTY_COLORS[pol.party] || '#555'
                    return (
                      <Link key={c.id} to={`/politicians/${pol.slug}`} className="sidebar-pol-item">
                        <div className="sidebar-pol-avatar" style={{ background: partyColor }}>
                          {pol.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <div className="sidebar-pol-info">
                          <span className="sidebar-pol-name">{pol.full_name}</span>
                          <span className="sidebar-pol-meta">
                            {pol.party?.[0]} · {CONNECTION_LABELS[c.connection_type] || c.connection_type}
                          </span>
                        </div>
                        {c.amount_display && c.amount_display !== 'N/A' && (
                          <span className="sidebar-pol-amount">{c.amount_display}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
                <Link to={`/connections?company=${slug}`} className="sidebar-pol-viewall">
                  Explore all connections →
                </Link>
              </div>
            )}

            {company.description && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">About</h3>
                <p className="sidebar-desc">{company.description}</p>
              </div>
            )}
            <Link to={`/companies/${slug}/forum`} className="sidebar-forum-link">
              View Company Forum →
            </Link>
          </aside>

          {/* Main content */}
          <main className="detail-main">
            {/* Political Connections section */}
            {connections.length > 0 && (
              <div className="detail-pol-section">
                <div className="detail-main-header">
                  <h2 className="detail-section-title">Political Connections</h2>
                  <Link to={`/connections?company=${slug}`} className="ghost-more">Explore web →</Link>
                </div>
                <p className="detail-pol-explainer">
                  These politicians have documented financial or professional ties to {company.name}.
                  Understanding these connections reveals how policy decisions may be influenced by corporate interests.
                </p>
                <div className="pol-connections-grid">
                  {connections.slice(0, 6).map((c) => {
                    const pol = c.politicians
                    if (!pol) return null
                    const partyColor = PARTY_COLORS[pol.party] || '#555'
                    return (
                      <Link key={c.id} to={`/politicians/${pol.slug}`} className="pol-connection-card">
                        <div className="pol-conn-header">
                          <div className="pol-conn-avatar" style={{ background: partyColor }}>
                            {pol.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="pol-conn-info">
                            <div className="pol-conn-name">{pol.full_name}</div>
                            <div className="pol-conn-party">
                              <span style={{ color: partyColor }}>{pol.party}</span>
                              {pol.state && <span> · {pol.state}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="pol-conn-type-badge">
                          {CONNECTION_LABELS[c.connection_type] || c.connection_type}
                        </div>
                        <div className="pol-conn-details">
                          {c.amount_display && c.amount_display !== 'N/A' && (
                            <span className="pol-conn-amount">{c.amount_display}</span>
                          )}
                          {c.cycle && <span className="pol-conn-cycle">{c.cycle}</span>}
                        </div>
                        {c.description && (
                          <p className="pol-conn-desc">{c.description}</p>
                        )}
                        <div className="pol-conn-why">
                          <span className="pol-conn-why-label">Why it matters:</span>
                          {' '}This {c.connection_type.replace(/_/g, ' ')} means {pol.full_name} may have financial incentives
                          affecting their votes on {company.industry?.toLowerCase() || 'industry'} policy.
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Scandal Timeline */}
            {scandals.length > 0 && (
              <div className="detail-scandals-section">
                <div className="detail-main-header">
                  <h2 className="detail-section-title">Scandal Timeline ({scandals.length})</h2>
                </div>
                <div className="scandals-timeline">
                  {scandals.map((s) => {
                    const sevColor = SEVERITY_COLORS[s.severity] || '#a3a3a3'
                    const year = s.date_started ? new Date(s.date_started).getFullYear() : null
                    return (
                      <div key={s.id} className="scandal-card">
                        <div className="scandal-timeline-dot" style={{ background: sevColor }} />
                        <div className="scandal-content">
                          <div className="scandal-header">
                            <div className="scandal-badges">
                              <span className="scandal-severity" style={{ color: sevColor, borderColor: sevColor }}>
                                {s.severity}
                              </span>
                              <span className="scandal-type-badge">
                                {SCANDAL_TYPE_LABELS[s.scandal_type] || s.scandal_type}
                              </span>
                              {s.is_ongoing && <span className="scandal-ongoing">Ongoing</span>}
                            </div>
                            {year && <span className="scandal-year">{year}</span>}
                          </div>
                          <h3 className="scandal-title">{s.title}</h3>
                          <p className="scandal-desc">{s.description}</p>
                          <div className="scandal-meta">
                            {(s.fine_amount_display || s.settlement_amount_display) && (
                              <span className="scandal-amount">
                                {s.fine_amount_display && <>Fine: {s.fine_amount_display}</>}
                                {s.fine_amount_display && s.settlement_amount_display && ' · '}
                                {s.settlement_amount_display && <>Settlement: {s.settlement_amount_display}</>}
                              </span>
                            )}
                            {s.agency_involved && (
                              <span className="scandal-agency">{s.agency_involved}</span>
                            )}
                          </div>
                          {s.outcome && (
                            <div className="scandal-outcome">
                              <span className="scandal-outcome-label">Outcome:</span> {s.outcome}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="detail-main-header">
              <h2 className="detail-section-title">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="detail-empty">
                <p>No reviews yet. Be the first to share your experience.</p>
                <button className="btn btn-primary" onClick={handleWriteReview}>Submit a Report</button>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}

            {/* Encourage contributions for sparse profiles */}
            {(!company.description && !company.ceo_name && connections.length === 0 && scandals.length === 0) && (
              <div className="detail-contribute">
                <h3>Help improve this page</h3>
                <p>
                  This company profile is still being built out. Know something about {company.name}?
                  Submit a report with details about their business practices, environmental impact, or corporate behavior.
                </p>
                <button className="btn btn-primary" onClick={handleWriteReview}>
                  + Submit a Report
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="detail-page">
      <NavBar />
      <div className="detail-loading">Loading…</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="detail-page">
      <NavBar />
      <div className="detail-loading">
        <h2>Company not found</h2>
        <Link to="/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Companies</Link>
      </div>
    </div>
  )
}
