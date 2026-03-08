import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import StarPicker from '../components/StarPicker'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './SubmitReviewPage.css' // reuse same styles

const RATING_FIELDS = [
  { key: 'overall',          label: 'Overall Score' },
  { key: 'environmental',    label: 'Environmental Impact' },
  { key: 'ethical_business', label: 'Ethical Business' },
  { key: 'consumer_trust',   label: 'Consumer Trust' },
  { key: 'scandals',         label: 'Corporate Scandals' },
]

export default function EditReviewPage() {
  const { reviewId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState({})
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [sources, setSources] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: rev } = await supabase
        .from('reviews')
        .select('*, companies(name, slug)')
        .eq('id', reviewId)
        .single()

      if (!rev || rev.user_id !== user?.id) {
        navigate('/dashboard')
        return
      }

      setReview(rev)
      setCompany(rev.companies)
      setHeadline(rev.headline)
      setBody(rev.body)
      setSources(rev.sources || '')
      setRatings(Object.fromEntries(RATING_FIELDS.map((f) => [f.key, rev[f.key]])))
      setLoading(false)
    }
    if (user) load()
  }, [reviewId, user])

  const setRating = (key, val) => setRatings((r) => ({ ...r, [key]: val }))

  const validate = () => {
    for (const f of RATING_FIELDS) {
      if (!ratings[f.key]) return `Please rate ${f.label}.`
    }
    if (headline.trim().length < 10) return 'Headline must be at least 10 characters.'
    if (body.trim().length < 30) return 'Report body must be at least 30 characters.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase
      .from('reviews')
      .update({
        headline: headline.trim(),
        body: body.trim(),
        sources: sources.trim() || null,
        ...ratings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)

    if (dbError) { setError(dbError.message); setSubmitting(false); return }
    navigate('/dashboard')
  }

  if (loading) return <div className="review-page"><NavBar /><div className="review-loading">Loading…</div></div>

  return (
    <div className="review-page">
      <NavBar />
      <div className="review-inner">
        <div className="review-back">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
        <h1 className="review-title">Edit Report</h1>
        <p className="review-for">for <strong>{company?.name}</strong></p>

        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Ratings</h2>
            <div className="ratings-grid">
              {RATING_FIELDS.map((f) => (
                <div key={f.key} className="rating-row">
                  <label className="rating-label">{f.label}</label>
                  <StarPicker value={ratings[f.key] || 0} onChange={(v) => setRating(f.key, v)} />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Your Report</h2>
            <label className="field-label">
              Headline
              <input
                className="field-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={100}
                required
              />
              <span className="char-count">{headline.length}/100</span>
            </label>
            <label className="field-label">
              Report
              <textarea className="field-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={6} required />
            </label>
            <label className="field-label">
              Sources <span className="field-hint" style={{ fontWeight: 400, fontSize: '0.78rem', color: '#505050' }}>(optional)</span>
              <textarea className="field-textarea" value={sources} onChange={(e) => setSources(e.target.value)} rows={3} />
            </label>
          </div>

          {error && <p className="review-error">{error}</p>}

          <div className="review-form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
