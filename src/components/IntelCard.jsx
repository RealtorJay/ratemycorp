import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SocialEmbed from './SocialEmbed'
import IntelCommentThread from './IntelCommentThread'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { canSubmit } from '../lib/rateLimit'
import './IntelCard.css'

const SOCIAL_TYPES = ['tweet', 'instagram', 'tiktok', 'youtube', 'linkedin', 'reddit']

const SUBJECT_LABELS = {
  company: 'Company',
  ceo: 'CEO',
  public_discourse: 'Public',
}

const CATEGORY_COLORS = {
  environmental: '#22c55e',
  labor: '#f97316',
  consumer: '#3b82f6',
  legal: '#ef4444',
  financial: '#eab308',
  regulatory: '#a855f7',
  scandal: '#ef4444',
  positive: '#22c55e',
  neutral: '#888',
  other: '#888',
}

export default function IntelCard({ item }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [flagOpen, setFlagOpen] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [flagSent, setFlagSent] = useState(false)

  const isSocial = SOCIAL_TYPES.includes(item.item_type)
  const date = item.published_at
    ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const openFlag = () => {
    if (!user) { navigate('/auth'); return }
    if (!canSubmit('flag-intel-' + item.id, 30000)) return
    setFlagOpen(true)
    setFlagReason('')
    setFlagSent(false)
  }

  const submitFlag = async () => {
    if (flagReason.trim().length < 5) return
    const { error } = await supabase.from('flags').insert({
      reporter_id: user.id,
      target_type: 'intel_item',
      target_id: item.id,
      reason: flagReason.trim(),
    })
    if (!error) setFlagSent(true)
    setTimeout(() => { setFlagOpen(false); setFlagSent(false) }, 2000)
  }

  return (
    <div className={`intel-card ${item.is_pinned ? 'pinned' : ''}`}>
      {item.is_pinned && <div className="intel-card-pin">Pinned</div>}

      {/* Badges row */}
      <div className="intel-card-badges">
        <span className="intel-badge intel-badge-subject">{SUBJECT_LABELS[item.subject_type] || 'Company'}</span>
        <span className="intel-badge intel-badge-type">{item.item_type.replace('_', ' ')}</span>
        {item.category && (
          <span className="intel-badge" style={{ color: CATEGORY_COLORS[item.category] || '#888', borderColor: CATEGORY_COLORS[item.category] || '#888' }}>
            {item.category}
          </span>
        )}
        {item.source_name && <span className="intel-badge-source">{item.source_name}</span>}
        <span className="intel-card-date">{date}</span>
      </div>

      {/* Content */}
      {isSocial ? (
        <div className="intel-card-embed">
          <SocialEmbed embedUrl={item.embed_url} itemType={item.item_type} />
        </div>
      ) : (
        <div className="intel-card-article">
          {item.title && <h3 className="intel-card-title">{item.title}</h3>}
          {item.body && <p className="intel-card-body">{item.body}</p>}
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noreferrer" className="intel-card-source-link">
              Read full article ↗
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="intel-card-actions">
        <IntelCommentThread itemId={item.id} commentCount={item.comment_count} />
        <button className="intel-flag-btn" onClick={openFlag}>Flag</button>
      </div>

      {flagOpen && (
        <div className="intel-flag-form">
          {flagSent ? (
            <p className="intel-flag-success">Flagged for review.</p>
          ) : (
            <>
              <input
                className="intel-flag-input"
                placeholder="Why are you flagging this? (e.g. false info, spam)"
                value={flagReason}
                onChange={e => setFlagReason(e.target.value)}
                maxLength={200}
              />
              <div className="intel-flag-actions">
                <button className="btn btn-primary" onClick={submitFlag} disabled={flagReason.trim().length < 5}>Submit</button>
                <button className="btn btn-ghost" onClick={() => setFlagOpen(false)}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
