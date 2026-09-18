import { Link } from 'react-router-dom'

export function CTA() {
  return (
    <section className="section" id="cta">
      <div className="cta-banner">
        <div className="sih-badge" style={{ marginBottom: '1.25rem' }}>
          <span className="dot" />
          <span>Next-Generation National Infrastructure Intelligence</span>
        </div>

        <h2>Ready to Transform Infrastructure Monitoring?</h2>

        <p>
          Join the future of proactive project management. Protect taxpayer investments, eliminate
          compounding slippages, and accelerate national development.
        </p>

        <div className="cta-buttons-row">
          <Link to="/signup" className="btn-primary btn-lg">
            🚀 Get Started Free
          </Link>
          <a href="mailto:nirikshan-sih2026@gov.in?subject=Demo%20Request" className="btn-saffron btn-lg">
            📧 Request Executive Demo
          </a>
          <a href="#top" className="btn-secondary btn-lg">
            💬 Contact Project Team
          </a>
        </div>

        <div className="trusted-badges-row">
          <div className="trusted-badge-item">
            <span style={{ fontSize: '1.2rem' }}>🏛️</span>
            <span>Ministry of Statistics & Programme Implementation (MoSPI)</span>
          </div>
          <div className="trusted-badge-item">
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <span>Project Analysis & Monitoring Network (PAIMANA)</span>
          </div>
          <div className="trusted-badge-item">
            <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
            <span>Smart India Hackathon 2026</span>
          </div>
        </div>
      </div>
    </section>
  )
}
