import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import StarPicker from '../components/StarPicker'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './SubmitReviewPage.css'

const RATING_FIELDS = [
  { key: 'overall',          label: 'Overall Score' },
  { key: 'environmental',    label: 'Environmental Impact' },
  { key: 'ethical_business', label: 'Ethical Business' },
  { key: 'consumer_trust',   label: 'Consumer Trust' },
  { key: 'scandals',         label: 'Corporate Scandals' },
]

const initRatings = () => Object.fromEntries(RATING_FIELDS.map((f) => [f.key, 0]))

export default function SubmitReviewPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [ratings, setRatings] = useState(initRatings())
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [sources, setSources] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('companies').select('id, name, slug').eq('slug', slug).single()
      .then(({ data }) => { setCompany(data); setLoadingCompany(false) })
  }, [slug])

  const setRating = (key, val) => setRatings((r) => ({ ...r, [key]: val }))

  const validate = () => {
    for (const f of RATING_FIELDS) {
      if (!ratings[f.key]) return `Please rate ${f.label}.`
    }
    if (headline.trim().length < 10) return 'Headline must be at least 10 characters.'
    if (headline.trim().length > 100) return 'Headline must be at most 100 characters.'
    if (body.trim().length < 30) return 'Report body must be at least 30 characters.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('reviews').insert({
      company_id: company.id,
      user_id: user.id,
      headline: headline.trim(),
      body: body.trim(),
      sources: sources.trim() || null,
      ...ratings,
    })

    if (dbError) {
      if (dbError.code === '23505') {
        setError("You've already reviewed this company. Go to your dashboard to edit it.")
      } else {
        setError(dbError.message)
      }
      setSubmitting(false)
      return
    }

    navigate(`/companies/${slug}`)
  }

  if (loadingCompany) return <div className="review-page"><NavBar /><div className="review-loading">Loading…</div></div>
  if (!company) return <div className="review-page"><NavBar /><div className="review-loading">Company not found. <Link to="/companies">Browse Companies</Link></div></div>

  return (
    <div className="review-page">
      <NavBar />
      <div className="review-inner">
        <div className="review-back">
          <Link to={`/companies/${slug}`}>← Back to {company.name}</Link>
        </div>
        <h1 className="review-title">Submit a Report</h1>
        <p className="review-for">for <strong>{company.name}</strong></p>

        <form className="review-form" onSubmit={handleSubmit}>
          {/* Star ratings */}
          <div className="form-section">
            <h2 className="form-section-title">Ratings</h2>
            <div className="ratings-grid">
              {RATING_FIELDS.map((f) => (
                <div key={f.key} className="rating-row">
                  <label className="rating-label">{f.label}</label>
                  <StarPicker value={ratings[f.key]} onChange={(v) => setRating(f.key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Written report */}
          <div className="form-section">
            <h2 className="form-section-title">Your Report</h2>

            <label className="field-label">
              Headline <span className="field-hint">(10–100 characters)</span>
              <input
                className="field-input"
                placeholder="e.g. Sued for dumping toxic waste in Ohio river"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={100}
                required
              />
              <span className="char-count">{headline.length}/100</span>
            </label>

            <label className="field-label">
              Report <span className="field-hint">(min 30 characters)</span>
              <textarea
                className="field-textarea"
                placeholder="Describe what you know. Be factual and specific — vague or opinion-only reports may be rejected."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                required
              />
            </label>

            <label className="field-label">
              Sources <span className="field-hint">(optional — links to news articles, documents, etc.)</span>
              <textarea
                className="field-textarea"
                placeholder="https://example.com/article&#10;https://example.com/filing"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                rows={3}
              />
            </label>
          </div>

          {error && <p className="review-error">{error}</p>}

          <div className="review-form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <Link to={`/companies/${slug}`} className="btn btn-ghost">Cancel</Link>
          </div>

          <p className="review-disclaimer">
            Reports are anonymous and reviewed before publishing. False or misleading claims will be rejected. Include sources where possible.
          </p>
        </form>
      </div>
    </div>
  )
}
