import './Stars.css'

export default function Stars({ rating, size = 'md', showNumber = true }) {
  return (
    <div className={`stars ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      {showNumber && <span className="rating-num">{Number(rating).toFixed(1)}</span>}
    </div>
  )
}
