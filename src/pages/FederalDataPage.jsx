import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import {
  cfpbComplaints,
  fdaRecalls,
  cpscRecalls,
  usaspendingSearch,
  secFullTextSearch,
} from '../lib/govApis'
import './FederalDataPage.css'

const SOURCES = [
  { key: 'sec', label: 'SEC Filings', icon: '📊', color: '#3b82f6', desc: 'Securities filings, insider trading, material events' },
  { key: 'cfpb', label: 'Consumer Complaints', icon: '📢', color: '#ef4444', desc: 'CFPB complaint database — banking, credit, mortgages' },
  { key: 'fda', label: 'FDA Recalls', icon: '💊', color: '#f97316', desc: 'Drug, device, and food recalls + enforcement actions' },
  { key: 'cpsc', label: 'Product Recalls', icon: '⚠️', color: '#eab308', desc: 'Consumer product safety recalls and hazard alerts' },
  { key: 'spending', label: 'Gov Contracts', icon: '💰', color: '#10b981', desc: 'Federal contracts, grants, and direct payments' },
]

export default function FederalDataPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [companies, setCompanies] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)

  const source = searchParams.get('source') || 'sec'
  const companySlug = searchParams.get('company') || ''

  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, slug, website, industry, stock_ticker')
      .order('name')
      .then(({ data }) => setCompanies(data || []))
  }, [])

  // When company changes, find the company object
  useEffect(() => {
    if (companySlug && companies.length) {
      const co = companies.find(c => c.slug === companySlug)
      setSelectedCompany(co || null)
    } else {
      setSelectedCompany(null)
    }
  }, [companySlug, companies])

  // Fetch data when company + source selected
  const fetchData = useCallback(async () => {
    if (!selectedCompany) { setResults(null); return }
    setLoading(true)
    setResults(null)

    try {
      let data
      switch (source) {
        case 'sec':
          data = await secFullTextSearch(selectedCompany.name, { limit: 20 })
          break
        case 'cfpb':
          data = await cfpbComplaints(selectedCompany.name, { limit: 20 })
          break
        case 'fda':
          data = await fdaRecalls(selectedCompany.name, { limit: 20 })
          break
        case 'cpsc':
          data = await cpscRecalls(selectedCompany.name, { limit: 20 })
          break
        case 'spending':
          data = await usaspendingSearch(selectedCompany.name, { limit: 20 })
          break
        default:
          data = null
      }
      setResults(data)
    } catch (err) {
      console.error('Federal data fetch error:', err)
      setResults({ error: true })
    }
    setLoading(false)
  }, [selectedCompany, source])

  useEffect(() => { fetchData() }, [fetchData])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const activeSource = SOURCES.find(s => s.key === source)

  return (
    <div className="fed-page">
      <NavBar />

      <header className="fed-hero">
        <div className="fed-hero-inner">
          <span className="fed-eyebrow">Government Intelligence</span>
          <h1 className="fed-headline">Federal Records Search</h1>
          <p className="fed-sub">
            Search SEC filings, consumer complaints, product recalls, and federal contracts
            for any company — pulled directly from government databases in real-time.
          </p>
        </div>
      </header>

      <div className="fed-body">
        <div className="fed-body-inner">

          {/* Source selector */}
          <div className="fed-sources">
            {SOURCES.map(s => (
              <button
                key={s.key}
                className={`fed-source-card ${source === s.key ? 'active' : ''}`}
                onClick={() => updateParam('source', s.key)}
                style={{ '--src-color': s.color }}
              >
                <span className="fed-source-icon">{s.icon}</span>
                <span className="fed-source-label">{s.label}</span>
                <span className="fed-source-desc">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Company selector */}
          <div className="fed-search-bar">
            <div className="fed-search-group">
              <label className="fed-label">Select Company</label>
              <select
                className="fed-select"
                value={companySlug}
                onChange={e => updateParam('company', e.target.value)}
              >
                <option value="">Choose a company...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCompany && (
              <div className="fed-selected-company">
                <CompanyLogo name={selectedCompany.name} website={selectedCompany.website} size={32} />
                <div>
                  <div className="fed-selected-name">{selectedCompany.name}</div>
                  <div className="fed-selected-meta">
                    {selectedCompany.industry}
                    {selectedCompany.stock_ticker && ` · ${selectedCompany.stock_ticker}`}
                  </div>
                </div>
                <Link to={`/companies/${selectedCompany.slug}`} className="fed-view-profile">
                  View profile →
                </Link>
              </div>
            )}
          </div>

          {/* Results */}
          {!selectedCompany && (
            <div className="fed-prompt">
              <div className="fed-prompt-icon">🏛️</div>
              <h3>Select a company to search</h3>
              <p>Choose a company above to pull real-time data from {activeSource?.label || 'federal databases'}.</p>
            </div>
          )}

          {loading && (
            <div className="fed-loading">
              <div className="fed-spinner" />
              <span>Querying {activeSource?.label}...</span>
            </div>
          )}

          {results?.error && (
            <div className="fed-error">
              <p>Failed to fetch data. The government API may be temporarily unavailable.</p>
              <button className="btn btn-outline" onClick={fetchData}>Retry</button>
            </div>
          )}

          {results && !results.error && !loading && (
            <div className="fed-results">
              <div className="fed-results-header">
                <h2 className="fed-results-title">
                  <span className="fed-results-dot" style={{ background: activeSource?.color }} />
                  {activeSource?.label} — {selectedCompany?.name}
                </h2>
                <span className="fed-results-count">
                  {getResultCount(results, source)} results
                </span>
              </div>

              {source === 'sec' && <SECResults data={results} />}
              {source === 'cfpb' && <CFPBResults data={results} />}
              {source === 'fda' && <FDAResults data={results} />}
              {source === 'cpsc' && <CPSCResults data={results} />}
              {source === 'spending' && <SpendingResults data={results} />}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">CorpWatch</span>
          <p className="footer-copy">© {new Date().getFullYear()} CorpWatch. Data sourced from public government databases.</p>
        </div>
      </footer>
    </div>
  )
}

function getResultCount(results, source) {
  if (!results) return 0
  if (source === 'sec') return results.total || 0
  if (source === 'cfpb') return results.total || 0
  if (source === 'fda') return Array.isArray(results) ? results.length : 0
  if (source === 'cpsc') return Array.isArray(results) ? results.length : 0
  if (source === 'spending') return results.total || 0
  return 0
}

function SECResults({ data }) {
  const filings = data?.filings || []
  if (filings.length === 0) return <EmptyResults source="SEC EDGAR" />
  return (
    <div className="fed-list">
      {filings.map((f, i) => (
        <div key={i} className="fed-card">
          <div className="fed-card-top">
            <span className="fed-badge" style={{ '--badge-color': '#3b82f6' }}>{f.type || 'Filing'}</span>
            {f.date && <span className="fed-card-date">{f.date}</span>}
          </div>
          <div className="fed-card-title">{f.entity}</div>
          {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="fed-card-link">View on SEC.gov →</a>}
        </div>
      ))}
      {data.total > filings.length && (
        <div className="fed-more">Showing {filings.length} of {data.total.toLocaleString()} filings</div>
      )}
    </div>
  )
}

function CFPBResults({ data }) {
  const complaints = data?.complaints || []
  if (complaints.length === 0) return <EmptyResults source="CFPB" />
  return (
    <div className="fed-list">
      <div className="fed-summary-bar">
        <span>{data.total?.toLocaleString()} total complaints</span>
      </div>
      {complaints.map((c, i) => (
        <div key={i} className="fed-card">
          <div className="fed-card-top">
            <span className="fed-badge" style={{ '--badge-color': '#ef4444' }}>{c.product}</span>
            {c.date && <span className="fed-card-date">{c.date}</span>}
          </div>
          <div className="fed-card-title">{c.issue}</div>
          {c.subIssue && <div className="fed-card-subtitle">{c.subIssue}</div>}
          {c.narrative && <p className="fed-card-desc">{c.narrative.slice(0, 300)}{c.narrative.length > 300 ? '...' : ''}</p>}
          <div className="fed-card-meta">
            {c.companyResponse && <span className="fed-meta-tag">{c.companyResponse}</span>}
            {c.timely === 'Yes' && <span className="fed-meta-tag good">Timely Response</span>}
            {c.state && <span className="fed-meta-tag">{c.state}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function FDAResults({ data }) {
  if (!Array.isArray(data) || data.length === 0) return <EmptyResults source="openFDA" />
  return (
    <div className="fed-list">
      {data.map((r, i) => (
        <div key={i} className="fed-card">
          <div className="fed-card-top">
            <span className="fed-badge" style={{ '--badge-color': '#f97316' }}>FDA {r.type}</span>
            {r.classification && (
              <span className={`fed-class fed-class-${r.classification.toLowerCase()}`}>
                Class {r.classification}
              </span>
            )}
            {r.recallDate && <span className="fed-card-date">{r.recallDate}</span>}
          </div>
          <div className="fed-card-title">{r.reason}</div>
          {r.productDescription && <p className="fed-card-desc">{r.productDescription.slice(0, 200)}...</p>}
          <div className="fed-card-meta">
            <span className="fed-meta-tag">{r.status}</span>
            {r.voluntaryMandated && <span className="fed-meta-tag">{r.voluntaryMandated}</span>}
            {r.distribution && <span className="fed-meta-tag">{r.distribution.slice(0, 60)}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function CPSCResults({ data }) {
  if (!Array.isArray(data) || data.length === 0) return <EmptyResults source="CPSC" />
  return (
    <div className="fed-list">
      {data.map((r, i) => (
        <div key={i} className="fed-card">
          <div className="fed-card-top">
            <span className="fed-badge" style={{ '--badge-color': '#eab308' }}>CPSC</span>
            {r.recallDate && <span className="fed-card-date">{r.recallDate}</span>}
          </div>
          <div className="fed-card-title">{r.title}</div>
          {r.description && <p className="fed-card-desc">{r.description.slice(0, 250)}...</p>}
          {r.hazards?.length > 0 && (
            <div className="fed-hazards">
              {r.hazards.map((h, j) => <span key={j} className="fed-hazard">{h}</span>)}
            </div>
          )}
          {r.remedies?.length > 0 && (
            <div className="fed-card-meta">
              {r.remedies.map((rem, j) => <span key={j} className="fed-meta-tag good">{rem}</span>)}
            </div>
          )}
          {r.units && <div className="fed-units">{r.units} units affected</div>}
          {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="fed-card-link">View full recall →</a>}
        </div>
      ))}
    </div>
  )
}

function SpendingResults({ data }) {
  const awards = data?.awards || []
  if (awards.length === 0) return <EmptyResults source="USAspending" />
  return (
    <div className="fed-list">
      <div className="fed-summary-bar">
        <span>{data.total?.toLocaleString()} federal awards</span>
      </div>
      {awards.map((a, i) => (
        <div key={i} className="fed-card">
          <div className="fed-card-top">
            <span className="fed-badge" style={{ '--badge-color': '#10b981' }}>{a.type || 'Award'}</span>
            {a.startDate && <span className="fed-card-date">{a.startDate}</span>}
          </div>
          <div className="fed-card-title">{a.description || a.recipient}</div>
          <div className="fed-card-meta">
            {a.amount && <span className="fed-amount">{formatAmount(a.amount)}</span>}
            {a.agency && <span className="fed-meta-tag">{a.agency}</span>}
            {a.subAgency && <span className="fed-meta-tag">{a.subAgency}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyResults({ source }) {
  return (
    <div className="fed-empty">
      <p>No results found in {source} for this company.</p>
      <p className="fed-empty-hint">Try a different data source or verify the company name matches government records.</p>
    </div>
  )
}

function formatAmount(amount) {
  if (!amount) return ''
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return amount
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}
