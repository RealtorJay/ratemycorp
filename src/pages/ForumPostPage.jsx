import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canSubmit } from '../lib/rateLimit'
import './ForumPage.css'

export default function ForumPostPage() {
  const { slug, postId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [flagTarget, setFlagTarget] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagSent, setFlagSent] = useState(false)

  useEffect(() => { loadData() }, [postId])

  const loadData = async () => {
    setLoading(true)
    const { data: co } = await supabase.from('companies').select('id, name, slug').eq('slug', slug).single()
    setCompany(co)

    const { data: p } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', postId)
      .single()

    setPost(p)

    if (p) {
      const { data: c } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      setComments(c || [])
    }

    setLoading(false)
  }

  const openFlag = (targetType, targetId) => {
    if (!user) { navigate('/auth'); return }
    if (!canSubmit('flag-' + targetId, 30000)) return
    setFlagTarget({ type: targetType, id: targetId })
    setFlagReason('')
    setFlagSent(false)
  }

  const submitFlag = async () => {
    if (!flagTarget || flagReason.trim().length < 5) return
    const { error: flagErr } = await supabase.from('flags').insert({
      reporter_id: user.id,
      target_type: flagTarget.type,
      target_id: flagTarget.id,
      reason: flagReason.trim(),
    })
    if (!flagErr) setFlagSent(true)
    setTimeout(() => { setFlagTarget(null); setFlagSent(false) }, 2000)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) { navigate(`/auth?redirect=/companies/${slug}/forum/${postId}`); return }
    if (commentBody.trim().length < 5) { setError('Comment must be at least 5 characters.'); return }
    if (!canSubmit('comment-' + postId, 15000)) { setError('Please wait before posting again.'); return }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('forum_comments').insert({
      post_id: postId,
      user_id: user.id,
      body: commentBody.trim(),
      status: 'pending',
    })

    if (dbError) { setError(dbError.message); setSubmitting(false); return }

    setComments((prev) => [...prev, {
      id: Date.now(),
      body: commentBody.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
      user_id: user.id,
    }])
    setCommentBody('')
    setSubmitting(false)
  }

  if (loading) return <div className="forum-page"><NavBar /><div className="forum-loading">Loading…</div></div>
  if (!post) return <div className="forum-page"><NavBar /><div className="forum-loading">Post not found. <Link to={`/companies/${slug}/forum`}>Back to forum</Link></div></div>

  const date = new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="forum-page">
      <NavBar />
      <div className="forum-inner forum-inner--post">
        <div className="forum-breadcrumb">
          <Link to="/companies">Companies</Link>
          {' / '}
          <Link to={`/companies/${slug}`}>{company?.name}</Link>
          {' / '}
          <Link to={`/companies/${slug}/forum`}>Forum</Link>
          {' / '}Thread
        </div>

        {/* Post */}
        <div className="post-full">
          {post.status === 'pending' && (
            <div className="post-pending-badge">⏳ This post is pending moderation</div>
          )}
          <h1 className="post-full-title">{post.title}</h1>
          <div className="post-full-meta">
            <span>Anonymous</span>
            <span>{date}</span>
          </div>
          <p className="post-full-body">{post.body}</p>
          <div className="post-full-actions">
            <button className="flag-btn" onClick={() => openFlag('forum_post', post.id)}>
              ⚑ Flag as inaccurate
            </button>
            {flagTarget?.id === post.id && (
              <div className="flag-form" style={{ marginTop: '0.75rem' }}>
                {flagSent ? (
                  <p className="flag-success">Flagged — a moderator will review this.</p>
                ) : (
                  <>
                    <input
                      className="field-input"
                      placeholder="Why are you flagging this? (e.g. false claim, spam)"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      maxLength={200}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-primary" onClick={submitFlag} disabled={flagReason.trim().length < 5}>Submit</button>
                      <button className="btn btn-ghost" onClick={() => setFlagTarget(null)}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="comments-section">
          <h2 className="comments-title">
            {comments.filter(c => c.status === 'approved' || c.user_id === user?.id).length} Replies
          </h2>

          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.id} className={`comment-card ${c.status === 'pending' ? 'pending' : ''}`}>
                {c.status === 'pending' && (
                  <div className="comment-pending-badge">
                    ⏳ {c.user_id === user?.id ? 'Your reply is pending moderation' : 'Pending'}
                  </div>
                )}
                <p className="comment-body">{c.body}</p>
                <div className="comment-meta">
                  <span>Anonymous</span>
                  <span>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {c.status === 'approved' && (
                    <button className="flag-btn" onClick={() => openFlag('forum_comment', c.id)}>
                      ⚑ Flag
                    </button>
                  )}
                </div>
                {flagTarget?.id === c.id && (
                  <div className="flag-form" style={{ marginTop: '0.5rem' }}>
                    {flagSent ? (
                      <p className="flag-success">Flagged — a moderator will review this.</p>
                    ) : (
                      <>
                        <input
                          className="field-input"
                          placeholder="Reason for flagging"
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          maxLength={200}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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

          {/* Comment form */}
          <div className="comment-form-card">
            <h3 className="comment-form-title">Add a Reply</h3>
            <div className="moderation-notice">
              ℹ️ Replies are reviewed before appearing. Keep it factual and respectful.
            </div>
            {user ? (
              <form onSubmit={handleComment}>
                <textarea
                  className="field-textarea"
                  placeholder="Share your thoughts or answer the question…"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  rows={4}
                  maxLength={5000}
                />
                {error && <p className="form-error">{error}</p>}
                <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Posting…' : 'Post Reply'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="login-prompt">
                <Link to={`/auth?redirect=/companies/${slug}/forum/${postId}`} className="login-link">
                  Log in
                </Link>{' '}to join the discussion.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
