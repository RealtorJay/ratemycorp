import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { supabase } from '../lib/supabase'
import './ConnectionsPage.css'

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

function formatCents(cents) {
  if (!cents) return null
  const dollars = cents / 100
  if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(1)}B`
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`
  return `$${dollars.toLocaleString()}`
}

export default function ConnectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityType, setEntityType] = useState(null) // 'company' | 'politician'
  const [filterIndustry, setFilterIndustry] = useState(searchParams.get('industry') || '')
  const [filterParty, setFilterParty] = useState('')
  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const companySlug = searchParams.get('company')
  const politicianSlug = searchParams.get('politician')

  useEffect(() => { loadConnections() }, [])

  const loadConnections = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('politician_company_connections')
      .select(`
        *,
        politicians(id, slug, full_name, party, chamber, state, title, accountability_score, connection_count),
        companies(id, slug, name, industry, website, ceo_name, headquarters, lobbying_spend, avg_overall, review_count)
      `)
      .order('amount_cents', { ascending: false })
      .limit(500)

    if (!error && data) {
      setConnections(data)

      // Auto-select entity from URL params
      if (companySlug) {
        const match = data.find(c => c.companies?.slug === companySlug)
        if (match?.companies) {
          setSelectedEntity(match.companies)
          setEntityType('company')
        }
      } else if (politicianSlug) {
        const match = data.find(c => c.politicians?.slug === politicianSlug)
        if (match?.politicians) {
          setSelectedEntity(match.politicians)
          setEntityType('politician')
        }
      }
    }
    setLoading(false)
  }

  // Build network data
  const networkData = useMemo(() => {
    const companies = new Map()
    const politicians = new Map()
    const edges = []

    connections.forEach(conn => {
      const co = conn.companies
      const pol = conn.politicians
      if (!co || !pol) return

      if (!companies.has(co.id)) companies.set(co.id, { ...co, connections: [] })
      if (!politicians.has(pol.id)) politicians.set(pol.id, { ...pol, connections: [] })

      const edge = {
        id: conn.id,
        companyId: co.id,
        politicianId: pol.id,
        type: conn.connection_type,
        amount: conn.amount_cents,
        amountDisplay: conn.amount_display,
        cycle: conn.cycle,
        description: conn.description,
        sourceUrl: conn.source_url,
      }
      edges.push(edge)
      companies.get(co.id).connections.push(edge)
      politicians.get(pol.id).connections.push(edge)
    })

    return {
      companies: [...companies.values()],
      politicians: [...politicians.values()],
      edges,
    }
  }, [connections])

  // Filter logic
  const filteredEdges = useMemo(() => {
    return networkData.edges.filter(edge => {
      const co = networkData.companies.find(c => c.id === edge.companyId)
      const pol = networkData.politicians.find(p => p.id === edge.politicianId)
      if (!co || !pol) return false

      if (filterIndustry && co.industry !== filterIndustry) return false
      if (filterParty && pol.party !== filterParty) return false
      if (filterType && edge.type !== filterType) return false

      if (selectedEntity) {
        if (entityType === 'company' && co.id !== selectedEntity.id) return false
        if (entityType === 'politician' && pol.id !== selectedEntity.id) return false
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return co.name.toLowerCase().includes(q) ||
               pol.full_name.toLowerCase().includes(q) ||
               (co.ceo_name || '').toLowerCase().includes(q) ||
               (co.industry || '').toLowerCase().includes(q)
      }

      return true
    })
  }, [networkData, filterIndustry, filterParty, filterType, selectedEntity, entityType, searchQuery])

  // Get entities from filtered edges
  const visibleCompanies = useMemo(() => {
    const ids = new Set(filteredEdges.map(e => e.companyId))
    return networkData.companies.filter(c => ids.has(c.id))
  }, [filteredEdges, networkData])

  const visiblePoliticians = useMemo(() => {
    const ids = new Set(filteredEdges.map(e => e.politicianId))
    return networkData.politicians.filter(p => ids.has(p.id))
  }, [filteredEdges, networkData])

  // Stats
  const totalMoney = filteredEdges.reduce((sum, e) => sum + (e.amount || 0), 0)
  const industries = [...new Set(networkData.companies.map(c => c.industry).filter(Boolean))].sort()
  const connectionTypes = [...new Set(networkData.edges.map(e => e.type))].sort()

  const selectCompany = (co) => {
    setSelectedEntity(co)
    setEntityType('company')
    setSearchParams({ company: co.slug })
  }

  const selectPolitician = (pol) => {
    setSelectedEntity(pol)
    setEntityType('politician')
    setSearchParams({ politician: pol.slug })
  }

  const clearSelection = () => {
    setSelectedEntity(null)
    setEntityType(null)
    setSearchParams({})
  }

  if (loading) return (
    <div className="connections-page">
      <NavBar />
      <div className="connections-loading">Loading connections web...</div>
    </div>
  )

  return (
    <div className="connections-page">
      <NavBar />

      <div className="connections-hero">
        <div className="connections-hero-inner">
          <h1 className="connections-headline">The Connections Web</h1>
          <p className="connections-sub">
            Follow the money. See how corporations, politicians, and CEOs are interconnected —
            and understand how these relationships shape the policies that affect your daily life.
          </p>
          <div className="connections-hero-stats">
            <div className="conn-stat">
              <span className="conn-stat-n">{visibleCompanies.length}</span>
              <span>Companies</span>
            </div>
            <div className="conn-stat-div" />
            <div className="conn-stat">
              <span className="conn-stat-n">{visiblePoliticians.length}</span>
              <span>Politicians</span>
            </div>
            <div className="conn-stat-div" />
            <div className="conn-stat">
              <span className="conn-stat-n">{filteredEdges.length}</span>
              <span>Connections</span>
            </div>
            <div className="conn-stat-div" />
            <div className="conn-stat">
              <span className="conn-stat-n">{formatCents(totalMoney) || '$0'}</span>
              <span>Total Money Tracked</span>
            </div>
          </div>
        </div>
      </div>

      <div className="connections-body">
        <div className="connections-body-inner">

          {/* Filters */}
          <div className="connections-filters">
            <input
              type="text"
              className="connections-search"
              placeholder="Search companies, politicians, CEOs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="connections-select"
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select
              className="connections-select"
              value={filterParty}
              onChange={e => setFilterParty(e.target.value)}
            >
              <option value="">All Parties</option>
              <option value="Democrat">Democrat</option>
              <option value="Republican">Republican</option>
              <option value="Independent">Independent</option>
            </select>
            <select
              className="connections-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Connection Types</option>
              {connectionTypes.map(t => (
                <option key={t} value={t}>{CONNECTION_LABELS[t] || t}</option>
              ))}
            </select>
            {selectedEntity && (
              <button className="connections-clear-btn" onClick={clearSelection}>
                Clear: {entityType === 'company' ? selectedEntity.name : selectedEntity.full_name} ×
              </button>
            )}
          </div>

          {/* Selected entity detail panel */}
          {selectedEntity && (
            <div className="entity-detail-panel">
              {entityType === 'company' ? (
                <CompanyPanel company={selectedEntity} edges={filteredEdges} politicians={visiblePoliticians} />
              ) : (
                <PoliticianPanel politician={selectedEntity} edges={filteredEdges} companies={visibleCompanies} />
              )}
            </div>
          )}

          {/* Network grid: companies left, connections center, politicians right */}
          <div className="network-grid">
            {/* Companies column */}
            <div className="network-column">
              <h2 className="network-col-title">
                Corporations
                <span className="network-col-count">{visibleCompanies.length}</span>
              </h2>
              <div className="network-entities">
                {visibleCompanies
                  .sort((a, b) => b.connections.length - a.connections.length)
                  .map(co => (
                    <button
                      key={co.id}
                      className={`network-entity-card ${selectedEntity?.id === co.id && entityType === 'company' ? 'selected' : ''}`}
                      onClick={() => selectCompany(co)}
                    >
                      <div className="entity-card-top">
                        <div className="entity-logo">{co.name?.[0]?.toUpperCase()}</div>
                        <div className="entity-info">
                          <span className="entity-name">{co.name}</span>
                          {co.industry && <span className="entity-meta">{co.industry}</span>}
                        </div>
                        <span className="entity-edge-count">
                          {co.connections.filter(e => filteredEdges.some(fe => fe.id === e.id)).length}
                        </span>
                      </div>
                      {co.ceo_name && (
                        <div className="entity-ceo">
                          CEO: {co.ceo_name}
                        </div>
                      )}
                      {co.lobbying_spend && (
                        <div className="entity-lobbying">
                          Lobbying: {co.lobbying_spend}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            {/* Connections column */}
            <div className="network-column network-column-center">
              <h2 className="network-col-title">
                Connections
                <span className="network-col-count">{filteredEdges.length}</span>
              </h2>
              <div className="network-edges">
                {filteredEdges.slice(0, 50).map(edge => {
                  const co = networkData.companies.find(c => c.id === edge.companyId)
                  const pol = networkData.politicians.find(p => p.id === edge.politicianId)
                  if (!co || !pol) return null
                  const partyColor = PARTY_COLORS[pol.party] || '#555'
                  return (
                    <div key={edge.id} className="network-edge">
                      <button
                        className="edge-entity edge-company"
                        onClick={() => selectCompany(co)}
                      >
                        {co.name}
                      </button>
                      <div className="edge-line">
                        <div className="edge-type">{CONNECTION_LABELS[edge.type]?.split(' ')[0]}</div>
                        {edge.amountDisplay && edge.amountDisplay !== 'N/A' && (
                          <div className="edge-amount">{edge.amountDisplay}</div>
                        )}
                      </div>
                      <button
                        className="edge-entity edge-politician"
                        style={{ borderColor: `${partyColor}40` }}
                        onClick={() => selectPolitician(pol)}
                      >
                        <span className="edge-pol-dot" style={{ background: partyColor }} />
                        {pol.full_name}
                      </button>
                    </div>
                  )
                })}
                {filteredEdges.length > 50 && (
                  <div className="network-more">
                    Showing 50 of {filteredEdges.length} connections. Use filters to narrow down.
                  </div>
                )}
                {filteredEdges.length === 0 && (
                  <div className="network-empty">
                    No connections match your filters.
                  </div>
                )}
              </div>
            </div>

            {/* Politicians column */}
            <div className="network-column">
              <h2 className="network-col-title">
                Politicians
                <span className="network-col-count">{visiblePoliticians.length}</span>
              </h2>
              <div className="network-entities">
                {visiblePoliticians
                  .sort((a, b) => b.connections.length - a.connections.length)
                  .map(pol => {
                    const partyColor = PARTY_COLORS[pol.party] || '#555'
                    const edgeCount = pol.connections.filter(e => filteredEdges.some(fe => fe.id === e.id)).length
                    return (
                      <button
                        key={pol.id}
                        className={`network-entity-card ${selectedEntity?.id === pol.id && entityType === 'politician' ? 'selected' : ''}`}
                        onClick={() => selectPolitician(pol)}
                      >
                        <div className="entity-card-top">
                          <div className="entity-pol-avatar" style={{ background: partyColor }}>
                            {pol.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="entity-info">
                            <span className="entity-name">{pol.full_name}</span>
                            <span className="entity-meta">
                              <span style={{ color: partyColor }}>{pol.party?.[0]}</span>
                              {pol.state && ` · ${pol.state}`}
                              {pol.chamber && ` · ${pol.chamber}`}
                            </span>
                          </div>
                          <span className="entity-edge-count">{edgeCount}</span>
                        </div>
                        {pol.accountability_score > 0 && (
                          <div className="entity-score">
                            Score: <span style={{
                              color: pol.accountability_score >= 70 ? '#6ee7b7' :
                                     pol.accountability_score >= 45 ? '#fbbf24' : '#f87171'
                            }}>{Math.round(pol.accountability_score)}/100</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Your Dollar Impact section */}
          <div className="dollar-impact-section">
            <h2 className="dollar-impact-title">Understanding Your Dollar's Impact</h2>
            <p className="dollar-impact-sub">
              When you buy from a company, your money doesn't just pay for a product. It funds lobbying,
              political donations, and influence campaigns that shape the laws affecting your life.
            </p>
            <div className="dollar-impact-grid">
              <div className="dollar-impact-card">
                <div className="dollar-icon">$</div>
                <h3>Your Purchase</h3>
                <p>Every dollar you spend is a vote for how a company does business — and who they support politically.</p>
              </div>
              <div className="dollar-impact-card">
                <div className="dollar-icon">→</div>
                <h3>Corporate Lobbying</h3>
                <p>Companies use revenue to fund lobbying efforts that shape regulations in their favor, often at the expense of consumers and the environment.</p>
              </div>
              <div className="dollar-impact-card">
                <div className="dollar-icon">→</div>
                <h3>Political Donations</h3>
                <p>Campaign donations and PAC contributions create financial relationships between corporations and the politicians who write our laws.</p>
              </div>
              <div className="dollar-impact-card">
                <div className="dollar-icon">→</div>
                <h3>Policy Outcomes</h3>
                <p>Politicians who receive corporate money may vote in ways that benefit their donors — affecting healthcare, environment, labor, and consumer rights.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function CompanyPanel({ company, edges, politicians }) {
  const totalReceived = edges.reduce((sum, e) => sum + (e.amount || 0), 0)
  const connectionTypes = [...new Set(edges.map(e => e.type))]
  const connectedPols = politicians.filter(p =>
    edges.some(e => e.politicianId === p.id)
  )

  return (
    <div className="entity-panel">
      <div className="panel-header">
        <div className="panel-logo">{company.name?.[0]?.toUpperCase()}</div>
        <div>
          <h2 className="panel-name">
            <Link to={`/companies/${company.slug}`}>{company.name}</Link>
          </h2>
          <div className="panel-meta">
            {company.industry && <span>{company.industry}</span>}
            {company.headquarters && <span> · {company.headquarters}</span>}
          </div>
        </div>
      </div>

      {company.ceo_name && (
        <div className="panel-ceo">
          <span className="panel-label">CEO</span>
          <span className="panel-value">{company.ceo_name}</span>
        </div>
      )}
      {company.lobbying_spend && (
        <div className="panel-row">
          <span className="panel-label">Lobbying Spend</span>
          <span className="panel-value panel-highlight">{company.lobbying_spend}</span>
        </div>
      )}
      <div className="panel-row">
        <span className="panel-label">Political Ties</span>
        <span className="panel-value">{edges.length} connections to {connectedPols.length} politicians</span>
      </div>
      {totalReceived > 0 && (
        <div className="panel-row">
          <span className="panel-label">Total Tracked</span>
          <span className="panel-value panel-highlight">{formatCents(totalReceived)}</span>
        </div>
      )}

      <div className="panel-section">
        <h3 className="panel-section-title">Connection Types</h3>
        <div className="panel-tags">
          {connectionTypes.map(t => (
            <span key={t} className="panel-tag">{CONNECTION_LABELS[t] || t}</span>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-section-title">Connected Politicians</h3>
        <div className="panel-entity-list">
          {connectedPols.slice(0, 8).map(pol => {
            const polEdges = edges.filter(e => e.politicianId === pol.id)
            const polTotal = polEdges.reduce((sum, e) => sum + (e.amount || 0), 0)
            const partyColor = PARTY_COLORS[pol.party] || '#555'
            return (
              <Link key={pol.id} to={`/politicians/${pol.slug}`} className="panel-entity-item">
                <div className="panel-entity-dot" style={{ background: partyColor }} />
                <div className="panel-entity-info">
                  <span className="panel-entity-name">{pol.full_name}</span>
                  <span className="panel-entity-meta">{pol.party} · {pol.state}</span>
                </div>
                {polTotal > 0 && <span className="panel-entity-amount">{formatCents(polTotal)}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="panel-impact">
        <h3 className="panel-section-title">What This Means For You</h3>
        <p className="panel-impact-text">
          {company.name} has documented ties to {connectedPols.length} politician{connectedPols.length !== 1 ? 's' : ''}.
          {totalReceived > 0 && ` With ${formatCents(totalReceived)} in tracked financial connections,`}
          {' '}these relationships may influence how {company.industry || 'industry'} regulation
          is written and enforced — affecting product safety, pricing, environmental standards, and worker treatment.
        </p>
      </div>
    </div>
  )
}

function PoliticianPanel({ politician, edges, companies }) {
  const totalReceived = edges.reduce((sum, e) => sum + (e.amount || 0), 0)
  const connectedCos = companies.filter(c =>
    edges.some(e => e.companyId === c.id)
  )
  const industries = [...new Set(connectedCos.map(c => c.industry).filter(Boolean))]
  const partyColor = PARTY_COLORS[politician.party] || '#555'

  return (
    <div className="entity-panel">
      <div className="panel-header">
        <div className="panel-pol-avatar" style={{ background: partyColor }}>
          {politician.full_name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h2 className="panel-name">
            <Link to={`/politicians/${politician.slug}`}>{politician.full_name}</Link>
          </h2>
          <div className="panel-meta">
            <span style={{ color: partyColor }}>{politician.party}</span>
            {politician.state && <span> · {politician.state}</span>}
            {politician.chamber && <span> · {politician.chamber}</span>}
          </div>
        </div>
      </div>

      <div className="panel-row">
        <span className="panel-label">Corporate Ties</span>
        <span className="panel-value">{edges.length} connections to {connectedCos.length} companies</span>
      </div>
      {totalReceived > 0 && (
        <div className="panel-row">
          <span className="panel-label">Total Tracked</span>
          <span className="panel-value panel-highlight">{formatCents(totalReceived)}</span>
        </div>
      )}
      {politician.accountability_score > 0 && (
        <div className="panel-row">
          <span className="panel-label">Accountability</span>
          <span className="panel-value" style={{
            color: politician.accountability_score >= 70 ? '#6ee7b7' :
                   politician.accountability_score >= 45 ? '#fbbf24' : '#f87171'
          }}>{Math.round(politician.accountability_score)}/100</span>
        </div>
      )}

      <div className="panel-section">
        <h3 className="panel-section-title">Industries Influenced</h3>
        <p className="panel-industries-note">
          This politician has financial ties to companies in these industries, which may create
          conflicts of interest when voting on related regulation.
        </p>
        <div className="panel-tags">
          {industries.map(i => (
            <span key={i} className="panel-tag">{i}</span>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="panel-section-title">Connected Companies</h3>
        <div className="panel-entity-list">
          {connectedCos.slice(0, 8).map(co => {
            const coEdges = edges.filter(e => e.companyId === co.id)
            const coTotal = coEdges.reduce((sum, e) => sum + (e.amount || 0), 0)
            return (
              <Link key={co.id} to={`/companies/${co.slug}`} className="panel-entity-item">
                <div className="panel-entity-logo">{co.name?.[0]?.toUpperCase()}</div>
                <div className="panel-entity-info">
                  <span className="panel-entity-name">{co.name}</span>
                  <span className="panel-entity-meta">{co.industry}</span>
                </div>
                {coTotal > 0 && <span className="panel-entity-amount">{formatCents(coTotal)}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="panel-impact">
        <h3 className="panel-section-title">What This Means For You</h3>
        <p className="panel-impact-text">
          {politician.full_name} has documented ties to {connectedCos.length} corporation{connectedCos.length !== 1 ? 's' : ''}
          {' '}across {industries.length} industr{industries.length !== 1 ? 'ies' : 'y'}.
          {totalReceived > 0 && ` With ${formatCents(totalReceived)} in tracked financial connections,`}
          {' '}their votes on {industries.slice(0, 3).join(', ')} policy should be examined
          through the lens of these financial relationships. Voters deserve to know whose interests
          their representatives are serving.
        </p>
      </div>
    </div>
  )
}
