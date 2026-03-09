import { useState } from 'react'

// Dynamically import embed components to avoid loading all at once
import { XEmbed, InstagramEmbed, TikTokEmbed, YouTubeEmbed, LinkedInEmbed } from 'react-social-media-embed'

const EMBED_MAP = {
  tweet: XEmbed,
  instagram: InstagramEmbed,
  tiktok: TikTokEmbed,
  youtube: YouTubeEmbed,
  linkedin: LinkedInEmbed,
}

const PLATFORM_LABELS = {
  tweet: 'X (Twitter)',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

export default function SocialEmbed({ embedUrl, itemType }) {
  const [failed, setFailed] = useState(false)
  const EmbedComponent = EMBED_MAP[itemType]

  if (!embedUrl || !EmbedComponent || failed) {
    return (
      <a
        href={embedUrl}
        target="_blank"
        rel="noreferrer"
        className="social-embed-fallback"
      >
        <span className="social-embed-fallback-icon">↗</span>
        <span>View on {PLATFORM_LABELS[itemType] || 'source'}</span>
      </a>
    )
  }

  return (
    <div className="social-embed-wrap">
      <EmbedComponent
        url={embedUrl}
        width="100%"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
