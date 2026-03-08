import './RatingBar.css'

export default function RatingBar({ label, value }) {
  const pct = ((Number(value) || 0) / 5) * 100
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar-value">{Number(value).toFixed(1)}</span>
    </div>
  )
}
