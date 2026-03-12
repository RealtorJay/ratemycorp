import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import SkeletonCard from '../components/SkeletonCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { researchAndInsert } from '../lib/autoResearch'
import './PoliticiansPage.css'

const SORT_OPTIONS = [
  { value: 'accountability_score', label: 'Accountability' },
  { value: 'connection_count', label: 'Most Connected' },
  { value: 'promise_total_count', label: 'Most Tracked' },
]

const CHAMBERS = [
  { value: 'all', label: 'All Chambers' },
  { value: 'senate', label: 'Senate' },
  { value: 'house', label: 'House' },
  { value: 'executive', label: 'Executive' },
  { value: 'governor', label: 'Governor' },
]

const PARTIES = [
  { value: 'all', label: 'All Parties' },
  { value: 'Democrat', label: 'Democrat' },
  { value: 'Republican', label: 'Republican' },
  { value: 'Independent', label: 'Independent' },
]

const PARTY_COLORS = {
  Democrat: '#4B9CD3',
  Republican: '#E03C3C',
  Independent: '#888',
}

function partyDot(party) {
  return PARTY_COLORS[party] || '#555'
}

function scoreLabel(score) {
  if (score >= 70) return 'High'
  if (score >= 45) return 'Moderate'
  if (score >= 20) return 'Low'
  if (score > 0) return 'Very Low'
  return 'Unscored'
}

function scoreClass(score) {
  if (score >= 70) return 'score-high'
  if (score >= 45) return 'score-moderate'
  if (score >= 20) return 'score-low'
  if (score > 0) return 'score-verylow'
  return 'score-none'
}

function PoliticianAvatar({ name, party, size = 46 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const bg = PARTY_COLORS[party] || '#1a1a1a'
  return (
    <div
      className="politician-avatar"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

export default function PoliticiansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [chamber, setChamber] = useState('all')
  const [party, setParty] = useState('all')
  const [sortBy, setSortBy] = useState('accountability_score')
  const [politicians, setPoliticians] = useState([])
  const [loading, setLoading] = useState(true)
  const [researching, setResearching] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchPoliticians, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, chamber, party, sortBy])

  const fetchPoliticians = async () => {
    setLoading(true)
    setResearching(false)
    let q = supabase
      .from('politicians')
      .select('id, slug, full_name, party, chamber, state, title, current_office, accountability_score, promise_kept_count, promise_broken_count, promise_total_count, connection_count, in_office')
      .order(sortBy, { ascending: false })
      .limit(80)

    if (query.trim()) q = q.ilike('full_name', `%${query.trim()}%`)
    if (chamber !== 'all') q = q.eq('chamber', chamber)
    if (party !== 'all') q = q.eq('party', party)

    const { data, error } = await q
    if (error) console.error(error)
    const results = data || []
    setPoliticians(results)
    setLoading(false)

    // Auto-research: if no results and query is long enough, try Wikidata
    if (results.length === 0 && query.trim().length >= 3 && user) {
      setResearching(true)
      try {
        const result = await researchAndInsert(query.trim(), supabase)
        if (result?.type === 'politician') {
          setPoliticians([result.data])
        } else if (result?.type === 'company') {
          navigate(`/companies?q=${encodeURIComponent(query.trim())}`)
          return
        }
      } finally {
        setResearching(false)
      }
    }
  }

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSearchParams(val ? { q: val } : {})
  }

  return (
    <div className="politicians-page">
      <NavBar />
      <div className="politicians-inner">

        <div className="politicians-hero">
          <h1 className="politicians-title">Political Intelligence</h1>
          <p className="politicians-sub">
            Track promises vs. reality. Follow the money. See who your elected officials
            actually work for — backed by FEC filings, vote records, and documented evidence.
          </p>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search politicians…"
              value={query}
              onChange={handleQueryChange}
            />
          </div>
          <select
            className="filter-select"
            value={chamber}
            onChange={(e) => setChamber(e.target.value)}
          >
            {CHAMBERS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={party}
            onChange={(e) => setParty(e.target.value)}
          >
            {PARTIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="sort-tabs">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`sort-tab ${sortBy === opt.value ? 'active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="politicians-loading">Loading…</div>
        ) : researching ? (
          <div className="research-state">
            <div className="research-header">
              <span className="research-spinner" />
              <span>Researching "{query}"…</span>
            </div>
            <div className="politicians-grid">
              {[1, 2, 3].map(i => <SkeletonCard key={i} type="politician" />)}
            </div>
          </div>
        ) : politicians.length === 0 ? (
          <div className="politicians-empty">
            <p>No politicians found{query ? ` for "${query}"` : ''}.</p>
            {query && query.trim().length >= 3 && !user && (
              <p className="research-signin-hint">
                <Link to={`/auth?redirect=${encodeURIComponent('/politicians?q=' + query)}`}>Sign in</Link> to auto-discover this politician or company.
              </p>
            )}
          </div>
        ) : (
          <div className="politicians-grid">
            {politicians.map((p) => (
              <Link key={p.id} to={`/politicians/${p.slug}`} className="politician-card">
                <PoliticianAvatar name={p.full_name} party={p.party} size={48} />
                <div className="politician-info">
                  <div className="politician-name-row">
                    <h2 className="politician-name">{p.full_name}</h2>
                    {!p.in_office && <span className="politician-former">Former</span>}
                  </div>
                  <div className="politician-meta">
                    <span
                      className="politician-party"
                      style={{ color: partyDot(p.party) }}
                    >
                      {p.party}
                    </span>
                    {p.chamber && <span className="politician-sep">·</span>}
                    <span className="politician-chamber">
                      {p.chamber === 'senate' ? 'Senate' : p.chamber === 'house' ? 'House' : p.chamber === 'executive' ? 'Executive' : p.chamber === 'governor' ? 'Governor' : p.chamber}
                    </span>
                    {p.state && <span className="politician-sep">·</span>}
                    <span className="politician-state">{p.state}</span>
                  </div>
                  <div className="politician-stats">
                    {p.promise_total_count > 0 && (
                      <span className="politician-stat-pill">
                        {p.promise_kept_count}/{p.promise_total_count} promises kept
                      </span>
                    )}
                    {p.connection_count > 0 && (
                      <span className="politician-stat-pill">
                        {p.connection_count} corporate {p.connection_count === 1 ? 'tie' : 'ties'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="politician-score-wrap">
                  <span className={`politician-score ${scoreClass(p.accountability_score)}`}>
                    {p.accountability_score > 0 ? Math.round(p.accountability_score) : '—'}
                  </span>
                  <span className={`politician-score-label ${scoreClass(p.accountability_score)}`}>
                    {scoreLabel(p.accountability_score)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
