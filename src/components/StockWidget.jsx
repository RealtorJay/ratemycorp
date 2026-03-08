import { useEffect, useState } from 'react'
import './StockWidget.css'

/**
 * StockWidget fetches real-time quote data from Yahoo Finance (no API key required)
 * via a public CORS proxy, and displays price, change, and recent news.
 *
 * Falls back gracefully if data is unavailable.
 */
export default function StockWidget({ ticker, companyName, isPublic = true }) {
  const [quote, setQuote] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ticker) { setLoading(false); return }
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    try {
      // Use Yahoo Finance v8 API (public, no key required)
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d&includePrePost=false`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) throw new Error('fetch failed')
      const json = await res.json()
      const result = json?.chart?.result?.[0]
      if (!result) throw new Error('no result')

      const meta = result.meta
      setQuote({
        price: meta.regularMarketPrice,
        prev: meta.chartPreviousClose || meta.previousClose,
        currency: meta.currency || 'USD',
        exchange: meta.exchangeName,
        marketState: meta.marketState,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        marketCap: meta.marketCap,
      })
    } catch {
      setError(true)
    }

    // Fetch news via Yahoo Finance news API
    try {
      const res2 = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=5&quotesCount=0`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (res2.ok) {
        const json2 = await res2.json()
        const articles = (json2?.news || []).slice(0, 4)
        setNews(articles)
      }
    } catch {
      // News is optional — fail silently
    }

    setLoading(false)
  }

  if (!ticker && !isPublic) {
    return <PrivateCompanyCard companyName={companyName} />
  }

  if (!ticker) return null

  if (loading) {
    return (
      <div className="stock-widget">
        <div className="stock-header-label">Market Data</div>
        <div className="stock-loading">
          <div className="skeleton-line" style={{ width: '60%', height: 32, marginBottom: 8 }} />
          <div className="skeleton-line" style={{ width: '40%', height: 14 }} />
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="stock-widget">
        <div className="stock-header-label">Market Data · <span className="stock-ticker-badge">{ticker}</span></div>
        <p className="stock-unavailable">Live data unavailable — market may be closed or ticker unrecognized.</p>
        <a
          href={`https://finance.yahoo.com/quote/${ticker}`}
          target="_blank"
          rel="noreferrer"
          className="stock-ext-link"
        >
          View on Yahoo Finance →
        </a>
      </div>
    )
  }

  const change = quote.price - quote.prev
  const changePct = (change / quote.prev) * 100
  const isUp = change >= 0
  const isAfterHours = quote.marketState !== 'REGULAR'

  return (
    <div className="stock-widget">
      <div className="stock-header-label">
        Market Data · <span className="stock-ticker-badge">{ticker}</span>
        {isAfterHours && <span className="stock-after-hours">After Hours</span>}
      </div>

      <div className="stock-price-row">
        <span className="stock-price">
          {quote.currency === 'USD' ? '$' : ''}{quote.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`stock-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
        </span>
      </div>

      <div className="stock-meta-row">
        <span className="stock-exchange">{quote.exchange}</span>
        {quote.marketCap && (
          <span className="stock-cap">
            Mkt Cap: {formatMarketCap(quote.marketCap)}
          </span>
        )}
      </div>

      {(quote.fiftyTwoWeekHigh || quote.fiftyTwoWeekLow) && (
        <div className="stock-range">
          <span className="stock-range-label">52-wk</span>
          <span className="stock-range-low">${quote.fiftyTwoWeekLow?.toFixed(2)}</span>
          <div className="stock-range-bar">
            <div
              className="stock-range-fill"
              style={{
                left: `${((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100}%`
              }}
            />
          </div>
          <span className="stock-range-high">${quote.fiftyTwoWeekHigh?.toFixed(2)}</span>
        </div>
      )}

      <a
        href={`https://finance.yahoo.com/quote/${ticker}`}
        target="_blank"
        rel="noreferrer"
        className="stock-ext-link"
      >
        Full chart on Yahoo Finance →
      </a>

      {news.length > 0 && (
        <div className="stock-news">
          <div className="stock-news-label">Latest News</div>
          {news.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="stock-news-item"
            >
              <span className="stock-news-title">{article.title}</span>
              <span className="stock-news-source">{article.publisher} · {formatNewsDate(article.providerPublishTime)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function PrivateCompanyCard({ companyName }) {
  return (
    <div className="stock-widget stock-private">
      <div className="stock-header-label">Market Data</div>
      <div className="stock-private-badge">Privately Held</div>
      <p className="stock-private-note">
        {companyName} is not publicly traded. Valuation estimates are based on
        available financial disclosures, revenue multiples, and industry benchmarks.
      </p>
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(companyName + ' valuation company worth')}`}
        target="_blank"
        rel="noreferrer"
        className="stock-ext-link"
      >
        Search valuation estimates →
      </a>
    </div>
  )
}

function formatMarketCap(cap) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`
  return `$${cap.toLocaleString()}`
}

function formatNewsDate(unix) {
  if (!unix) return ''
  const d = new Date(unix * 1000)
  const diff = Date.now() - d.getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
