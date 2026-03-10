import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { supabase } from '../lib/supabase'
import './PricingPage.css'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Everything you need to be an informed consumer.',
    cta: 'Get Started',
    ctaLink: '/auth?mode=signup',
    highlight: false,
    features: [
      'Browse all company scorecards',
      'Read community reports & evidence',
      'Basic government data lookups',
      'Access company forums',
      'Submit up to 2 reports per month',
      'Political connection explorer',
    ],
  },
  {
    name: 'Pro',
    price: '$8',
    period: '/mo',
    annual: '$60/yr — save 37%',
    desc: 'For power users who want deeper accountability tools.',
    cta: 'Join Waitlist',
    ctaAction: 'waitlist',
    highlight: true,
    badge: 'Coming Soon',
    features: [
      'Everything in Free',
      'Unlimited reports & reviews',
      'Company watchlist with email alerts',
      'Downloadable PDF scorecards',
      'Advanced federal data filters',
      'Ad-free experience',
      'Verified Contributor badge',
      'Early access to new features',
    ],
  },
  {
    name: 'Organizations',
    price: '$49',
    period: '/mo',
    desc: 'For journalists, investors, NGOs, and legal teams.',
    cta: 'Contact Us',
    ctaAction: 'contact',
    highlight: false,
    badge: 'Coming Soon',
    features: [
      'Everything in Pro',
      'Bulk data exports (CSV/JSON)',
      'API access for integrations',
      'Embeddable company widgets',
      'Portfolio screening tools',
      'Campaign-ready reports',
      'Political connection exports',
      'Priority support',
    ],
  },
]

const FAQ = [
  { q: 'When do paid plans launch?', a: 'We\'re building the Pro and Organizations tiers now. Join the waitlist to get early access and a founding member discount.' },
  { q: 'Will the free tier stay free?', a: 'Yes. Browsing company scorecards, reading reports, and accessing government data will always be free. We believe corporate accountability data should be accessible to everyone.' },
  { q: 'What counts as a "report"?', a: 'A report is an evidence-based review you submit about a company, rating them across our four dimensions: environmental impact, ethical business, consumer trust, and corporate scandals.' },
  { q: 'Who is the Organizations plan for?', a: 'Investigative journalists, ESG/impact investors, advocacy NGOs, law firms doing corporate research, and HR teams evaluating employer ethics.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no commitments. Cancel your subscription at any time and keep access through the end of your billing period.' },
]

export default function PricingPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistPlan, setWaitlistPlan] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const handleWaitlist = async (plan) => {
    setWaitlistPlan(plan)
    setWaitlistStatus('')
  }

  const submitWaitlist = async (e) => {
    e.preventDefault()
    if (!waitlistEmail.trim()) return
    setWaitlistStatus('sending')
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: waitlistEmail.trim().toLowerCase(), source: `pricing_${waitlistPlan.toLowerCase()}` }, { onConflict: 'email' })
    if (error) {
      setWaitlistStatus('error')
    } else {
      setWaitlistStatus('success')
      setWaitlistEmail('')
    }
  }

  return (
    <div className="pricing-page">
      <NavBar />

      <section className="pricing-hero">
        <div className="pricing-hero-inner">
          <span className="hero-eyebrow">Pricing</span>
          <h1 className="pricing-headline">
            Corporate accountability<br />shouldn't cost a fortune.
          </h1>
          <p className="pricing-sub">
            Free for consumers. Powerful tools for professionals who need deeper access.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`pricing-card${plan.highlight ? ' pricing-card-highlight' : ''}`}>
                {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
                <div className="pricing-card-header">
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-price-val">{plan.price}</span>
                    <span className="pricing-price-period">{plan.period}</span>
                  </div>
                  {plan.annual && <div className="pricing-annual">{plan.annual}</div>}
                  <p className="pricing-desc">{plan.desc}</p>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f} className="pricing-feature">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="pricing-card-footer">
                  {plan.ctaLink ? (
                    <Link to={plan.ctaLink} className={`btn btn-lg pricing-cta${plan.highlight ? ' btn-primary' : ' btn-outline'}`}>
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      className={`btn btn-lg pricing-cta${plan.highlight ? ' btn-primary' : ' btn-outline'}`}
                      onClick={() => handleWaitlist(plan.name)}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist modal */}
      {waitlistPlan && waitlistStatus !== 'success' && (
        <div className="waitlist-overlay" onClick={() => setWaitlistPlan('')}>
          <div className="waitlist-modal" onClick={(e) => e.stopPropagation()}>
            <button className="waitlist-close" onClick={() => setWaitlistPlan('')}>&times;</button>
            <h3 className="waitlist-title">Join the {waitlistPlan} waitlist</h3>
            <p className="waitlist-desc">
              Be first to know when {waitlistPlan} launches. Early members get a founding discount.
            </p>
            <form className="waitlist-form" onSubmit={submitWaitlist}>
              <input
                type="email"
                className="waitlist-input"
                placeholder="your@email.com"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg" disabled={waitlistStatus === 'sending'}>
                {waitlistStatus === 'sending' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
            {waitlistStatus === 'error' && (
              <p className="waitlist-error">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      )}

      {/* Waitlist success toast */}
      {waitlistStatus === 'success' && (
        <div className="waitlist-overlay" onClick={() => { setWaitlistPlan(''); setWaitlistStatus(''); }}>
          <div className="waitlist-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="waitlist-title">You're on the list.</h3>
            <p className="waitlist-desc">
              We'll email you when {waitlistPlan} is ready. Thanks for supporting corporate accountability.
            </p>
            <button className="btn btn-outline btn-lg" onClick={() => { setWaitlistPlan(''); setWaitlistStatus(''); }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' faq-open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Start investigating today.</h2>
          <p className="cta-sub">
            Free access to government-backed corporate accountability data. No credit card required.
          </p>
          <div className="hero-actions">
            <Link to="/companies" className="btn btn-primary btn-lg">Browse Companies</Link>
            <Link to="/auth?mode=signup" className="btn btn-outline btn-lg">Create Free Account</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-logo">CorpWatch</span>
          <p className="footer-copy">&copy; {new Date().getFullYear()} CorpWatch. Holding corporations accountable.</p>
        </div>
      </footer>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pricing-check">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
