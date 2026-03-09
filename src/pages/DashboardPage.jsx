import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ReviewCard from '../components/ReviewCard'
import CompanyLogo from '../components/CompanyLogo'
import Stars from '../components/Stars'
import FollowButton from '../components/FollowButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, followedCompanies, preferences } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [followedDetails, setFollowedDetails] = useState([])
  const [recommended, setRecommended] = useState([])
  const [insights, setInsights] = useState(null)

  useEffect(() => { fetchReviews() }, [user])

  // Fetch AI insights
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_insights')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .single()
      .then(({ data }) => setInsights(data))
  }, [user])

  // Fetch followed company details
  useEffect(() => {
    if (!followedCompanies.length) {
      setFollowedDetails([])
      return
    }
    supabase
      .from('companies')
      .select('id, name, slug, industry, avg_overall, review_count, website')
      .in('id', followedCompanies)
      .order('name')
      .then(({ data }) => setFollowedDetails(data || []))
  }, [followedCompanies])

  // Fetch recommended companies based on preferences
  useEffect(() => {
    if (!preferences?.industries?.length) {
      setRecommended([])
      return
    }
    supabase
      .from('companies')
      .select('id, name, slug, industry, avg_overall, review_count, website')
      .in('industry', preferences.industries)
      .not('id', 'in', `(${followedCompanies.length ? followedCompanies.join(',') : '00000000-0000-0000-0000-000000000000'})`)
      .order('review_count', { ascending: false })
      .limit(6)
      .then(({ data }) => setRecommended(data || []))
  }, [preferences, followedCompanies])

  const fetchReviews = async () => {
    if (!user) return
    const { data } = await supabase
      .from('reviews')
      .select('*, companies(name, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('reviews').delete().eq('id', id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.overall, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <div className="dashboard">
      <NavBar />
      <div className="dashboard-inner">
        <h1 className="dashboard-title">My Dashboard</h1>
        <p className="dashboard-sub">{user?.email}</p>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat">
            <span className="dash-stat-value">{reviews.length}</span>
            <span className="dash-stat-label">Reviews</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{avgRating}</span>
            <span className="dash-stat-label">Avg Rating Given</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{followedCompanies.length}</span>
            <span className="dash-stat-label">Following</span>
          </div>
        </div>

        {/* AI Insights */}
        {insights?.insights_data?.cards?.length > 0 && (
          <div className="dash-section" style={{ marginBottom: '2.5rem' }}>
            <div className="dash-section-header">
              <h2 className="dash-section-title">Your Insights</h2>
              <span className="ai-badge">AI Generated</span>
            </div>
            <div className="dash-insights-grid">
              {insights.insights_data.cards.map((card, i) => (
                <div key={i} className="dash-insight-card">
                  <h3 className="dash-insight-title">{card.title}</h3>
                  <p className="dash-insight-body">{card.body}</p>
                </div>
              ))}
            </div>
            <span className="dash-insight-date">
              Generated {new Date(insights.generated_at).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Followed Companies */}
        {followedDetails.length > 0 && (
          <div className="dash-section" style={{ marginBottom: '2.5rem' }}>
            <div className="dash-section-header">
              <h2 className="dash-section-title">Companies You Follow</h2>
            </div>
            <div className="dash-follow-scroll">
              {followedDetails.map((c) => (
                <Link key={c.id} to={`/companies/${c.slug}`} className="dash-follow-card">
                  <CompanyLogo company={c} size={40} />
                  <div className="dash-follow-info">
                    <span className="dash-follow-name">{c.name}</span>
                    <span className="dash-follow-meta">{c.industry}</span>
                  </div>
                  <div className="dash-follow-rating">
                    <Stars rating={c.avg_overall} size="sm" />
                    <span className="dash-follow-count">{c.review_count || 0} reviews</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="dash-section" style={{ marginBottom: '2.5rem' }}>
            <div className="dash-section-header">
              <h2 className="dash-section-title">Recommended For You</h2>
            </div>
            <div className="dash-rec-grid">
              {recommended.map((c) => (
                <Link key={c.id} to={`/companies/${c.slug}`} className="dash-rec-card">
                  <div className="dash-rec-top">
                    <CompanyLogo company={c} size={32} />
                    <div className="dash-rec-info">
                      <span className="dash-follow-name">{c.name}</span>
                      <span className="dash-follow-meta">{c.industry}</span>
                    </div>
                  </div>
                  <div className="dash-rec-bottom">
                    <Stars rating={c.avg_overall} size="sm" />
                    <FollowButton companyId={c.id} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">My Reviews</h2>
            <Link to="/companies" className="btn btn-outline">+ Write a New Review</Link>
          </div>

          {loading ? (
            <div className="dash-loading">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="dash-empty">
              <span>📝</span>
              <p>You haven't reviewed any companies yet.</p>
              <Link to="/companies" className="btn btn-primary">Browse Companies</Link>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  showActions
                  showCompany
                  onEdit={() => navigate(`/dashboard/reviews/${r.id}/edit`)}
                  onDelete={() => handleDelete(r.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
