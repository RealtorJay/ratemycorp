import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canSubmit } from '../lib/rateLimit'
import './ForumPage.css'

export default function ForumPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [slug])

  const loadData = async () => {
    setLoading(true)
    const { data: co } = await supabase.from('companies').select('id, name, slug').eq('slug', slug).single()
    if (!co) { setLoading(false); return }
    setCompany(co)

    const { data } = await supabase
      .from('forum_posts')
      .select('id, title, body, status, flag_count, created_at, user_id')
      .eq('company_id', co.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setPosts(data || [])
    setLoading(false)
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()
    if (!user) { navigate(`/auth?redirect=/companies/${slug}/forum`); return }
    if (title.trim().length < 5) { setError('Title must be at least 5 characters.'); return }
    if (body.trim().length < 20) { setError('Post body must be at least 20 characters.'); return }
    if (!canSubmit('forum-post-' + slug)) { setError('Please wait before submitting again.'); return }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('forum_posts').insert({
      company_id: company.id,
      user_id: user.id,
      title: title.trim(),
      body: body.trim(),
      status: 'pending',
    })

    if (dbError) { setError(dbError.message); setSubmitting(false); return }

    setTitle('')
    setBody('')
    setShowForm(false)
    setSubmitting(false)
    // Show pending notice
    setPosts((prev) => [{
      id: Date.now(),
      title: title.trim(),
      body: body.trim(),
      status: 'pending',
      flag_count: 0,
      created_at: new Date().toISOString(),
      user_id: user.id,
      _justPosted: true,
    }, ...prev])
  }

  return (
    <div className="forum-page">
      <NavBar />
      <div className="forum-inner">
        <div className="forum-breadcrumb">
          <Link to="/companies">Companies</Link>
          {' / '}
          {company && <Link to={`/companies/${slug}`}>{company.name}</Link>}
          {' / '}Forum
        </div>

        <div className="forum-header">
          <div>
            <h1 className="forum-title">{company?.name} — Discussion Forum</h1>
            <p className="forum-sub">
              Ask questions, share news, and discuss {company?.name}.{' '}
              <strong>All posts are reviewed before appearing publicly.</strong>
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => user ? setShowForm(true) : navigate(`/auth?redirect=/companies/${slug}/forum`)}
          >
            + New Post
          </button>
        </div>

        {/* New post form */}
        {showForm && (
          <div className="post-form-card">
            <h2 className="post-form-title">New Discussion Post</h2>
            <div className="moderation-notice">
              ℹ️ Posts are reviewed by moderators before going live. Misleading or false claims will be rejected.
            </div>
            <form onSubmit={handleSubmitPost}>
              <label className="field-label">
                Title <span className="field-hint">(5–120 characters)</span>
                <input
                  className="field-input"
                  placeholder="What's your question or topic?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </label>
              <label className="field-label" style={{ marginTop: '1rem' }}>
                Post <span className="field-hint">(20–10,000 characters)</span>
                <textarea
                  className="field-textarea"
                  placeholder="Share details, context, or your experience…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  maxLength={10000}
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Post'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setError('') }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="forum-loading">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="forum-empty">
            <p>No posts yet. Start the discussion!</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} slug={slug} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ForumPostCard({ post, slug, user }) {
  const isPending = post.status === 'pending'
  const isOwn = user?.id === post.user_id

  return (
    <div className={`post-card ${isPending ? 'pending' : ''}`}>
      {isPending && (
        <div className="post-pending-badge">
          ⏳ {isOwn ? 'Your post is pending moderation' : 'Pending review'}
        </div>
      )}
      {post.flag_count > 0 && (
        <div className="post-flagged-badge">⚠ Flagged {post.flag_count}×</div>
      )}
      <Link to={`/companies/${slug}/forum/${post.id}`} className="post-title-link">
        {post.title}
      </Link>
      <p className="post-body-preview">
        {post.body.length > 180 ? post.body.slice(0, 180) + '…' : post.body}
      </p>
      <div className="post-meta">
        <span>Anonymous</span>
        <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        <Link to={`/companies/${slug}/forum/${post.id}`} className="post-reply-link">
          View &amp; Reply →
        </Link>
      </div>
    </div>
  )
}
