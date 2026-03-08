import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './PoliticianDetailPage.css'

const PARTY_COLORS = {
  Democrat: '#4B9CD3',
  Republican: '#E03C3C',
  Independent: '#888',
}

const PROMISE_STATUS_META = {
  kept:        { label: 'Kept',        color: '#6ee7b7', bg: 'rgba(110,231,183,0.08)', border: 'rgba(110,231,183,0.2)' },
  broken:      { label: 'Broken',      color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  compromised: { label: 'Compromised', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)' },
  stalled:     { label: 'Stalled',     color: '#888',    bg: 'rgba(136,136,136,0.06)', border: 'rgba(136,136,136,0.15)' },
  pending:     { label: 'Pending',     color: '#555',    bg: 'transparent',            border: '#1e1e1e' },
  not_yet_due: { label: 'In Progress', color: '#666',    bg: 'transparent',            border: '#1e1e1e' },
}

const CONNECTION_LABELS = {
  campaign_donation:    'Campaign Donation',
  super_pac:            'Super PAC',
  lobbying_client:      'Lobbying Client',
  revolving_door_from:  'Revolving Door (Came From)',
  revolving_door_to:    'Revolving Door (Went To)',
  board_seat:           'Board Seat',
  stock_ownership:      'Stock Ownership',
  family_connection:    'Family Connection',
  bundler:              'Bundler',
  industry_pac:         'Industry PAC',
}

function formatCents(cents) {
  if (!cents) return '—'
  const dollars = cents / 100
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`
  return `$${dollars.toLocaleString()}`
}

function PoliticianAvatar({ name, party, size = 80 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const bg = PARTY_COLORS[party] || '#1a1a1a'
  return (
    <div
      className="detail-pol-avatar"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

function AccountabilityMeter({ score }) {
  const pct = Math.min(100, Math.max(0, score || 0))
  let color = '#333'
  if (pct >= 70) color = '#6ee7b7'
  else if (pct >= 45) color = '#fbbf24'
  else if (pct >= 20) color = '#f87171'
  else if (pct > 0) color = '#555'

  return (
    <div className="accountability-meter">
      <div className="meter-label">Accountability Score</div>
      <div className="meter-value" style={{ color }}>{pct > 0 ? Math.round(pct) : '—'}<span className="meter-max">/100</span></div>
      <div className="meter-bar-bg">
        <div
          className="meter-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="meter-note">Based on promises kept vs. broken</div>
    </div>
  )
}

function PromiseCard({ promise }) {
  const meta = PROMISE_STATUS_META[promise.status] || PROMISE_STATUS_META.pending
  return (
    <div
      className="promise-card"
      style={{ borderColor: meta.border, background: meta.bg }}
    >
      <div className="promise-card-header">
        <span className="promise-category">{promise.category.replace(/_/g, ' ')}</span>
        <span className="promise-status-badge" style={{ color: meta.color, borderColor: meta.border }}>
          {meta.label}
        </span>
      </div>
      <p className="promise-text">{promise.promise_text}</p>
      {promise.verdict_notes && (
        <p className="promise-verdict">{promise.verdict_notes}</p>
      )}
      <div className="promise-footer">
        {promise.source_type && (
          <span className="promise-source-type">{promise.source_type.replace(/_/g, ' ')}</span>
        )}
        {promise.verdict_source && (
          <a href={promise.verdict_source} target="_blank" rel="noreferrer" className="promise-source-link">
            Source →
          </a>
        )}
      </div>
    </div>
  )
}

function ConnectionRow({ connection }) {
  const company = connection.companies
  if (!company) return null
  return (
    <div className="connection-row">
      <div className="connection-company">
        <div className="connection-logo">
          {company.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <Link to={`/companies/${company.slug}`} className="connection-company-name">
            {company.name}
          </Link>
          <div className="connection-type-label">
            {CONNECTION_LABELS[connection.connection_type] || connection.connection_type}
          </div>
        </div>
      </div>
      <div className="connection-right">
        {connection.amount_display && connection.amount_display !== 'N/A' && (
          <span className="connection-amount">{connection.amount_display}</span>
        )}
        {connection.cycle && <span className="connection-cycle">{connection.cycle}</span>}
        {connection.source_url && (
          <a href={connection.source_url} target="_blank" rel="noreferrer" className="connection-source">
            Source →
          </a>
        )}
      </div>
    </div>
  )
}

export default function PoliticianDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [politician, setPolitician] = useState(null)
  const [promises, setPromises] = useState([])
  const [connections, setConnections] = useState([])
  const [committees, setCommittees] = useState([])
  const [votes, setVotes] = useState([])
  const [education, setEducation] = useState([])
  const [career, setCareer] = useState([])
  const [family, setFamily] = useState([])
  const [netWorth, setNetWorth] = useState([])
  const [financials, setFinancials] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { loadData() }, [slug])

  const loadData = async () => {
    setLoading(true)

    const { data: pol, error } = await supabase
      .from('politicians')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !pol) { setNotFound(true); setLoading(false); return }
    setPolitician(pol)

    const [promisesRes, connectionsRes, committeesRes, votesRes, eduRes, careerRes, familyRes, nwRes, finRes] = await Promise.all([
      supabase.from('political_promises').select('*').eq('politician_id', pol.id).order('created_at', { ascending: false }),
      supabase.from('politician_company_connections').select('*, companies(id, slug, name, website)').eq('politician_id', pol.id).order('amount_cents', { ascending: false }),
      supabase.from('committee_assignments').select('*').eq('politician_id', pol.id).eq('is_current', true),
      supabase.from('votes').select('*').eq('politician_id', pol.id).order('vote_date', { ascending: false }).limit(20),
      supabase.from('politician_education').select('*').eq('politician_id', pol.id).order('start_year', { ascending: true }),
      supabase.from('politician_career_history').select('*').eq('politician_id', pol.id).order('start_date', { ascending: false }),
      supabase.from('politician_family_connections').select('*').eq('politician_id', pol.id),
      supabase.from('politician_net_worth').select('*').eq('politician_id', pol.id).order('year', { ascending: false }),
      supabase.from('politician_financial_disclosures').select('*').eq('politician_id', pol.id).order('disclosure_year', { ascending: false }),
    ])

    setPromises(promisesRes.data || [])
    setConnections(connectionsRes.data || [])
    setCommittees(committeesRes.data || [])
    setVotes(votesRes.data || [])
    setEducation(eduRes.data || [])
    setCareer(careerRes.data || [])
    setFamily(familyRes.data || [])
    setNetWorth(nwRes.data || [])
    setFinancials(finRes.data || [])
    setLoading(false)
  }

  const handleSubmitPromise = () => {
    if (!user) navigate(`/auth?redirect=/politicians/${slug}`)
    else navigate(`/politicians/${slug}/submit-promise`)
  }

  const handleSubmitConnection = () => {
    if (!user) navigate(`/auth?redirect=/politicians/${slug}`)
    else navigate(`/politicians/${slug}/submit-connection`)
  }

  if (loading) return <LoadingScreen />
  if (notFound) return <NotFound />

  const partyColor = PARTY_COLORS[politician.party] || '#555'
  const keptCount = promises.filter(p => p.status === 'kept').length
  const brokenCount = promises.filter(p => p.status === 'broken').length
  const totalScored = promises.filter(p => !['pending', 'not_yet_due'].includes(p.status)).length

  const hasBackground = education.length > 0 || career.length > 0 || family.length > 0
  const hasFinances = netWorth.length > 0 || financials.length > 0

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'promises', label: `Promises (${promises.length})` },
    { key: 'connections', label: `Corp Connections (${connections.length})` },
    { key: 'background', label: 'Background' },
    { key: 'finances', label: 'Finances' },
    { key: 'votes', label: `Votes (${votes.length})` },
  ]

  return (
    <div className="pol-detail-page">
      <NavBar />

      {/* Header */}
      <div className="pol-detail-header">
        <div className="pol-detail-header-inner">
          <PoliticianAvatar name={politician.full_name} party={politician.party} size={80} />
          <div className="pol-detail-info">
            <div className="pol-detail-breadcrumb">
              <Link to="/politicians">Politicians</Link> / {politician.full_name}
            </div>
            <h1 className="pol-detail-name">{politician.full_name}</h1>
            <div className="pol-detail-meta">
              <span className="pol-party-badge" style={{ color: partyColor, borderColor: `${partyColor}30` }}>
                {politician.party}
              </span>
              {politician.title && <span className="pol-title">{politician.title}</span>}
              {politician.state && <span className="pol-state">{politician.state}</span>}
              {!politician.in_office && <span className="pol-former-badge">Former</span>}
            </div>
            <p className="pol-office">{politician.current_office}</p>
          </div>
          <div className="pol-header-actions">
            <button className="btn btn-outline" onClick={handleSubmitConnection}>+ Add Connection</button>
            <button className="btn btn-primary" onClick={handleSubmitPromise}>+ Track Promise</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pol-detail-body">
        <div className="pol-detail-body-inner">

          {/* Sidebar */}
          <aside className="pol-detail-sidebar">
            <AccountabilityMeter score={politician.accountability_score} />

            {/* Promise scorecard */}
            {totalScored > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Promise Scorecard</h3>
                <div className="promise-scorecard">
                  <div className="ps-item ps-kept">
                    <span className="ps-num">{keptCount}</span>
                    <span className="ps-lbl">Kept</span>
                  </div>
                  <div className="ps-item ps-broken">
                    <span className="ps-num">{brokenCount}</span>
                    <span className="ps-lbl">Broken</span>
                  </div>
                  <div className="ps-item ps-total">
                    <span className="ps-num">{totalScored}</span>
                    <span className="ps-lbl">Scored</span>
                  </div>
                </div>
              </div>
            )}

            {/* Top corporate ties */}
            {connections.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Top Corporate Ties</h3>
                <div className="sidebar-connections">
                  {connections.slice(0, 5).map((c) => (
                    <div key={c.id} className="sidebar-connection-item">
                      <div className="sidebar-conn-logo">
                        {c.companies?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="sidebar-conn-info">
                        <Link to={`/companies/${c.companies?.slug}`} className="sidebar-conn-name">
                          {c.companies?.name}
                        </Link>
                        <span className="sidebar-conn-type">
                          {CONNECTION_LABELS[c.connection_type]}
                        </span>
                      </div>
                      {c.amount_display && c.amount_display !== 'N/A' && (
                        <span className="sidebar-conn-amount">{c.amount_display}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Committee assignments */}
            {committees.length > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Committee Assignments</h3>
                <ul className="committees-list">
                  {committees.map((c) => (
                    <li key={c.id} className="committee-item">
                      <span className="committee-role">
                        {c.role === 'chair' ? 'Chair' : c.role === 'ranking_member' ? 'Ranking Member' : ''}
                      </span>
                      {c.committee_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* External links */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">External Links</h3>
              <div className="external-links">
                {politician.official_website && (
                  <a href={politician.official_website} target="_blank" rel="noreferrer" className="ext-link">
                    Official Website →
                  </a>
                )}
                {politician.bioguide_id && (
                  <a href={`https://bioguide.congress.gov/search/bio/${politician.bioguide_id}`} target="_blank" rel="noreferrer" className="ext-link">
                    Congress.gov →
                  </a>
                )}
                {politician.bioguide_id && (
                  <a href={`https://www.opensecrets.org/politicians/summary?cid=${politician.bioguide_id}`} target="_blank" rel="noreferrer" className="ext-link">
                    OpenSecrets →
                  </a>
                )}
                <a href={`https://ballotpedia.org/${politician.full_name.replace(/ /g, '_')}`} target="_blank" rel="noreferrer" className="ext-link">
                  Ballotpedia →
                </a>
                <a href={`https://votesmart.org/search?q=${encodeURIComponent(politician.full_name)}`} target="_blank" rel="noreferrer" className="ext-link">
                  VoteSmart →
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="pol-detail-main">

            {/* Tabs */}
            <div className="pol-tabs">
              {tabs.map(t => (
                <button
                  key={t.key}
                  className={`pol-tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                {politician.bio && (
                  <div className="pol-bio-section">
                    <h2 className="pol-section-title">Profile</h2>
                    <p className="pol-bio">{politician.bio}</p>
                  </div>
                )}

                {promises.length > 0 && (
                  <div className="pol-section">
                    <div className="pol-section-header">
                      <h2 className="pol-section-title">Recent Promises</h2>
                      <button className="ghost-more" onClick={() => setActiveTab('promises')}>View all →</button>
                    </div>
                    <div className="promises-list">
                      {promises.slice(0, 3).map(p => <PromiseCard key={p.id} promise={p} />)}
                    </div>
                  </div>
                )}

                {connections.length > 0 && (
                  <div className="pol-section">
                    <div className="pol-section-header">
                      <h2 className="pol-section-title">Corporate Connections</h2>
                      <button className="ghost-more" onClick={() => setActiveTab('connections')}>View all →</button>
                    </div>
                    <div className="connections-list">
                      {connections.slice(0, 5).map(c => <ConnectionRow key={c.id} connection={c} />)}
                    </div>
                  </div>
                )}

                {promises.length === 0 && connections.length === 0 && (
                  <div className="pol-empty">
                    <p>No data yet. Be the first to track a promise or corporate connection for {politician.full_name}.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                      <button className="btn btn-outline" onClick={handleSubmitConnection}>+ Add Connection</button>
                      <button className="btn btn-primary" onClick={handleSubmitPromise}>+ Track Promise</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Promises tab */}
            {activeTab === 'promises' && (
              <div className="tab-content">
                {promises.length === 0 ? (
                  <div className="pol-empty">
                    <p>No promises tracked yet.</p>
                    <button className="btn btn-primary" onClick={handleSubmitPromise}>Track a Promise</button>
                  </div>
                ) : (
                  <>
                    <div className="promise-filter-row">
                      {['all', 'kept', 'broken', 'compromised', 'stalled'].map(s => {
                        const count = s === 'all' ? promises.length : promises.filter(p => p.status === s).length
                        return (
                          <span key={s} className="promise-filter-tag">
                            {s === 'all' ? 'All' : PROMISE_STATUS_META[s]?.label} ({count})
                          </span>
                        )
                      })}
                    </div>
                    <div className="promises-list">
                      {promises.map(p => <PromiseCard key={p.id} promise={p} />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Connections tab */}
            {activeTab === 'connections' && (
              <div className="tab-content">
                {connections.length === 0 ? (
                  <div className="pol-empty">
                    <p>No corporate connections documented yet.</p>
                    <button className="btn btn-primary" onClick={handleSubmitConnection}>Add Connection</button>
                  </div>
                ) : (
                  <>
                    <p className="tab-desc">
                      Documented financial and professional ties between {politician.full_name} and corporations.
                      All entries require a source URL. FEC filings, SEC disclosures, and OpenSecrets data preferred.
                    </p>
                    <div className="connections-list">
                      {connections.map(c => <ConnectionRow key={c.id} connection={c} />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Background tab */}
            {activeTab === 'background' && (
              <div className="tab-content">
                {/* Education */}
                <div className="pol-section">
                  <h2 className="pol-section-title">Education</h2>
                  {education.length === 0 ? (
                    <p className="pol-empty-inline">No education records yet.</p>
                  ) : (
                    <div className="background-timeline">
                      {education.map(e => (
                        <div key={e.id} className="timeline-item">
                          <div className="timeline-dot" />
                          <div className="timeline-content">
                            <div className="timeline-title">{e.institution}</div>
                            <div className="timeline-meta">
                              {e.degree && <span className="timeline-degree">{e.degree}</span>}
                              {e.field_of_study && <span> in {e.field_of_study}</span>}
                            </div>
                            <div className="timeline-dates">
                              {e.start_year}{e.end_year ? `–${e.end_year}` : ''}
                              {e.honors && <span className="timeline-honors"> · {e.honors}</span>}
                            </div>
                            {e.notes && <div className="timeline-notes">{e.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career */}
                <div className="pol-section">
                  <h2 className="pol-section-title">Career History</h2>
                  {career.length === 0 ? (
                    <p className="pol-empty-inline">No career records yet.</p>
                  ) : (
                    <div className="background-timeline">
                      {career.map(c => (
                        <div key={c.id} className="timeline-item">
                          <div className="timeline-dot" style={{
                            background: c.sector === 'public' ? '#4B9CD3' :
                              c.sector === 'military' ? '#6ee7b7' :
                              c.sector === 'private' ? '#fbbf24' :
                              c.sector === 'legal' ? '#c084fc' :
                              c.sector === 'academic' ? '#f472b6' :
                              c.sector === 'nonprofit' ? '#22d3ee' :
                              c.sector === 'media' ? '#fb923c' : '#555'
                          }} />
                          <div className="timeline-content">
                            <div className="timeline-title">{c.position_title}</div>
                            <div className="timeline-org">{c.organization}</div>
                            <div className="timeline-meta">
                              {c.sector && <span className="timeline-sector">{c.sector}</span>}
                              {c.is_current && <span className="timeline-current">Current</span>}
                            </div>
                            <div className="timeline-dates">
                              {c.start_date?.slice(0, 4)}{c.end_date ? `–${c.end_date.slice(0, 4)}` : c.is_current ? '–present' : ''}
                            </div>
                            {c.description && <div className="timeline-notes">{c.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Family */}
                <div className="pol-section">
                  <h2 className="pol-section-title">Family Connections</h2>
                  {family.length === 0 ? (
                    <p className="pol-empty-inline">No family connection records yet.</p>
                  ) : (
                    <div className="family-grid">
                      {family.map(f => (
                        <div key={f.id} className="family-card">
                          <div className="family-relation">{f.relation_type}</div>
                          <div className="family-name">{f.relation_name}</div>
                          {f.occupation && <div className="family-occupation">{f.occupation}</div>}
                          {f.employer && <div className="family-employer">at {f.employer}</div>}
                          {f.relevant_holdings && <div className="family-holdings">{f.relevant_holdings}</div>}
                          {f.notes && <div className="family-notes">{f.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!hasBackground && (
                  <div className="pol-empty">
                    <p>No background data available yet for {politician.full_name}.</p>
                  </div>
                )}
              </div>
            )}

            {/* Finances tab */}
            {activeTab === 'finances' && (
              <div className="tab-content">
                {/* Net Worth */}
                <div className="pol-section">
                  <h2 className="pol-section-title">Estimated Net Worth</h2>
                  {netWorth.length === 0 ? (
                    <p className="pol-empty-inline">No net worth estimates available.</p>
                  ) : (
                    <div className="networth-list">
                      {netWorth.map(n => (
                        <div key={n.id} className="networth-row">
                          <span className="networth-year">{n.year}</span>
                          <span className="networth-range">
                            {formatCents(n.estimated_min)} – {formatCents(n.estimated_max)}
                          </span>
                          {n.source && <span className="networth-source">{n.source}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Disclosures */}
                <div className="pol-section">
                  <h2 className="pol-section-title">Financial Disclosures</h2>
                  {financials.length === 0 ? (
                    <p className="pol-empty-inline">No financial disclosure records available.</p>
                  ) : (
                    <div className="disclosures-list">
                      {financials.map(f => (
                        <div key={f.id} className="disclosure-card">
                          <div className="disclosure-header">
                            <span className="disclosure-year">{f.disclosure_year}</span>
                            {f.filing_type && <span className="disclosure-type">{f.filing_type}</span>}
                            {f.transaction_type && <span className="disclosure-transaction">{f.transaction_type}</span>}
                          </div>
                          <div className="disclosure-asset">{f.asset_description}</div>
                          {(f.asset_value_min || f.asset_value_max) && (
                            <div className="disclosure-value">
                              Value: {formatCents(f.asset_value_min)} – {formatCents(f.asset_value_max)}
                            </div>
                          )}
                          {f.transaction_date && (
                            <div className="disclosure-date">Date: {f.transaction_date}</div>
                          )}
                          {f.notes && <div className="disclosure-notes">{f.notes}</div>}
                          {f.source_type && <div className="disclosure-source-type">{f.source_type.replace(/_/g, ' ')}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!hasFinances && (
                  <div className="pol-empty">
                    <p>No financial data available yet for {politician.full_name}.</p>
                  </div>
                )}
              </div>
            )}

            {/* Votes tab */}
            {activeTab === 'votes' && (
              <div className="tab-content">
                {votes.length === 0 ? (
                  <div className="pol-empty">
                    <p>No voting records imported yet. Vote data is sourced from ProPublica Congress API and congress.gov.</p>
                  </div>
                ) : (
                  <div className="votes-list">
                    {votes.map(v => (
                      <div key={v.id} className="vote-row">
                        <div className="vote-position-wrap">
                          <span className={`vote-position vote-${v.position}`}>
                            {v.position === 'yea' ? 'YEA' : v.position === 'nay' ? 'NAY' : v.position.toUpperCase()}
                          </span>
                        </div>
                        <div className="vote-info">
                          <div className="vote-bill">{v.bill_number} — {v.bill_title}</div>
                          <div className="vote-meta">
                            {v.vote_date} {v.bill_category && <span>· {v.bill_category}</span>}
                          </div>
                        </div>
                        {v.source_url && (
                          <a href={v.source_url} target="_blank" rel="noreferrer" className="vote-source">→</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
    <div className="pol-detail-page">
      <NavBar />
      <div className="pol-loading">Loading…</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="pol-detail-page">
      <NavBar />
      <div className="pol-loading">
        <h2>Politician not found</h2>
        <Link to="/politicians" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Politicians</Link>
      </div>
    </div>
  )
}
