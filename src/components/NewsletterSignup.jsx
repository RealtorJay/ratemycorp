import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './NewsletterSignup.css'

export default function NewsletterSignup({ source = 'unknown' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('') // '', sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.trim().toLowerCase(), source }, { onConflict: 'email' })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setEmail('')
    }
  }

  if (status === 'success') {
    return (
      <div className="newsletter-success">
        You're in. Watch your inbox.
      </div>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-input-wrap">
        <input
          type="email"
          className="newsletter-input"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-label="Email for newsletter"
        />
        <button type="submit" className="btn btn-primary newsletter-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <p className="newsletter-error">Something went wrong. Please try again.</p>
      )}
      <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
    </form>
  )
}
