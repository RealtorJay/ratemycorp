import { useState } from 'react'
import { getLogoUrl } from '../lib/logo'
import './CompanyLogo.css'

export default function CompanyLogo({ name, website, size = 44 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const logoUrl = getLogoUrl(website, size * 2)

  if (logoUrl && !imgFailed) {
    return (
      <div className="company-logo-wrap" style={{ width: size, height: size }}>
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="company-logo-img"
          style={{ width: size, height: size }}
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className="company-logo-fallback" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  )
}
