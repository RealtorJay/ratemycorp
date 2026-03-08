import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, skipOnboardingCheck }) {
  const { user, loading, onboardingDone, preferences } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7070a0', fontSize: '0.9rem' }}>Loading…</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  // Redirect to onboarding if not completed (unless we're already on /onboarding)
  if (!skipOnboardingCheck && preferences && !onboardingDone && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
