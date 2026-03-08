import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7070a0', fontSize: '0.9rem' }}>Loading…</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}
