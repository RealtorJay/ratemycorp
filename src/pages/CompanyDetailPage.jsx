import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Stars from '../components/Stars'
import RatingBar from '../components/RatingBar'
import ReviewCard from '../components/ReviewCard'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './CompanyDetailPage.css'

const RATING_CATEGORIES = [
  { key: 'avg_environmental',    label: 'Environmental Impact' },
  { key: 'avg_ethical_business', label: 'Ethical Business' },
  { key: 'avg_consumer_trust',   label: 'Consumer Trust' },
  { key: 'avg_scandals',         label: 'Corporate Scandals' },
]

export default function CompanyDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    setLoading(true)
    const { data: co, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !co) { setNotFound(true); setLoading(false); return }
    setCompany(co)

    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', co.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setReviews(revs || [])
    setLoading(false)
  }

  const handleWriteReview = () => {
    if (!user) navigate(`/auth?redirect=/companies/${slug}/review`)
    else navigate(`/companies/${slug}/review`)
  }

  if (loading) return <LoadingScreen />
  if (notFound) return <NotFound />

  return (
    <div className="detail-page">
      <NavBar />

      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-inner">
          <CompanyLogo name={company.name} website={company.website} size={72} />
          <div className="detail-header-info">
            <div className="detail-breadcrumb">
              <Link to="/companies">Companies</Link> / {company.name}
            </div>
            <h1 className="detail-name">{company.name}</h1>
            <div className="detail-meta">
              {company.industry && <span className="detail-industry">{company.industry}</span>}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="detail-website">
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="detail-rating-row">
              <span className="detail-big-rating">{Number(company.avg_overall).toFixed(1)}</span>
              <Stars rating={company.avg_overall} size="lg" showNumber={false} />
              <span className="detail-review-count">{company.review_count} reviews</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleWriteReview}>
            + Submit a Report
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-body-inner">
          {/* Sidebar: rating breakdown */}
          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Rating Breakdown</h3>
              <div className="rating-bars">
                {RATING_CATEGORIES.map((cat) => (
                  <RatingBar key={cat.key} label={cat.label} value={company[cat.key]} />
                ))}
              </div>
            </div>
            {company.description && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">About</h3>
                <p className="sidebar-desc">{company.description}</p>
              </div>
            )}
            <Link to={`/companies/${slug}/forum`} className="sidebar-forum-link">
              💬 View Company Forum
            </Link>
          </aside>

          {/* Reviews */}
          <main className="detail-main">
            <div className="detail-main-header">
              <h2 className="detail-section-title">
                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="detail-empty">
                <p>No reviews yet. Be the first to share your experience.</p>
                <button className="btn btn-primary" onClick={handleWriteReview}>Submit a Report</button>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="detail-page">
      <NavBar />
      <div className="detail-loading">Loading…</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="detail-page">
      <NavBar />
      <div className="detail-loading">
        <h2>Company not found</h2>
        <Link to="/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Companies</Link>
      </div>
    </div>
  )
}
