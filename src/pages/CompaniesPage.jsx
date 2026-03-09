import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Stars from '../components/Stars'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import './CompaniesPage.css'

const SORT_OPTIONS = [
  { value: 'name', label: 'A–Z' },
  { value: 'avg_overall', label: 'Top Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
]

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [industry, setIndustry] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [companies, setCompanies] = useState([])
  const [industries, setIndustries] = useState([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef(null)

  // Load industry filter options once
  useEffect(() => {
    supabase
      .from('companies')
      .select('industry')
      .not('industry', 'is', null)
      .limit(10000)
      .then(({ data }) => {
        const unique = [...new Set((data || []).map((c) => c.industry).filter(Boolean))].sort()
        setIndustries(unique)
      })
  }, [])

  // Fetch companies when filters change (debounced on query)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchCompanies, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, industry, sortBy])

  const fetchCompanies = async () => {
    setLoading(true)
    const ascending = sortBy === 'name'
    let q = supabase
      .from('companies')
      .select('id, name, slug, industry, website, review_count, avg_overall')
      .order(sortBy, { ascending, nullsFirst: false })
      .limit(500)

    if (query.trim()) q = q.ilike('name', `%${query.trim()}%`)
    if (industry !== 'all') q = q.eq('industry', industry)

    const { data } = await q
    setCompanies(data || [])
    setLoading(false)
  }

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setSearchParams(val ? { q: val } : {})
  }

  return (
    <div className="companies-page">
      <NavBar />
      <div className="companies-inner">
        <h1 className="companies-title">Browse Companies</h1>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by company name…"
              value={query}
              onChange={handleQueryChange}
            />
          </div>
          <select
            className="filter-select"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
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

        {/* Results */}
        {loading ? (
          <div className="companies-loading">Loading…</div>
        ) : companies.length === 0 ? (
          <div className="companies-empty">
            <p>No companies found{query ? ` for "${query}"` : ''}.</p>
          </div>
        ) : (
          <div className="companies-grid">
            {companies.map((c) => (
              <Link key={c.id} to={`/companies/${c.slug}`} className="company-card">
                <CompanyLogo name={c.name} website={c.website} size={46} />
                <div className="company-info">
                  <h2 className="company-name">{c.name}</h2>
                  {c.industry && <span className="company-industry">{c.industry}</span>}
                  <Stars rating={c.avg_overall} size="sm" />
                  <p className="company-review-count">
                    {c.review_count} {c.review_count === 1 ? 'report' : 'reports'}
                  </p>
                </div>
                <span className="company-arrow">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
