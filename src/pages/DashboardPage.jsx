import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import ReviewCard from '../components/ReviewCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReviews() }, [user])

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
        </div>

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
