import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function FollowButton({ companyId, className = '' }) {
  const { user, followedCompanies, followCompany, unfollowCompany } = useAuth()
  const [busy, setBusy] = useState(false)

  if (!user) return null

  const isFollowing = followedCompanies.includes(companyId)

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setBusy(true)
    if (isFollowing) {
      await unfollowCompany(companyId)
    } else {
      await followCompany(companyId)
    }
    setBusy(false)
  }

  return (
    <button
      className={`btn ${isFollowing ? 'btn-primary' : 'btn-outline'} ${className}`}
      onClick={handleClick}
      disabled={busy}
      style={{ minWidth: 110, fontSize: '0.85rem' }}
    >
      {busy ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  )
}
