/**
 * Auto-Research Module — searches Wikidata + Wikipedia for unknown companies
 * and politicians, then inserts them into Supabase so they persist forever.
 *
 * All APIs are free, no keys required. CORS-compatible from the browser.
 */

const CACHE = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 min

function cached(key, fetchFn) {
  const entry = CACHE.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return Promise.resolve(entry.data)
  return fetchFn().then(data => {
    CACHE.set(key, { data, ts: Date.now() })
    return data
  })
}

const UA = 'RateMyCorps/1.0 (admin@ratemycorp.com)'

// ── Slug generation ──────────────────────────────────────────────────────────

export function generateSlug(name) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ── Wikidata Search API ──────────────────────────────────────────────────────
// Fast name lookup → returns candidate QIDs

async function wikidataSearch(query) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=5&origin=*`

  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.search || []
}

// ── Classify entity via SPARQL ───────────────────────────────────────────────
// Check if a Wikidata QID is a company or a politician

async function classifyEntity(qid) {
  const sparql = `
    SELECT ?instanceOf ?officeHeld WHERE {
      wd:${qid} wdt:P31 ?instanceOf .
      OPTIONAL { wd:${qid} wdt:P39 ?officeHeld . }
    } LIMIT 20
  `
  const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql)
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return null

  const data = await res.json()
  const bindings = data.results.bindings

  const instanceTypes = bindings.map(b => b.instanceOf?.value?.split('/').pop()).filter(Boolean)
  const hasOffice = bindings.some(b => b.officeHeld?.value)

  // Company types: Q4830453 (business enterprise), Q6881511 (enterprise), Q43229 (organization),
  // Q891723 (public company), Q2912172 (privately held company)
  const companyTypes = ['Q4830453', 'Q6881511', 'Q891723', 'Q2912172', 'Q783794', 'Q4830453']
  const personTypes = ['Q5']

  const isCompany = instanceTypes.some(t => companyTypes.includes(t))
  const isPerson = instanceTypes.some(t => personTypes.includes(t))

  if (isCompany) return 'company'
  if (isPerson && hasOffice) return 'politician'
  if (isPerson) return 'person' // person but not a politician — we still skip
  return null
}

// ── Fetch company data via SPARQL ────────────────────────────────────────────

async function fetchCompanyDataFromWikidata(qid) {
  const sparql = `
    SELECT ?companyLabel ?ceoLabel ?hqLabel ?inception ?website ?employeeCount ?industryLabel ?ticker ?description WHERE {
      OPTIONAL { wd:${qid} wdt:P169 ?ceo . }
      OPTIONAL { wd:${qid} wdt:P159 ?hq . }
      OPTIONAL { wd:${qid} wdt:P571 ?inception . }
      OPTIONAL { wd:${qid} wdt:P856 ?website . }
      OPTIONAL { wd:${qid} wdt:P1128 ?employeeCount . }
      OPTIONAL { wd:${qid} wdt:P452 ?industry . }
      OPTIONAL { wd:${qid} wdt:P249 ?ticker . }
      OPTIONAL {
        wd:${qid} schema:description ?description .
        FILTER(LANG(?description) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 1
  `
  const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql)
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return {}

  const data = await res.json()
  const row = data.results.bindings[0]
  if (!row) return {}

  const result = {}

  const label = row.companyLabel?.value
  if (label && !label.startsWith('Q')) result.label = label

  if (row.ceoLabel?.value && !row.ceoLabel.value.startsWith('Q'))
    result.ceo_name = row.ceoLabel.value

  if (row.hqLabel?.value && !row.hqLabel.value.startsWith('Q'))
    result.headquarters = row.hqLabel.value

  if (row.inception?.value) {
    const year = parseInt(row.inception.value.slice(0, 4))
    if (year > 1600 && year <= new Date().getFullYear()) result.founded_year = year
  }

  if (row.website?.value) result.website = row.website.value

  if (row.employeeCount?.value) {
    const count = parseInt(row.employeeCount.value)
    if (count > 0) {
      result.employee_count = count >= 1000
        ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
        : String(count)
    }
  }

  if (row.industryLabel?.value && !row.industryLabel.value.startsWith('Q'))
    result.industry = capitalizeIndustry(row.industryLabel.value)

  if (row.ticker?.value) {
    result.stock_ticker = row.ticker.value
    result.is_public = true
  }

  if (row.description?.value && row.description.value.length > 20)
    result.description = row.description.value

  return result
}

function capitalizeIndustry(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

// ── Fetch politician data via SPARQL ─────────────────────────────────────────

async function fetchPoliticianDataFromWikidata(qid) {
  const sparql = `
    SELECT ?personLabel ?partyLabel ?officeLabel ?stateLabel ?startTime ?endTime ?countryLabel ?description WHERE {
      OPTIONAL {
        wd:${qid} p:P39 ?posStmt .
        ?posStmt ps:P39 ?office .
        OPTIONAL { ?posStmt pq:P580 ?startTime . }
        OPTIONAL { ?posStmt pq:P582 ?endTime . }
        OPTIONAL { ?posStmt pq:P768 ?state . }
      }
      OPTIONAL { wd:${qid} wdt:P102 ?party . }
      OPTIONAL { wd:${qid} wdt:P27 ?country . }
      OPTIONAL {
        wd:${qid} schema:description ?description .
        FILTER(LANG(?description) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 10
  `
  const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(sparql)
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return {}

  const data = await res.json()
  const bindings = data.results.bindings
  if (!bindings.length) return {}

  const first = bindings[0]
  const result = {}

  if (first.personLabel?.value && !first.personLabel.value.startsWith('Q'))
    result.label = first.personLabel.value

  if (first.partyLabel?.value && !first.partyLabel.value.startsWith('Q'))
    result.party = normalizeParty(first.partyLabel.value)

  if (first.description?.value)
    result.bio = first.description.value

  // Find the most recent office (no end time = current)
  let bestOffice = null
  for (const b of bindings) {
    const officeName = b.officeLabel?.value
    if (!officeName || officeName.startsWith('Q')) continue
    const hasEnd = !!b.endTime?.value
    if (!bestOffice || (!hasEnd && bestOffice.hasEnd)) {
      bestOffice = {
        name: officeName,
        state: b.stateLabel?.value,
        hasEnd,
        startTime: b.startTime?.value,
      }
    }
  }

  if (bestOffice) {
    result.current_office = bestOffice.name
    result.title = deriveTitle(bestOffice.name)
    result.chamber = deriveChamber(bestOffice.name)
    result.in_office = !bestOffice.hasEnd
    if (bestOffice.state && !bestOffice.state.startsWith('Q'))
      result.state = deriveStateCode(bestOffice.state)
    if (bestOffice.startTime)
      result.term_start = bestOffice.startTime.slice(0, 10)
  }

  return result
}

function normalizeParty(party) {
  const p = party.toLowerCase()
  if (p.includes('democrat')) return 'Democrat'
  if (p.includes('republican')) return 'Republican'
  if (p.includes('independent') || p.includes('libertarian') || p.includes('green')) return 'Independent'
  return party
}

function deriveTitle(officeName) {
  const o = officeName.toLowerCase()
  if (o.includes('senator') || o.includes('senate')) return 'Senator'
  if (o.includes('representative') || o.includes('house of representatives')) return 'Representative'
  if (o.includes('governor')) return 'Governor'
  if (o.includes('president')) return 'President'
  if (o.includes('vice president')) return 'Vice President'
  if (o.includes('mayor')) return 'Mayor'
  return officeName.split(' ').slice(0, 3).join(' ')
}

function deriveChamber(officeName) {
  const o = officeName.toLowerCase()
  if (o.includes('senator') || o.includes('senate')) return 'senate'
  if (o.includes('representative') || o.includes('house of representatives')) return 'house'
  if (o.includes('governor')) return 'governor'
  if (o.includes('president') || o.includes('vice president') || o.includes('secretary')) return 'executive'
  return 'other'
}

// US state name → 2-letter code
const STATE_CODES = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
}

function deriveStateCode(stateName) {
  if (!stateName) return null
  // Already a 2-letter code
  if (/^[A-Z]{2}$/.test(stateName)) return stateName
  const code = STATE_CODES[stateName.toLowerCase()]
  return code || null
}

// ── Wikipedia excerpt (fallback description) ─────────────────────────────────

async function fetchWikipediaExcerpt(name, suffix = '') {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + (suffix ? ' ' + suffix : ''))}&srlimit=1&format=json&origin=*`
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(6000),
    })
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const title = searchData.query?.search?.[0]?.title
    if (!title) return null

    const excerptUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&exsentences=3&origin=*`
    const excerptRes = await fetch(excerptUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(6000),
    })
    if (!excerptRes.ok) return null
    const excerptData = await excerptRes.json()
    const pages = excerptData.query?.pages
    if (!pages) return null
    const page = Object.values(pages)[0]
    const extract = page?.extract
    if (extract && extract.length > 50 && extract.length < 2000) return extract
    return null
  } catch {
    return null
  }
}

// ── Main orchestrator ────────────────────────────────────────────────────────

/**
 * Research an entity by name, classify it, fetch data, and insert into Supabase.
 *
 * @param {string} query - Search term (company or politician name)
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ type: 'company'|'politician', data: object, isNew: boolean } | null>}
 */
export async function researchAndInsert(query, supabase) {
  const cacheKey = `research:${query.toLowerCase().trim()}`
  const cachedResult = CACHE.get(cacheKey)
  if (cachedResult && Date.now() - cachedResult.ts < CACHE_TTL) {
    return cachedResult.data
  }

  try {
    // 1. Search Wikidata for candidates
    const candidates = await wikidataSearch(query)
    if (!candidates.length) return null

    // 2. Try each candidate until we find a company or politician
    let entityType = null
    let qid = null
    let entityLabel = null

    for (const candidate of candidates.slice(0, 3)) {
      const type = await classifyEntity(candidate.id)
      if (type === 'company' || type === 'politician') {
        entityType = type
        qid = candidate.id
        entityLabel = candidate.label || query
        break
      }
    }

    if (!entityType || !qid) return null

    const slug = generateSlug(entityLabel)

    // 3. Check for existing duplicate by slug
    if (entityType === 'company') {
      const { data: existing } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (existing) {
        const result = { type: 'company', data: existing, isNew: false }
        CACHE.set(cacheKey, { data: result, ts: Date.now() })
        return result
      }
    } else {
      const { data: existing } = await supabase
        .from('politicians')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (existing) {
        const result = { type: 'politician', data: existing, isNew: false }
        CACHE.set(cacheKey, { data: result, ts: Date.now() })
        return result
      }
    }

    // 4. Fetch detailed data
    if (entityType === 'company') {
      const wd = await fetchCompanyDataFromWikidata(qid)
      const name = wd.label || entityLabel

      // Get Wikipedia description if Wikidata description is short
      let description = wd.description || ''
      if (!description || description.length < 80) {
        const wikiDesc = await fetchWikipediaExcerpt(name, 'company')
        if (wikiDesc) description = wikiDesc
      }

      const companyData = {
        name,
        slug,
        industry: wd.industry || null,
        description: description || null,
        website: wd.website || null,
        ceo_name: wd.ceo_name || null,
        headquarters: wd.headquarters || null,
        founded_year: wd.founded_year || null,
        employee_count: wd.employee_count || null,
        stock_ticker: wd.stock_ticker || null,
        is_public: wd.is_public || false,
      }

      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single()

      if (error) {
        // Handle concurrent duplicate insert (unique constraint on slug)
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('companies')
            .select('*')
            .eq('slug', slug)
            .single()
          if (existing) {
            const result = { type: 'company', data: existing, isNew: false }
            CACHE.set(cacheKey, { data: result, ts: Date.now() })
            return result
          }
        }
        console.error('Auto-research insert error:', error)
        return null
      }

      const result = { type: 'company', data, isNew: true }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return result

    } else {
      // Politician
      const wd = await fetchPoliticianDataFromWikidata(qid)
      const fullName = wd.label || entityLabel

      // Get Wikipedia bio if Wikidata description is short
      let bio = wd.bio || ''
      if (!bio || bio.length < 80) {
        const wikiBio = await fetchWikipediaExcerpt(fullName, 'politician')
        if (wikiBio) bio = wikiBio
      }

      const politicianData = {
        full_name: fullName,
        slug,
        party: wd.party || null,
        chamber: wd.chamber || null,
        state: wd.state || null,
        title: wd.title || null,
        current_office: wd.current_office || null,
        in_office: wd.in_office ?? true,
        bio: bio || null,
        term_start: wd.term_start || null,
      }

      const { data, error } = await supabase
        .from('politicians')
        .insert(politicianData)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('politicians')
            .select('*')
            .eq('slug', slug)
            .single()
          if (existing) {
            const result = { type: 'politician', data: existing, isNew: false }
            CACHE.set(cacheKey, { data: result, ts: Date.now() })
            return result
          }
        }
        console.error('Auto-research insert error:', error)
        return null
      }

      const result = { type: 'politician', data, isNew: true }
      CACHE.set(cacheKey, { data: result, ts: Date.now() })
      return result
    }
  } catch (err) {
    console.error('Auto-research failed:', err)
    return null
  }
}
