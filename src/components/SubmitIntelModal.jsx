import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canSubmit } from '../lib/rateLimit'

const SOCIAL_TYPES = [
  { value: 'tweet', label: 'X / Twitter Post' },
  { value: 'instagram', label: 'Instagram Post' },
  { value: 'tiktok', label: 'TikTok Video' },
  { value: 'youtube', label: 'YouTube Video' },
  { value: 'linkedin', label: 'LinkedIn Post' },
  { value: 'reddit', label: 'Reddit Post' },
]

const CONTENT_TYPES = [
  { value: 'news', label: 'News Article' },
  { value: 'research', label: 'Research / Analysis' },
]

const CATEGORIES = [
  'environmental', 'labor', 'consumer', 'legal', 'financial',
  'regulatory', 'scandal', 'positive', 'neutral', 'other',
]

export default function SubmitIntelModal({ companyId, companyName, onClose, onSubmitted }) {
  const { user } = useAuth()
  const [itemType, setItemType] = useState('tweet')
  const [subjectType, setSubjectType] = useState('company')
  const [embedUrl, setEmbedUrl] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [category, setCategory] = useState('other')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isSocial = SOCIAL_TYPES.some(t => t.value === itemType)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (!canSubmit('submit-intel-' + companyId, 30000)) {
      setError('Please wait before submitting again.')
      return
    }

    if (isSocial && !embedUrl.trim()) { setError('Please enter a post URL.'); return }
    if (!isSocial && !title.trim()) { setError('Please enter a title.'); return }

    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('intel_items').insert({
      company_id: companyId,
      user_id: user.id,
      item_type: itemType,
      subject_type: subjectType,
      embed_url: isSocial ? embedUrl.trim() : null,
      title: title.trim() || null,
      body: body.trim() || null,
      source_url: isSocial ? embedUrl.trim() : (sourceUrl.trim() || null),
      source_name: sourceName.trim() || null,
      category,
      status: 'pending',
    })

    if (dbError) {
      setError(dbError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    if (onSubmitted) onSubmitted()
    setTimeout(() => onClose(), 2500)
  }

  return (
    <div className="intel-modal-overlay" onClick={onClose}>
      <div className="intel-modal" onClick={e => e.stopPropagation()}>
        <div className="intel-modal-header">
          <h2>Submit Intel on {companyName}</h2>
          <button className="intel-modal-close" onClick={onClose}>x</button>
        </div>

        {success ? (
          <div className="intel-modal-success">
            <p>Submitted for review. A moderator will approve it shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="intel-modal-form">
            {/* Type selection */}
            <div className="intel-form-group">
              <label className="intel-form-label">What type of intel?</label>
              <div className="intel-type-grid">
                {SOCIAL_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`intel-type-btn ${itemType === t.value ? 'active' : ''}`}
                    onClick={() => setItemType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
                {CONTENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`intel-type-btn ${itemType === t.value ? 'active' : ''}`}
                    onClick={() => setItemType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="intel-form-group">
              <label className="intel-form-label">This is about:</label>
              <div className="intel-subject-btns">
                {[
                  { value: 'company', label: 'The Company' },
                  { value: 'ceo', label: 'The CEO' },
                  { value: 'public_discourse', label: 'Public Discourse' },
                ].map(s => (
                  <button
                    key={s.value}
                    type="button"
                    className={`intel-type-btn ${subjectType === s.value ? 'active' : ''}`}
                    onClick={() => setSubjectType(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social media URL */}
            {isSocial && (
              <div className="intel-form-group">
                <label className="intel-form-label">Post URL</label>
                <input
                  className="intel-form-input"
                  placeholder="https://x.com/username/status/..."
                  value={embedUrl}
                  onChange={e => setEmbedUrl(e.target.value)}
                />
              </div>
            )}

            {/* News/Research fields */}
            {!isSocial && (
              <>
                <div className="intel-form-group">
                  <label className="intel-form-label">Title</label>
                  <input
                    className="intel-form-input"
                    placeholder="Article headline or report title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="intel-form-group">
                  <label className="intel-form-label">Content</label>
                  <textarea
                    className="intel-form-textarea"
                    placeholder="Summary, key facts, or full analysis..."
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="intel-form-row">
                  <div className="intel-form-group" style={{ flex: 1 }}>
                    <label className="intel-form-label">Source URL</label>
                    <input
                      className="intel-form-input"
                      placeholder="https://..."
                      value={sourceUrl}
                      onChange={e => setSourceUrl(e.target.value)}
                    />
                  </div>
                  <div className="intel-form-group" style={{ flex: 1 }}>
                    <label className="intel-form-label">Source Name</label>
                    <input
                      className="intel-form-input"
                      placeholder="e.g. Reuters, WSJ"
                      value={sourceName}
                      onChange={e => setSourceName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Category */}
            <div className="intel-form-group">
              <label className="intel-form-label">Category</label>
              <select
                className="intel-form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            {error && <p className="intel-form-error">{error}</p>}

            <div className="intel-form-footer">
              <span className="intel-form-notice">Submissions are reviewed before appearing.</span>
              <div className="intel-form-btns">
                <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Intel'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
