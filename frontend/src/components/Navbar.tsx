import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <header className="nav">
      <Link to="/" className="brand" aria-label="Nirikshan Home">
        <div className="brand-emblem">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
            <circle cx="12" cy="12" r="3" fill="#1d4ed8" fillOpacity="0.2" />
          </svg>
        </div>
        <div className="brand-text">
          <div className="brand-title">
            <span className="hindi-mark">निरीक्षण</span>
            <span>NIRIKSHAN</span>
          </div>
          <span className="brand-subtitle">MoSPI IPMD · SIH 2026</span>
        </div>
      </Link>

      <nav aria-label="Main Navigation">
        <ul className="nav-links">
          <li><a href="#problem">Challenge</a></li>
          <li><a href="#solution">Solution</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#metrics">Impact</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#api">API Docs</a></li>
          <li><a href="#sih2026">SIH 2026</a></li>
        </ul>
      </nav>

      <div className="nav-actions">
        <Link to="/login" className="btn-secondary">
          Sign In
        </Link>
        <Link to="/signup" className="btn-primary">
          Launch Console
        </Link>
      </div>
    </header>
  )
}
