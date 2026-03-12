import './SkeletonCard.css'

export default function SkeletonCard({ type = 'company' }) {
  if (type === 'politician') {
    return (
      <div className="skeleton-card politician-card">
        <div className="skeleton-avatar skeleton-pulse" />
        <div className="skeleton-info">
          <div className="skeleton-bar skeleton-pulse" style={{ width: '60%', height: 14 }} />
          <div className="skeleton-bar skeleton-pulse" style={{ width: '40%', height: 10, marginTop: 6 }} />
          <div className="skeleton-bar skeleton-pulse" style={{ width: '50%', height: 10, marginTop: 6 }} />
        </div>
        <div className="skeleton-score">
          <div className="skeleton-bar skeleton-pulse" style={{ width: 32, height: 24 }} />
          <div className="skeleton-bar skeleton-pulse" style={{ width: 44, height: 8, marginTop: 4 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="skeleton-card company-card">
      <div className="skeleton-logo skeleton-pulse" />
      <div className="skeleton-info">
        <div className="skeleton-bar skeleton-pulse" style={{ width: '65%', height: 14 }} />
        <div className="skeleton-bar skeleton-pulse" style={{ width: '35%', height: 10, marginTop: 6 }} />
        <div className="skeleton-bar skeleton-pulse" style={{ width: '45%', height: 10, marginTop: 6 }} />
      </div>
      <div className="skeleton-arrow skeleton-pulse" />
    </div>
  )
}
