/**
 * Government API integrations — all free, no API keys required.
 * SEC EDGAR, CFPB, openFDA, CPSC Recalls, USAspending
 */

const CACHE = new Map()
const CACHE_TTL = 15 * 60 * 1000 // 15 min

function cached(key, fetchFn) {
  const entry = CACHE.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return Promise.resolve(entry.data)
  return fetchFn().then(data => {
    CACHE.set(key, { data, ts: Date.now() })
    return data
  })
}

// ── SEC EDGAR ──────────────────────────────────────────────────────────────────
// Docs: https://efts.sec.gov/LATEST/search-index?q=...
// Fair use: 10 req/sec, User-Agent required

const SEC_HEADERS = {
  'User-Agent': 'CorpWatch contact@corpwatch.app',
  Accept: 'application/json',
}

export async function secSearchFilings(companyName, { type = '', limit = 10 } = {}) {
  const key = `sec:${companyName}:${type}:${limit}`
  return cached(key, async () => {
    const params = new URLSearchParams({
      q: companyName,
      dateRange: 'custom',
      startdt: '2020-01-01',
      enddt: new Date().toISOString().slice(0, 10),
    })
    if (type) params.set('forms', type)

    const res = await fetch(
      `https://efts.sec.gov/LATEST/search-index?${params}`,
      { headers: SEC_HEADERS, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`SEC API ${res.status}`)
    const json = await res.json()
    return (json.hits?.hits || []).slice(0, limit).map(h => ({
      id: h._id,
      type: h._source?.file_type || h._source?.form_type,
      title: h._source?.display_names?.[0] || h._source?.entity_name,
      date: h._source?.file_date || h._source?.period_of_report,
      description: h._source?.display_names?.join(', '),
      url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(companyName)}&type=${type}&dateb=&owner=include&count=40`,
    }))
  })
}

export async function secFullTextSearch(companyName, { limit = 10 } = {}) {
  const key = `secfts:${companyName}:${limit}`
  return cached(key, async () => {
    const res = await fetch(
      `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22&dateRange=custom&startdt=2020-01-01&enddt=${new Date().toISOString().slice(0, 10)}`,
      { headers: SEC_HEADERS, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`SEC EFTS ${res.status}`)
    const json = await res.json()
    return {
      total: json.hits?.total?.value || 0,
      filings: (json.hits?.hits || []).slice(0, limit).map(h => ({
        id: h._id,
        type: h._source?.form_type || h._source?.file_type,
        entity: h._source?.display_names?.[0] || h._source?.entity_name,
        date: h._source?.file_date,
        url: h._source?.file_url ? `https://www.sec.gov${h._source.file_url}` : null,
      })),
    }
  })
}

// ── CFPB Consumer Complaints ───────────────────────────────────────────────────
// Docs: https://cfpb.github.io/api/ccdb/

export async function cfpbComplaints(companyName, { limit = 10, sort = 'created_date_desc' } = {}) {
  const key = `cfpb:${companyName}:${limit}:${sort}`
  return cached(key, async () => {
    const params = new URLSearchParams({
      company: companyName,
      size: String(limit),
      sort: sort,
      no_aggs: 'true',
    })
    const res = await fetch(
      `https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?${params}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`CFPB API ${res.status}`)
    const json = await res.json()
    return {
      total: json.hits?.total?.value || json.hits?.total || 0,
      complaints: (json.hits?.hits || []).slice(0, limit).map(h => {
        const s = h._source || {}
        return {
          id: s.complaint_id,
          date: s.date_received,
          product: s.product,
          subProduct: s.sub_product,
          issue: s.issue,
          subIssue: s.sub_issue,
          narrative: s.complaint_what_happened,
          companyResponse: s.company_response,
          timely: s.timely,
          consumerDisputed: s.consumer_disputed,
          state: s.state,
        }
      }),
    }
  })
}

export async function cfpbComplaintStats(companyName) {
  const key = `cfpb_stats:${companyName}`
  return cached(key, async () => {
    const params = new URLSearchParams({
      company: companyName,
      size: '0',
    })
    const res = await fetch(
      `https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?${params}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`CFPB stats ${res.status}`)
    const json = await res.json()
    const aggs = json.aggregations || {}
    return {
      total: json.hits?.total?.value || json.hits?.total || 0,
      products: (aggs.product?.buckets || []).map(b => ({ name: b.key, count: b.doc_count })),
      issues: (aggs.issue?.buckets || []).map(b => ({ name: b.key, count: b.doc_count })),
      timely: aggs.timely?.buckets?.find(b => b.key_as_string === 'true')?.doc_count || 0,
    }
  })
}

// ── openFDA (Recalls & Adverse Events) ─────────────────────────────────────────
// Docs: https://open.fda.gov/apis/

export async function fdaRecalls(companyName, { limit = 10 } = {}) {
  const key = `fda_recalls:${companyName}:${limit}`
  return cached(key, async () => {
    // Try drug enforcement first, then food, then device
    const endpoints = [
      'drug/enforcement',
      'food/enforcement',
      'device/enforcement',
    ]
    let allResults = []

    for (const ep of endpoints) {
      try {
        const res = await fetch(
          `https://api.fda.gov/${ep}.json?search=openfda.manufacturer_name:"${encodeURIComponent(companyName)}"&limit=${limit}`,
          { signal: AbortSignal.timeout(6000) }
        )
        if (res.ok) {
          const json = await res.json()
          const results = (json.results || []).map(r => ({
            type: ep.split('/')[0],
            recallNumber: r.recall_number,
            status: r.status,
            classification: r.classification,
            reason: r.reason_for_recall,
            productDescription: r.product_description,
            recallDate: r.recall_initiation_date,
            city: r.city,
            state: r.state,
            country: r.country,
            voluntaryMandated: r.voluntary_mandated,
            distribution: r.distribution_pattern,
          }))
          allResults.push(...results)
        }
      } catch { /* skip endpoint */ }
    }

    return allResults.slice(0, limit)
  })
}

export async function fdaAdverseEvents(companyName, { limit = 5 } = {}) {
  const key = `fda_adverse:${companyName}:${limit}`
  return cached(key, async () => {
    try {
      const res = await fetch(
        `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.manufacturer_name:"${encodeURIComponent(companyName)}"&count=receivedate`,
        { signal: AbortSignal.timeout(6000) }
      )
      if (!res.ok) return { total: 0, byYear: [] }
      const json = await res.json()
      const results = json.results || []
      const total = results.reduce((sum, r) => sum + r.count, 0)
      return {
        total,
        byYear: results.slice(-10).map(r => ({
          date: r.time,
          count: r.count,
        })),
      }
    } catch {
      return { total: 0, byYear: [] }
    }
  })
}

// ── CPSC Product Recalls ───────────────────────────────────────────────────────
// Docs: https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information

export async function cpscRecalls(companyName, { limit = 10 } = {}) {
  const key = `cpsc:${companyName}:${limit}`
  return cached(key, async () => {
    const res = await fetch(
      `https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallTitle=${encodeURIComponent(companyName)}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) throw new Error(`CPSC API ${res.status}`)
    const json = await res.json()
    return (json || []).slice(0, limit).map(r => ({
      recallId: r.RecallID,
      recallNumber: r.RecallNumber,
      recallDate: r.RecallDate,
      title: r.Title || r.RecallTitle,
      description: r.Description,
      url: r.URL,
      hazards: (r.Hazards || []).map(h => h.Name || h.HazardDescription),
      remedies: (r.Remedies || []).map(rem => rem.Name || rem.Description),
      manufacturers: (r.Manufacturers || []).map(m => m.Name || m.CompanyName),
      units: r.NumberOfUnits,
      images: (r.Images || []).map(img => img.URL),
    }))
  })
}

// ── USAspending (Federal Contracts & Grants) ───────────────────────────────────
// Docs: https://api.usaspending.gov

export async function usaspendingSearch(companyName, { limit = 10 } = {}) {
  const key = `usaspend:${companyName}:${limit}`
  return cached(key, async () => {
    const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          keywords: [companyName],
          time_period: [{ start_date: '2020-01-01', end_date: new Date().toISOString().slice(0, 10) }],
        },
        fields: [
          'Award ID', 'Recipient Name', 'Award Amount',
          'Total Outlays', 'Description', 'Start Date', 'End Date',
          'Awarding Agency', 'Awarding Sub Agency', 'Award Type',
        ],
        limit,
        page: 1,
        sort: 'Award Amount',
        order: 'desc',
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`USAspending ${res.status}`)
    const json = await res.json()
    return {
      total: json.page_metadata?.total || 0,
      awards: (json.results || []).map(r => ({
        id: r['Award ID'],
        recipient: r['Recipient Name'],
        amount: r['Award Amount'],
        outlays: r['Total Outlays'],
        description: r['Description'],
        startDate: r['Start Date'],
        endDate: r['End Date'],
        agency: r['Awarding Agency'],
        subAgency: r['Awarding Sub Agency'],
        type: r['Award Type'],
      })),
    }
  })
}

export async function usaspendingTotal(companyName) {
  const key = `usaspend_total:${companyName}`
  return cached(key, async () => {
    const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award_count/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: {
          keywords: [companyName],
          time_period: [{ start_date: '2015-01-01', end_date: new Date().toISOString().slice(0, 10) }],
        },
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { contracts: 0, grants: 0, total: 0 }
    const json = await res.json()
    const results = json.results || {}
    return {
      contracts: results.contracts || 0,
      grants: results.grants || 0,
      directPayments: results.direct_payments || 0,
      loans: results.loans || 0,
      total: Object.values(results).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0),
    }
  })
}

// ── Helper: fetch all data for a company in parallel ───────────────────────────

export async function fetchAllGovData(companyName) {
  const results = {
    sec: null,
    cfpb: null,
    cfpbStats: null,
    fda: null,
    fdaAdverse: null,
    cpsc: null,
    usaspending: null,
    usaspendingTotal: null,
  }

  const tasks = [
    secFullTextSearch(companyName, { limit: 5 }).then(d => { results.sec = d }).catch(() => {}),
    cfpbComplaints(companyName, { limit: 5 }).then(d => { results.cfpb = d }).catch(() => {}),
    cfpbComplaintStats(companyName).then(d => { results.cfpbStats = d }).catch(() => {}),
    fdaRecalls(companyName, { limit: 5 }).then(d => { results.fda = d }).catch(() => {}),
    fdaAdverseEvents(companyName, { limit: 5 }).then(d => { results.fdaAdverse = d }).catch(() => {}),
    cpscRecalls(companyName, { limit: 5 }).then(d => { results.cpsc = d }).catch(() => {}),
    usaspendingSearch(companyName, { limit: 5 }).then(d => { results.usaspending = d }).catch(() => {}),
    usaspendingTotal(companyName).then(d => { results.usaspendingTotal = d }).catch(() => {}),
  ]

  await Promise.allSettled(tasks)
  return results
}
