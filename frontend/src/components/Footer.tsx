import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="footer-main">
      <div className="footer-top-grid">
        {/* Brand Col */}
        <div className="footer-brand-col">
          <Link to="/" className="brand" style={{ marginBottom: '0.85rem' }}>
            <div className="brand-emblem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
          <p>
            AI-powered early warning and predictive risk analytics platform for India's mega infrastructure
            portfolio. Built for Smart India Hackathon 2026.
          </p>
          <p style={{ fontStyle: 'italic', color: '#1d4ed8', fontWeight: 500, marginTop: '0.75rem' }}>
            &ldquo;Monitoring Infrastructure. Predicting Futures. Saving Resources.&rdquo;
          </p>
        </div>

        {/* Col 1: Platform */}
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="#problem">The Challenge</a></li>
            <li><a href="#solution">Predictive Solution</a></li>
            <li><a href="#features">Key Features</a></li>
            <li><a href="#dashboard">Interactive Console</a></li>
            <li><a href="#metrics">Impact Metrics</a></li>
          </ul>
        </div>

        {/* Col 2: Resources */}
        <div className="footer-col">
          <h4>Resources & Code</h4>
          <ul>
            <li><a href="#api">API Documentation</a></li>
            <li><a href="#security">Security & Compliance</a></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub Repository</a></li>
            <li><a href="https://hub.docker.com" target="_blank" rel="noreferrer">Docker Hub Container</a></li>
            <li><a href="#sih2026">SIH 2026 Dossier</a></li>
          </ul>
        </div>

        {/* Col 3: Governance */}
        <div className="footer-col">
          <h4>Governance</h4>
          <ul>
            <li><a href="https://mospi.gov.in" target="_blank" rel="noreferrer">MoSPI IPMD Portal</a></li>
            <li><a href="https://www.sih.gov.in" target="_blank" rel="noreferrer">Smart India Hackathon</a></li>
            <li><Link to="/login">Officer Login</Link></li>
            <li><Link to="/signup">Agency Registration</Link></li>
            <li><a href="#top">Privacy & Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div>
          © 2026 <strong>निरीक्षण Nirikshan Platform</strong>. Built with pride for Smart India Hackathon 2026.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>NIC / MoSPI Guidelines Compliant</span>
          <span>Security Hardened</span>
          <span>TLS 1.3 Certified</span>
        </div>
      </div>
    </footer>
  )
}
