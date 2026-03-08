import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0f0f13', color: '#f87171', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'monospace', gap: '1rem' }}>
          <h2 style={{ color: '#f0f0fa', fontFamily: 'system-ui' }}>Something went wrong</h2>
          <pre style={{ background: '#17171f', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', maxWidth: '600px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => window.location.reload()} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontFamily: 'system-ui', fontWeight: 600 }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
