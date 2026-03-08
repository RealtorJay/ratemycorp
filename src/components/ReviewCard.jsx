import { useState } from 'react'
import { Link } from 'react-router-dom'
import Stars from './Stars'
import { supabase } from '../lib/supabase'
import './ReviewCard.css'

export default function ReviewCard({ review, showActions = false, onEdit, onDelete, showCompany = false }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [flagging, setFlagging] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [flagSent, setFlagSent] = useState(false)

  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const handleFlag = async () => {
    if (!flagReason.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('flags').insert({
      reporter_id: user.id,
      target_type: 'review',
      target_id: review.id,
      reason: flagReason.trim(),
    })
    setFlagSent(true)
    setFlagging(false)
  }

  return (
    <div className={`review-card ${review.is_flagged ? 'flagged' : ''}`}>
      {review.is_flagged && (
        <div className="review-flagged-banner">⚠ Under fact-check review</div>
      )}

      <div className="review-card-header">
        <div>
          <h3 className="review-headline">{review.headline}</h3>
          {showCompany && review.companies && (
            <Link to={`/companies/${review.companies.slug}`} className="review-company-link">
              {review.companies.name}
            </Link>
          )}
          <div className="review-meta">
            <Stars rating={review.overall} size="sm" />
            <span className="review-date">{date}</span>
            <span className="review-author">Anonymous Report</span>
          </div>
        </div>
        {showActions && (
          <div className="review-actions">
            <button className="action-btn edit-btn" onClick={onEdit}>Edit</button>
            {!confirmDelete ? (
              <button className="action-btn delete-btn" onClick={() => setConfirmDelete(true)}>Delete</button>
            ) : (
              <span className="confirm-delete">
                Are you sure?{' '}
                <button className="action-btn delete-btn" onClick={onDelete}>Yes</button>
                {' / '}
                <button className="action-btn" onClick={() => setConfirmDelete(false)}>No</button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="review-body">
        <p className="review-body-text">{review.body}</p>
        {review.sources && (
          <div className="review-sources">
            <span className="review-label sources-label">Sources</span>
            <pre className="review-sources-text">{review.sources}</pre>
          </div>
        )}
      </div>

      {!showActions && !flagSent && (
        <div className="review-footer">
          {!flagging ? (
            <button className="flag-btn" onClick={() => setFlagging(true)}>⚑ Flag as inaccurate</button>
          ) : (
            <div className="flag-form">
              <input
                className="flag-input"
                placeholder="Brief reason (e.g. misleading claim about pay)…"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                maxLength={200}
              />
              <button className="action-btn delete-btn" onClick={handleFlag} disabled={!flagReason.trim()}>Submit flag</button>
              <button className="action-btn" onClick={() => setFlagging(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}
      {flagSent && <p className="flag-sent">Thanks — this review has been flagged for review.</p>}
    </div>
  )
}
