import { useEffect, useState } from 'react'
import { fetchAllGovData } from '../lib/govApis'
import './GovDataWidget.css'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'sec', label: 'SEC Filings' },
  { key: 'cfpb', label: 'Complaints' },
  { key: 'recalls', label: 'Recalls' },
  { key: 'spending', label: 'Gov Contracts' },
]

export default function GovDataWidget({ companyName }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!companyName) return
    setLoading(true)
    fetchAllGovData(companyName)
      .then(setData)
      .finally(() => setLoading(false))
  }, [companyName])

  if (loading) {
    return (
      <div className="gov-widget">
        <div className="gov-widget-header">
          <GovIcon />
          <span className="gov-widget-title">Federal Records</span>
        </div>
        <div className="gov-widget-loading">
          <div className="gov-skeleton" style={{ width: '70%' }} />
          <div className="gov-skeleton" style={{ width: '50%' }} />
          <div className="gov-skeleton" style={{ width: '85%' }} />
          <div className="gov-skeleton" style={{ width: '40%' }} />
        </div>
      </div>
    )
  }

  if (!data) return null

  const secCount = data.sec?.total || 0
  const cfpbCount = data.cfpbStats?.total || 0
  const fdaCount = (data.fda || []).length
  const cpscCount = (data.cpsc || []).length
  const recallCount = fdaCount + cpscCount
  const spendingCount = data.usaspendingTotal?.total || 0
  const hasData = secCount + cfpbCount + recallCount + spendingCount > 0

  if (!hasData && !expanded) {
    return (
      <div className="gov-widget gov-widget-empty">
        <div className="gov-widget-header">
          <GovIcon />
          <span className="gov-widget-title">Federal Records</span>
        </div>
        <p className="gov-empty-text">No federal enforcement records found for {companyName}.</p>
      </div>
    )
  }

  return (
    <div className={`gov-widget ${expanded ? 'gov-widget-expanded' : ''}`}>
      <div className="gov-widget-header">
        <GovIcon />
        <span className="gov-widget-title">Federal Records</span>
        <span className="gov-widget-live">LIVE</span>
      </div>

      {/* Tab bar */}
      <div className="gov-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`gov-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => { setTab(t.key); setExpanded(true) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="gov-overview">
          <GovStatRow
            label="SEC Filings"
            count={secCount}
            color="#3b82f6"
            onClick={() => { setTab('sec'); setExpanded(true) }}
          />
          <GovStatRow
            label="Consumer Complaints"
            count={cfpbCount}
            color="#ef4444"
            onClick={() => { setTab('cfpb'); setExpanded(true) }}
          />
          <GovStatRow
            label="Product Recalls"
            count={recallCount}
            color="#f97316"
            onClick={() => { setTab('recalls'); setExpanded(true) }}
          />
          <GovStatRow
            label="Gov Contracts"
            count={spendingCount}
            color="#10b981"
            onClick={() => { setTab('spending'); setExpanded(true) }}
          />
        </div>
      )}

      {/* SEC */}
      {tab === 'sec' && (
        <div className="gov-detail">
          {secCount > 0 ? (
            <>
              <div className="gov-detail-count">{secCount.toLocaleString()} filings found</div>
              {(data.sec?.filings || []).map((f, i) => (
                <div key={i} className="gov-item">
                  <div className="gov-item-top">
                    <span className="gov-badge sec">{f.type || 'Filing'}</span>
                    {f.date && <span className="gov-item-date">{f.date}</span>}
                  </div>
                  <div className="gov-item-title">{f.entity}</div>
                  {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="gov-item-link">View on SEC.gov</a>}
                </div>
              ))}
              <a
                href={`https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`}
                target="_blank"
                rel="noreferrer"
                className="gov-view-all"
              >
                View all SEC filings →
              </a>
            </>
          ) : (
            <div className="gov-no-data">No SEC filings found.</div>
          )}
        </div>
      )}

      {/* CFPB */}
      {tab === 'cfpb' && (
        <div className="gov-detail">
          {cfpbCount > 0 ? (
            <>
              <div className="gov-detail-count">{cfpbCount.toLocaleString()} complaints</div>
              {data.cfpbStats?.products?.length > 0 && (
                <div className="gov-breakdown">
                  <span className="gov-breakdown-label">By Product</span>
                  {data.cfpbStats.products.slice(0, 5).map((p, i) => (
                    <div key={i} className="gov-breakdown-row">
                      <span className="gov-breakdown-name">{p.name}</span>
                      <span className="gov-breakdown-count">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              {(data.cfpb?.complaints || []).map((c, i) => (
                <div key={i} className="gov-item">
                  <div className="gov-item-top">
                    <span className="gov-badge cfpb">{c.product}</span>
                    {c.date && <span className="gov-item-date">{c.date}</span>}
                  </div>
                  <div className="gov-item-title">{c.issue}</div>
                  {c.narrative && <p className="gov-item-desc">{c.narrative.slice(0, 200)}...</p>}
                  <div className="gov-item-meta">
                    {c.companyResponse && <span>Response: {c.companyResponse}</span>}
                    {c.timely && <span className="gov-timely">Timely</span>}
                  </div>
                </div>
              ))}
              <a
                href={`https://www.consumerfinance.gov/data-research/consumer-complaints/search/?company=${encodeURIComponent(companyName)}`}
                target="_blank"
                rel="noreferrer"
                className="gov-view-all"
              >
                View all on CFPB →
              </a>
            </>
          ) : (
            <div className="gov-no-data">No consumer complaints found.</div>
          )}
        </div>
      )}

      {/* Recalls */}
      {tab === 'recalls' && (
        <div className="gov-detail">
          {recallCount > 0 ? (
            <>
              <div className="gov-detail-count">{recallCount} recalls found</div>
              {(data.fda || []).map((r, i) => (
                <div key={`fda-${i}`} className="gov-item">
                  <div className="gov-item-top">
                    <span className="gov-badge fda">FDA {r.type}</span>
                    <span className={`gov-class gov-class-${r.classification?.toLowerCase()}`}>
                      {r.classification}
                    </span>
                    {r.recallDate && <span className="gov-item-date">{r.recallDate}</span>}
                  </div>
                  <div className="gov-item-title">{r.reason}</div>
                  {r.productDescription && <p className="gov-item-desc">{r.productDescription.slice(0, 150)}...</p>}
                </div>
              ))}
              {(data.cpsc || []).map((r, i) => (
                <div key={`cpsc-${i}`} className="gov-item">
                  <div className="gov-item-top">
                    <span className="gov-badge cpsc">CPSC</span>
                    {r.recallDate && <span className="gov-item-date">{r.recallDate}</span>}
                  </div>
                  <div className="gov-item-title">{r.title}</div>
                  {r.description && <p className="gov-item-desc">{r.description.slice(0, 150)}...</p>}
                  {r.hazards?.length > 0 && (
                    <div className="gov-hazards">
                      {r.hazards.map((h, j) => <span key={j} className="gov-hazard-tag">{h}</span>)}
                    </div>
                  )}
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="gov-item-link">View recall details</a>}
                </div>
              ))}
            </>
          ) : (
            <div className="gov-no-data">No product recalls found.</div>
          )}
        </div>
      )}

      {/* Gov Spending */}
      {tab === 'spending' && (
        <div className="gov-detail">
          {spendingCount > 0 ? (
            <>
              <div className="gov-detail-count">{spendingCount.toLocaleString()} awards</div>
              <div className="gov-spending-summary">
                {data.usaspendingTotal?.contracts > 0 && (
                  <div className="gov-spending-stat">
                    <span className="gov-spending-n">{data.usaspendingTotal.contracts.toLocaleString()}</span>
                    <span>Contracts</span>
                  </div>
                )}
                {data.usaspendingTotal?.grants > 0 && (
                  <div className="gov-spending-stat">
                    <span className="gov-spending-n">{data.usaspendingTotal.grants.toLocaleString()}</span>
                    <span>Grants</span>
                  </div>
                )}
                {data.usaspendingTotal?.directPayments > 0 && (
                  <div className="gov-spending-stat">
                    <span className="gov-spending-n">{data.usaspendingTotal.directPayments.toLocaleString()}</span>
                    <span>Direct Payments</span>
                  </div>
                )}
              </div>
              {(data.usaspending?.awards || []).map((a, i) => (
                <div key={i} className="gov-item">
                  <div className="gov-item-top">
                    <span className="gov-badge spending">{a.type || 'Award'}</span>
                    {a.startDate && <span className="gov-item-date">{a.startDate}</span>}
                  </div>
                  <div className="gov-item-title">
                    {a.description || a.recipient}
                  </div>
                  <div className="gov-item-meta">
                    {a.amount && <span className="gov-amount">{formatAmount(a.amount)}</span>}
                    {a.agency && <span className="gov-agency">{a.agency}</span>}
                  </div>
                </div>
              ))}
              <a
                href={`https://www.usaspending.gov/search/?hash=&filters=%7B%22keyword%22%3A%22${encodeURIComponent(companyName)}%22%7D`}
                target="_blank"
                rel="noreferrer"
                className="gov-view-all"
              >
                View all on USAspending.gov →
              </a>
            </>
          ) : (
            <div className="gov-no-data">No federal awards found.</div>
          )}
        </div>
      )}

      {!expanded && hasData && (
        <button className="gov-expand-btn" onClick={() => setExpanded(true)}>
          Show details
        </button>
      )}
    </div>
  )
}

function GovStatRow({ label, count, color, onClick }) {
  return (
    <button className="gov-stat-row" onClick={onClick}>
      <span className="gov-stat-dot" style={{ background: color }} />
      <span className="gov-stat-label">{label}</span>
      <span className="gov-stat-count" style={{ color: count > 0 ? color : '#333' }}>
        {count > 0 ? count.toLocaleString() : '—'}
      </span>
    </button>
  )
}

function GovIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
    </svg>
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
