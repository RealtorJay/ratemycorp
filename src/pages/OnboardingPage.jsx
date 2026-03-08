import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import CompanyLogo from '../components/CompanyLogo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './OnboardingPage.css'

const ISSUES = [
  { key: 'environment', icon: '🌍', title: 'Environmental Impact', desc: 'EPA violations, carbon emissions, toxic waste, greenwashing' },
  { key: 'ethics', icon: '⚖️', title: 'Ethical Business', desc: 'Labor exploitation, wage theft, supply chain abuses' },
  { key: 'consumer_trust', icon: '🛡️', title: 'Consumer Trust', desc: 'Data privacy, product safety, deceptive pricing' },
  { key: 'scandals', icon: '📰', title: 'Corporate Scandals', desc: 'DOJ cases, SEC enforcement, FBI probes, cover-ups' },
  { key: 'political_connections', icon: '🏛️', title: 'Political Connections', desc: 'Lobbying, campaign donations, revolving door' },
]

const VALUES = [
  { key: 'environment_accountability', label: 'Corporate environmental accountability', desc: 'Companies should be held to strict environmental standards' },
  { key: 'free_markets', label: 'Lower consumer prices & free markets', desc: 'Less regulation means more competition and better prices' },
  { key: 'worker_rights', label: 'Worker rights & fair wages', desc: 'Companies should prioritize employee wellbeing and fair pay' },
  { key: 'small_government', label: 'Government staying out of business', desc: 'Businesses operate best with minimal government interference' },
  { key: 'data_privacy', label: 'Data privacy & consumer protection', desc: 'Your personal data and consumer rights should be protected' },
  { key: 'job_creation', label: 'Job creation & economic growth', desc: 'Policies should prioritize growing the economy and creating jobs' },
  { key: 'money_out_of_politics', label: 'Corporate money out of politics', desc: 'Politicians shouldn\'t be funded by the companies they regulate' },
  { key: 'national_security', label: 'National security & domestic industry', desc: 'Strengthen American industry and protect critical supply chains' },
]

export default function OnboardingPage() {
  const { user, updatePreferences, followCompany, refreshPreferences } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: Industries
  const [industries, setIndustries] = useState([])
  const [selectedIndustries, setSelectedIndustries] = useState([])

  // Step 2: Issues
  const [selectedIssues, setSelectedIssues] = useState([])

  // Step 3: Companies to follow
  const [companyQuery, setCompanyQuery] = useState('')
  const [companyResults, setCompanyResults] = useState([])
  const [popularCompanies, setPopularCompanies] = useState([])
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Step 4: Values
  const [selectedValues, setSelectedValues] = useState([])

  // Load industries
  useEffect(() => {
    supabase
      .from('companies')
      .select('industry')
      .then(({ data }) => {
        const unique = [...new Set((data || []).map((c) => c.industry).filter(Boolean))].sort()
        setIndustries(unique)
      })
  }, [])

  // Load popular companies
  useEffect(() => {
    supabase
      .from('companies')
      .select('id, name, slug, industry, avg_overall, review_count, website')
      .order('review_count', { ascending: false })
      .limit(8)
      .then(({ data }) => setPopularCompanies(data || []))
  }, [])

  // Search companies (debounced)
  useEffect(() => {
    if (!companyQuery.trim()) {
      setCompanyResults([])
      return
    }
    setSearchLoading(true)
    const timeout = setTimeout(() => {
      supabase
        .from('companies')
        .select('id, name, slug, industry, avg_overall, review_count, website')
        .ilike('name', `%${companyQuery}%`)
        .order('review_count', { ascending: false })
        .limit(12)
        .then(({ data }) => {
          setCompanyResults(data || [])
          setSearchLoading(false)
        })
    }, 300)
    return () => clearTimeout(timeout)
  }, [companyQuery])

  const toggleIndustry = (ind) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    )
  }

  const toggleIssue = (key) => {
    setSelectedIssues((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    )
  }

  const toggleCompany = (id) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleValue = (key) => {
    setSelectedValues((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    )
  }

  const handleFinish = async () => {
    setSaving(true)
    await updatePreferences({
      industries: selectedIndustries,
      issues: selectedIssues,
      user_values: selectedValues,
      onboarding_done: true,
    })
    for (const companyId of selectedCompanyIds) {
      await followCompany(companyId)
    }
    await refreshPreferences()
    setSaving(false)
    navigate('/dashboard')
  }

  const handleSkip = async () => {
    setSaving(true)
    await updatePreferences({ onboarding_done: true })
    await refreshPreferences()
    setSaving(false)
    navigate('/dashboard')
  }

  const canProceed = () => {
    if (step === 1) return true // industries are optional
    if (step === 2) return true
    if (step === 3) return true
    if (step === 4) return true
    return true
  }

  const displayCompanies = companyQuery.trim() ? companyResults : popularCompanies

  return (
    <div className="onboarding">
      <NavBar />
      <div className="onboarding-inner">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Personalize Your Experience</h1>
          <p className="onboarding-sub">Help us show you what matters most. You can always change these later.</p>
        </div>

        {/* Progress bar */}
        <div className="onboarding-progress">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`progress-step ${s <= step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
              <div className="progress-dot">{s < step ? '✓' : s}</div>
              <span className="progress-label">
                {s === 1 ? 'Industries' : s === 2 ? 'Issues' : s === 3 ? 'Companies' : 'Values'}
              </span>
            </div>
          ))}
          <div className="progress-line">
            <div className="progress-fill" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
        </div>

        {/* Step 1: Industries */}
        {step === 1 && (
          <div className="onboarding-step fade-in">
            <h2 className="step-title">What industries matter to you?</h2>
            <p className="step-desc">Select the sectors you want to keep tabs on. We'll prioritize these in your feed.</p>
            <div className="chip-grid">
              {industries.map((ind) => (
                <button
                  key={ind}
                  className={`chip ${selectedIndustries.includes(ind) ? 'selected' : ''}`}
                  onClick={() => toggleIndustry(ind)}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Issues */}
        {step === 2 && (
          <div className="onboarding-step fade-in">
            <h2 className="step-title">What issues do you care about?</h2>
            <p className="step-desc">We'll highlight these when showing you company ratings and connections.</p>
            <div className="issue-grid">
              {ISSUES.map((issue) => (
                <button
                  key={issue.key}
                  className={`issue-card ${selectedIssues.includes(issue.key) ? 'selected' : ''}`}
                  onClick={() => toggleIssue(issue.key)}
                >
                  <span className="issue-icon">{issue.icon}</span>
                  <span className="issue-title">{issue.title}</span>
                  <span className="issue-desc">{issue.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Companies */}
        {step === 3 && (
          <div className="onboarding-step fade-in">
            <h2 className="step-title">Companies to follow</h2>
            <p className="step-desc">Follow companies to track their ratings, reviews, and political connections.</p>
            <div className="company-search-wrap">
              <input
                type="text"
                className="company-search-input"
                placeholder="Search companies..."
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
              />
            </div>
            {!companyQuery.trim() && <p className="popular-label">Popular companies</p>}
            {searchLoading && <p className="search-status">Searching...</p>}
            <div className="company-select-grid">
              {displayCompanies.map((c) => (
                <button
                  key={c.id}
                  className={`company-select-card ${selectedCompanyIds.includes(c.id) ? 'selected' : ''}`}
                  onClick={() => toggleCompany(c.id)}
                >
                  <CompanyLogo company={c} size={36} />
                  <div className="company-select-info">
                    <span className="company-select-name">{c.name}</span>
                    <span className="company-select-industry">{c.industry}</span>
                  </div>
                  <span className="company-select-check">
                    {selectedCompanyIds.includes(c.id) ? '✓' : '+'}
                  </span>
                </button>
              ))}
              {companyQuery.trim() && companyResults.length === 0 && !searchLoading && (
                <p className="search-status">No companies found</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Values */}
        {step === 4 && (
          <div className="onboarding-step fade-in">
            <h2 className="step-title">What matters most to you?</h2>
            <p className="step-desc">Pick the values that drive your decisions. We'll use these to surface the most relevant information.</p>
            <div className="values-grid">
              {VALUES.map((val) => (
                <button
                  key={val.key}
                  className={`value-card ${selectedValues.includes(val.key) ? 'selected' : ''}`}
                  onClick={() => toggleValue(val.key)}
                >
                  <span className="value-label">{val.label}</span>
                  <span className="value-desc">{val.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="onboarding-nav">
          <button className="btn btn-ghost" onClick={handleSkip} disabled={saving}>
            Skip for now
          </button>
          <div className="onboarding-nav-right">
            {step > 1 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Get Started'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
