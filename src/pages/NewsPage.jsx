import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import './NewsPage.css'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'scandal', label: 'Scandals' },
  { value: 'legal', label: 'Legal' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'labor', label: 'Labor' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'financial', label: 'Financial' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'sentiment_low', label: 'Most Negative' },
  { value: 'sentiment_high', label: 'Most Positive' },
]

const PER_PAGE = 24

function sentimentTag(val) {
  if (val == null) return null
  if (val <= 0.3) return { cls: 'neg', label: 'Negative' }
  if (val <= 0.6) return { cls: 'neu', label: 'Neutral' }
  return { cls: 'pos', label: 'Positive' }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function categoryColor(cat) {
  const map = {
    scandal: '#ef4444', legal: '#f59e0b', regulatory: '#f97316',
    environmental: '#22c55e', labor: '#3b82f6', consumer: '#8b5cf6',
    financial: '#06b6d4', positive: '#10b981', neutral: '#6b7280', other: '#6b7280',
  }
  return map[cat] || '#6b7280'
}

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [liveNews, setLiveNews] = useState([])
  const [liveLoading, setLiveLoading] = useState(true)

  const category = searchParams.get('category') || ''
  const companySlug = searchParams.get('company') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const query = searchParams.get('q') || ''

  // Fetch company list for filter dropdown
  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, slug, website')
      .order('name')
      .then(({ data }) => setCompanies(data || []))
  }, [])

  // Fetch articles from company_news table
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('company_news')
      .select('*, companies!inner(name, slug, website, industry)', { count: 'exact' })

    if (category) q = q.eq('category', category)
    if (companySlug) q = q.eq('companies.slug', companySlug)
    if (query) q = q.ilike('title', `%${query}%`)

    if (sort === 'newest') q = q.order('published_at', { ascending: false, nullsFirst: false })
    else if (sort === 'relevance') q = q.order('relevance_score', { ascending: false, nullsFirst: false })
    else if (sort === 'sentiment_low') q = q.order('sentiment', { ascending: true, nullsFirst: false })
    else if (sort === 'sentiment_high') q = q.order('sentiment', { ascending: false, nullsFirst: false })

    const from = (page - 1) * PER_PAGE
    q = q.range(from, from + PER_PAGE - 1)

    const { data, count } = await q
    setArticles(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [category, companySlug, sort, page, query])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  // Fetch live news from Yahoo Finance for top companies with tickers
  useEffect(() => {
    async function fetchLive() {
      setLiveLoading(true)
      const { data: tickerCompanies } = await supabase
        .from('companies')
        .select('name, slug, website, stock_ticker')
        .not('stock_ticker', 'is', null)
        .order('review_count', { ascending: false })
        .limit(8)

      if (!tickerCompanies?.length) { setLiveLoading(false); return }

      const allNews = []
      for (const co of tickerCompanies.slice(0, 5)) {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(co.stock_ticker)}&newsCount=3&quotesCount=0`,
            { signal: AbortSignal.timeout(4000) }
          )
          if (res.ok) {
            const json = await res.json()
            const items = (json?.news || []).slice(0, 3).map(n => ({
              ...n, company: co
            }))
            allNews.push(...items)
          }
        } catch { /* skip */ }
      }

      // Sort by publish time, newest first
      allNews.sort((a, b) => (b.providerPublishTime || 0) - (a.providerPublishTime || 0))
      setLiveNews(allNews.slice(0, 15))
      setLiveLoading(false)
    }
    fetchLive()
  }, [])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  // Stats
  const negCount = articles.filter(a => a.sentiment != null && a.sentiment <= 0.3).length
  const posCount = articles.filter(a => a.sentiment != null && a.sentiment > 0.6).length

  return (
    <div className="news-page">
      <NavBar />

      <header className="news-hero">
        <div className="news-hero-inner">
          <span className="news-eyebrow">Corporate Intelligence</span>
          <h1 className="news-headline">News & Investigations</h1>
          <p className="news-sub">
            Real-time coverage of corporate scandals, regulatory actions, lawsuits, and accountability news
            across {companies.length || '130+'} tracked companies.
          </p>
          <div className="news-stats-row">
            <div className="news-stat">
              <span className="news-stat-n">{totalCount || '—'}</span>
              <span>Articles Indexed</span>
            </div>
            <div className="news-stat-div" />
            <div className="news-stat">
              <span className="news-stat-n">{companies.length || '—'}</span>
              <span>Companies Tracked</span>
            </div>
            <div className="news-stat-div" />
            <div className="news-stat">
              <span className="news-stat-n">{CATEGORIES.length - 1}</span>
              <span>Categories</span>
            </div>
          </div>
        </div>
      </header>

      <div className="news-body">
        <div className="news-body-inner">

          {/* Live Ticker */}
          {liveNews.length > 0 && (
            <section className="news-live-section">
              <div className="news-live-header">
                <span className="news-live-dot" />
                <span className="news-live-label">Live Feed</span>
                <span className="news-live-sub">Real-time from financial markets</span>
              </div>
              <div className="news-live-grid">
                {liveNews.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" className="news-live-card">
                    <div className="news-live-card-top">
                      <CompanyLogo name={item.company.name} website={item.company.website} size={20} />
                      <Link
                        to={`/companies/${item.company.slug}`}
                        className="news-live-company"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.company.name}
                      </Link>
                      <span className="news-live-time">
                        {item.providerPublishTime ? timeAgo(new Date(item.providerPublishTime * 1000).toISOString()) : ''}
                      </span>
                    </div>
                    <div className="news-live-title">{item.title}</div>
                    <div className="news-live-source">{item.publisher}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {liveLoading && liveNews.length === 0 && (
            <section className="news-live-section">
              <div className="news-live-header">
                <span className="news-live-dot" />
                <span className="news-live-label">Live Feed</span>
                <span className="news-live-sub">Fetching latest market news...</span>
              </div>
              <div className="news-live-grid">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className="news-live-card skeleton">
                    <div className="skeleton-line" style={{ width: '40%', height: 10 }} />
                    <div className="skeleton-line" style={{ width: '90%', height: 14, marginTop: 8 }} />
                    <div className="skeleton-line" style={{ width: '30%', height: 10, marginTop: 6 }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Filters */}
          <div className="news-filters">
            <div className="news-filters-row">
              <div className="news-filter-group">
                <label className="news-filter-label">Category</label>
                <div className="news-pills">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      className={`news-pill ${category === c.value ? 'active' : ''}`}
                      onClick={() => updateParam('category', c.value)}
                    >
                      {c.value && <span className="news-pill-dot" style={{ background: categoryColor(c.value) }} />}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="news-filter-controls">
                <div className="news-filter-group">
                  <label className="news-filter-label">Company</label>
                  <select
                    className="news-select"
                    value={companySlug}
                    onChange={e => updateParam('company', e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="news-filter-group">
                  <label className="news-filter-label">Sort</label>
                  <select
                    className="news-select"
                    value={sort}
                    onChange={e => updateParam('sort', e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="news-filter-group">
                  <label className="news-filter-label">Search</label>
                  <input
                    className="news-search-input"
                    placeholder="Search headlines..."
                    value={query}
                    onChange={e => updateParam('q', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {(category || companySlug || query) && (
              <div className="news-active-filters">
                <span className="news-filter-count">{totalCount} results</span>
                {negCount > 0 && <span className="news-filter-badge neg">{negCount} negative</span>}
                {posCount > 0 && <span className="news-filter-badge pos">{posCount} positive</span>}
                <button className="news-clear-btn" onClick={() => setSearchParams({})}>
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="news-grid">
              {[1,2,3,4,5,6,7,8].map(n => (
                <div key={n} className="news-card skeleton">
                  <div className="skeleton-line" style={{ width: '30%', height: 10 }} />
                  <div className="skeleton-line" style={{ width: '90%', height: 16, marginTop: 12 }} />
                  <div className="skeleton-line" style={{ width: '75%', height: 16, marginTop: 4 }} />
                  <div className="skeleton-line" style={{ width: '100%', height: 12, marginTop: 12 }} />
                  <div className="skeleton-line" style={{ width: '60%', height: 12, marginTop: 4 }} />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="news-empty">
              <div className="news-empty-icon">📰</div>
              <h3>No articles found</h3>
              <p>Try adjusting your filters or check back later for new coverage.</p>
              {(category || companySlug || query) && (
                <button className="btn btn-outline" onClick={() => setSearchParams({})}>
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="news-grid">
                {articles.map(article => {
                  const sent = sentimentTag(article.sentiment)
                  return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="news-card"
                    >
                      <div className="news-card-top">
                        <div className="news-card-meta">
                          {article.category && (
                            <span
                              className="news-card-cat"
                              style={{ '--cat-color': categoryColor(article.category) }}
                            >
                              {article.category}
                            </span>
                          )}
                          {sent && (
                            <span className={`news-card-sentiment ${sent.cls}`}>
                              {sent.label}
                            </span>
                          )}
                        </div>
                        {article.published_at && (
                          <span className="news-card-time">{timeAgo(article.published_at)}</span>
                        )}
                      </div>

                      <h3 className="news-card-title">{article.title}</h3>

                      {article.ai_summary && (
                        <p className="news-card-summary">{article.ai_summary}</p>
                      )}
                      {!article.ai_summary && article.raw_snippet && (
                        <p className="news-card-summary">{article.raw_snippet}</p>
                      )}

                      <div className="news-card-footer">
                        <div className="news-card-company">
                          <CompanyLogo
                            name={article.companies?.name}
                            website={article.companies?.website}
                            size={18}
                          />
                          <Link
                            to={`/companies/${article.companies?.slug}`}
                            className="news-card-company-name"
                            onClick={e => e.stopPropagation()}
                          >
                            {article.companies?.name}
                          </Link>
                        </div>
                        {article.source && (
                          <span className="news-card-source">{article.source}</span>
                        )}
                      </div>

                      {article.relevance_score != null && (
                        <div className="news-card-relevance">
                          <div
                            className="news-card-relevance-bar"
                            style={{ width: `${article.relevance_score * 100}%` }}
                          />
                        </div>
                      )}
                    </a>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="news-pagination">
                  <button
                    className="news-page-btn"
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                  >
                    ← Previous
                  </button>
                  <span className="news-page-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="news-page-btn"
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">CorpWatch</span>
          <p className="footer-copy">© {new Date().getFullYear()} CorpWatch. Holding corporations accountable.</p>
        </div>
      </footer>
    </div>
  )
}
