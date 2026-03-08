import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const rawRedirect = searchParams.get('redirect') || '/dashboard'
  const redirect = (rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : '/dashboard'

  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (mode === 'signup' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain an uppercase letter, a lowercase letter, and a number.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
      } else {
        const { error } = await signUpWithEmail(email, password)
        if (error) throw error
        setMessage('Check your email to confirm your account.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError('')
    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">CorpWatch</Link>
        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to access your reviews and ratings.'
            : 'Join thousands of employees speaking honestly.'}
        </p>

        {/* Google OAuth */}
        <button className="btn-google" onClick={handleGoogle} disabled={loading} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">
            Email
            <input
              type="email"
              className="field-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="field-label">
            Password
            <input
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {mode === 'signup' && (
            <label className="field-label">
              Confirm Password
              <input
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="link-btn" onClick={toggleMode}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
