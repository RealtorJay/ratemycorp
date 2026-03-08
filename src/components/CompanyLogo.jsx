import { useState } from 'react'
import { getLogoUrl } from '../lib/logo'
import './CompanyLogo.css'

// Brand color map: name keyword → [bg, text]
const BRAND_COLORS = {
  'amazon':          ['#FF9900', '#000'],
  'apple':           ['#555555', '#fff'],
  'meta':            ['#0866FF', '#fff'],
  'alphabet':        ['#4285F4', '#fff'],
  'microsoft':       ['#00A4EF', '#fff'],
  'walmart':         ['#0071CE', '#fff'],
  'exxon':           ['#E50034', '#fff'],
  'chevron':         ['#E31837', '#fff'],
  'shell':           ['#FBCE07', '#c00'],
  ' bp':             ['#009B3A', '#fff'],
  'jpmorgan':        ['#003087', '#fff'],
  'bank of america': ['#E31837', '#fff'],
  'wells fargo':     ['#D71E28', '#fff'],
  'goldman':         ['#6600CC', '#fff'],
  'citigroup':       ['#003B70', '#fff'],
  'morgan stanley':  ['#002D72', '#fff'],
  'tesla':           ['#CC0000', '#fff'],
  'ford':            ['#003578', '#fff'],
  'general motors':  ['#0170CE', '#fff'],
  'boeing':          ['#1D4F91', '#fff'],
  'lockheed':        ['#0050A0', '#fff'],
  'nike':            ['#111111', '#fff'],
  'disney':          ['#113CCF', '#fff'],
  'pfizer':          ['#0093C8', '#fff'],
  'johnson':         ['#CC0000', '#fff'],
  'mckesson':        ['#E4002B', '#fff'],
  'procter':         ['#003087', '#fff'],
  'coca-cola':       ['#F40009', '#fff'],
  'starbucks':       ['#00704A', '#fff'],
  'mcdonald':        ['#DA291C', '#fff'],
  'home depot':      ['#F96302', '#000'],
  'cvs':             ['#CC0000', '#fff'],
  'target':          ['#CC0000', '#fff'],
  'costco':          ['#005DAA', '#fff'],
  'tyson':           ['#CC0000', '#fff'],
  'nestl':           ['#D12B2B', '#fff'],
  'bayer':           ['#10384F', '#fff'],
  'philip morris':   ['#EE2526', '#fff'],
  'at&t':            ['#00A8E0', '#fff'],
  'verizon':         ['#CD040B', '#fff'],
  'comcast':         ['#000099', '#fff'],
  'visa':            ['#1A1F71', '#fff'],
  'mastercard':      ['#EB001B', '#fff'],
  'paypal':          ['#003087', '#fff'],
  'uber':            ['#000000', '#fff'],
  '3m':              ['#E31837', '#fff'],
  'dupont':          ['#E31837', '#fff'],
  'dow ':            ['#CC0000', '#fff'],
  'caterpillar':     ['#FFCD11', '#000'],
  'berkshire':       ['#003087', '#fff'],
  'unitedhealth':    ['#005EB8', '#fff'],
  'cigna':           ['#007B5F', '#fff'],
  'elevance':        ['#003087', '#fff'],
}

function getBrandColor(name) {
  if (!name) return null
  const lower = name.toLowerCase()
  for (const [key, colors] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(key.trim())) return colors
  }
  return null
}

export default function CompanyLogo({ name, website, size = 44 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const logoUrl = getLogoUrl(website, size)
  const brand = getBrandColor(name)

  // Show brand-colored fallback as background, render favicon on top if available
  const bg = brand ? brand[0] : '#1a1a1a'
  const color = brand ? brand[1] : '#fff'

  if (logoUrl && !imgFailed) {
    return (
      <div
        className="company-logo-wrap"
        style={{ width: size, height: size, background: bg }}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="company-logo-img"
          style={{ width: size * 0.65, height: size * 0.65 }}
          onError={() => setImgFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className="company-logo-fallback"
      style={{ width: size, height: size, fontSize: size * 0.42, background: bg, color }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  )
}
