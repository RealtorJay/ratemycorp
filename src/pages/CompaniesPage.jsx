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

const PAGE_SIZE = 60

function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [industry, setIndustry] = useState(searchParams.get('industry') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [companies, setCompanies] = useState([])
  const [industries, setIndustries] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [totalCount, setTotalCount] = useState(0)
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [query, industry, sortBy])

  // Fetch companies when filters or page change (debounced on query)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchCompanies, query ? 300 : 0)
    return () => clearTimeout(debounceRef.current)
  }, [query, industry, sortBy, page])

  // Sync URL params
  useEffect(() => {
    const params = {}
    if (query) params.q = query
    if (industry !== 'all') params.industry = industry
    if (sortBy !== 'name') params.sort = sortBy
    if (page > 1) params.page = String(page)
    setSearchParams(params, { replace: true })
  }, [query, industry, sortBy, page])

  const fetchCompanies = async () => {
    setLoading(true)
    const ascending = sortBy === 'name'
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let q = supabase
      .from('companies')
      .select('id, name, slug, industry, website, review_count, avg_overall', { count: 'exact' })
      .order(sortBy, { ascending, nullsFirst: false })
      .range(from, to)

    if (query.trim()) q = q.ilike('name', `%${query.trim()}%`)
    if (industry !== 'all') q = q.eq('industry', industry)

    const { data, count } = await q
    setCompanies(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleQueryChange = (e) => {
    setQuery(e.target.value)
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

        {/* Results count */}
        {!loading && totalCount > 0 && (
          <div className="results-meta">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} companies
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="companies-loading">Loading…</div>
        ) : companies.length === 0 ? (
          <div className="companies-empty">
            <p>No companies found{query ? ` for "${query}"` : ''}.</p>
          </div>
        ) : (
          <>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => { setPage(1); window.scrollTo(0, 0) }}
                >
                  First
                </button>
                <button
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0) }}
                >
                  Prev
                </button>

                {generatePageNumbers(page, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="pagination-dots">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`pagination-btn ${p === page ? 'active' : ''}`}
                      onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0) }}
                >
                  Next
                </button>
                <button
                  className="pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => { setPage(totalPages); window.scrollTo(0, 0) }}
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
