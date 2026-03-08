import { useState } from 'react'
import './StarPicker.css'

export default function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="star-picker" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`sp-star ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
