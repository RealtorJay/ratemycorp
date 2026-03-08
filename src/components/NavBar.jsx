import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './NavBar.css'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/companies?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">CorpWatch</Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            className="nav-search-input"
            placeholder="Search companies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search companies"
          />
          <button type="submit" className="nav-search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="nav-links">
          <Link to="/companies" className="nav-link">Companies</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <button className="btn btn-ghost" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost">Log in</Link>
              <Link to="/auth?mode=signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
