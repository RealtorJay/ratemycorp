import { useEffect, useState } from 'react'
import IntelCard from './IntelCard'
import SubmitIntelModal from './SubmitIntelModal'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './IntelFeed.css'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'social', label: 'Social Media' },
  { value: 'news', label: 'News' },
  { value: 'research', label: 'Research' },
]

const SUBJECT_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'company', label: 'Company' },
  { value: 'ceo', label: 'CEO' },
  { value: 'public_discourse', label: 'Public' },
]

const TYPE_MAP = {
  social: ['tweet', 'instagram', 'tiktok', 'youtube', 'linkedin', 'reddit'],
  news: ['news', 'press_release'],
  research: ['research', 'report'],
}

const PAGE_SIZE = 10

export default function IntelFeed({ companyId, companyName }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setPage(0)
    setItems([])
  }, [typeFilter, subjectFilter, companyId])

  useEffect(() => {
    fetchItems()
  }, [companyId, typeFilter, subjectFilter, page])

  const fetchItems = async () => {
    setLoading(true)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('intel_items')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (typeFilter !== 'all') {
      query = query.in('item_type', TYPE_MAP[typeFilter])
    }
    if (subjectFilter !== 'all') {
      query = query.eq('subject_type', subjectFilter)
    }

    const { data, count } = await query
    if (page === 0) {
      setItems(data || [])
    } else {
      setItems(prev => [...prev, ...(data || [])])
    }
    setTotalCount(count || 0)
    setLoading(false)
  }

  const hasMore = items.length < totalCount

  if (!loading && totalCount === 0 && typeFilter === 'all' && subjectFilter === 'all') {
    return null // Don't show section if no intel items at all
  }

  return (
    <div className="intel-feed-section">
      <div className="detail-main-header">
        <h2 className="detail-section-title">Intel Feed</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => user ? setShowModal(true) : window.location.assign('/auth')}
        >
          + Submit Intel
        </button>
      </div>
      <p className="intel-feed-desc">
        Social media posts, news, and research about {companyName}. Curated from public sources and community submissions.
      </p>

      {/* Filter bar */}
      <div className="intel-filters">
        <div className="intel-filter-group">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              className={`intel-filter-btn ${typeFilter === f.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="intel-filter-divider" />
        <div className="intel-filter-group">
          {SUBJECT_FILTERS.map(f => (
            <button
              key={f.value}
              className={`intel-filter-btn ${subjectFilter === f.value ? 'active' : ''}`}
              onClick={() => setSubjectFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {totalCount > 0 && (
        <div className="intel-count">
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
          {typeFilter !== 'all' && ` in ${TYPE_FILTERS.find(f => f.value === typeFilter)?.label}`}
          {subjectFilter !== 'all' && ` about ${SUBJECT_FILTERS.find(f => f.value === subjectFilter)?.label}`}
        </div>
      )}

      {/* Feed */}
      <div className="intel-feed-list">
        {items.map(item => (
          <IntelCard key={item.id} item={item} />
        ))}
      </div>

      {loading && <div className="intel-loading">Loading...</div>}

      {!loading && totalCount === 0 && (
        <div className="intel-empty">
          <p>No intel yet for {companyName}.</p>
          <button
            className="btn btn-primary"
            onClick={() => user ? setShowModal(true) : window.location.assign('/auth')}
          >
            Be the first to submit
          </button>
        </div>
      )}

      {hasMore && !loading && (
        <button
          className="intel-load-more"
          onClick={() => setPage(p => p + 1)}
        >
          Load More ({totalCount - items.length} remaining)
        </button>
      )}

      {showModal && (
        <SubmitIntelModal
          companyId={companyId}
          companyName={companyName}
          onClose={() => setShowModal(false)}
          onSubmitted={() => { setPage(0); fetchItems() }}
        />
      )}
    </div>
  )
}
