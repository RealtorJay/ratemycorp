import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canSubmit } from '../lib/rateLimit'

export default function IntelCommentThread({ itemId, commentCount }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [flagTarget, setFlagTarget] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagSent, setFlagSent] = useState(false)

  useEffect(() => {
    if (expanded) loadComments()
  }, [expanded])

  const loadComments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('intel_comments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/auth'); return }
    if (body.trim().length < 5) { setError('Comment must be at least 5 characters.'); return }
    if (!canSubmit('intel-comment-' + itemId, 15000)) { setError('Please wait before posting again.'); return }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('intel_comments').insert({
      item_id: itemId,
      user_id: user.id,
      body: body.trim(),
      status: 'pending',
    })

    if (dbError) { setError(dbError.message); setSubmitting(false); return }

    setComments(prev => [...prev, {
      id: Date.now(),
      body: body.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      user_id: user.id,
    }])
    setBody('')
    setSubmitting(false)
  }

  const openFlag = (targetId) => {
    if (!user) { navigate('/auth'); return }
    if (!canSubmit('flag-' + targetId, 30000)) return
    setFlagTarget(targetId)
    setFlagReason('')
    setFlagSent(false)
  }

  const submitFlag = async () => {
    if (!flagTarget || flagReason.trim().length < 5) return
    const { error: flagErr } = await supabase.from('flags').insert({
      reporter_id: user.id,
      target_type: 'intel_comment',
      target_id: flagTarget,
      reason: flagReason.trim(),
    })
    if (!flagErr) setFlagSent(true)
    setTimeout(() => { setFlagTarget(null); setFlagSent(false) }, 2000)
  }

  const visibleComments = comments.filter(c =>
    c.status === 'approved' || c.user_id === user?.id
  )

  return (
    <div className="intel-thread">
      <button
        className="intel-thread-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▾' : '▸'} {commentCount || 0} {commentCount === 1 ? 'comment' : 'comments'}
      </button>

      {expanded && (
        <div className="intel-thread-body">
          {loading ? (
            <div className="intel-thread-loading">Loading comments...</div>
          ) : (
            <>
              {visibleComments.length > 0 && (
                <div className="intel-comments-list">
                  {visibleComments.map(c => (
                    <div key={c.id} className={`intel-comment ${c.status === 'pending' ? 'pending' : ''}`}>
                      {c.status === 'pending' && (
                        <span className="intel-comment-pending">Pending review</span>
                      )}
                      <p className="intel-comment-body">{c.body}</p>
                      <div className="intel-comment-meta">
                        <span>Anonymous</span>
                        <span>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        {c.status === 'approved' && (
                          <button className="intel-flag-btn" onClick={() => openFlag(c.id)}>Flag</button>
                        )}
                      </div>
                      {flagTarget === c.id && (
                        <div className="intel-flag-form">
                          {flagSent ? (
                            <p className="intel-flag-success">Flagged for review.</p>
                          ) : (
                            <>
                              <input
                                className="intel-flag-input"
                                placeholder="Reason for flagging"
                                value={flagReason}
                                onChange={e => setFlagReason(e.target.value)}
                                maxLength={200}
                              />
                              <div className="intel-flag-actions">
                                <button className="btn btn-primary" onClick={submitFlag} disabled={flagReason.trim().length < 5}>Submit</button>
                                <button className="btn btn-ghost" onClick={() => setFlagTarget(null)}>Cancel</button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <div className="intel-comment-form">
                {user ? (
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="intel-comment-textarea"
                      placeholder="Add a comment..."
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={2}
                      maxLength={2000}
                    />
                    {error && <p className="intel-comment-error">{error}</p>}
                    <div className="intel-comment-form-actions">
                      <span className="intel-comment-notice">Comments are reviewed before appearing.</span>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="intel-comment-login">
                    <a href="/auth" className="login-link">Log in</a> to comment.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
