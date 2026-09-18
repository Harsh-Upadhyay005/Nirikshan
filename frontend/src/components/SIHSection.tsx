export function SIHSection() {
  return (
    <section className="section section-subtle" id="sih2026">
      <div className="sih-container">
        <div className="sih-content-grid">
          <div>
            <div className="sih-badge" style={{ marginBottom: '1rem' }}>
              <span className="dot" />
              <span>National Flagship Initiative · SIH 2026</span>
            </div>

            <h2 style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', marginBottom: '1rem' }}>
              Built for Smart India Hackathon 2026
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '1.5rem' }}>
              Designed to solve the real-world infrastructure risk challenge posed by the{' '}
              <strong>Ministry of Statistics and Programme Implementation (MoSPI IPMD)</strong>.
            </p>

            <div style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #fed7aa', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#ea580c', letterSpacing: '0.06em' }}>
                Official Problem Statement
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginTop: '0.35rem', lineHeight: 1.4 }}>
                &ldquo;AI-Powered Predictive Analytics and Early Warning System for Infrastructure Project Monitoring&rdquo;
              </p>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
              MoSPI oversees central sector capital works exceeding ₹150 crore each. Nirikshan bridges
              the gap between static monthly reporting and real-time operational intervention.
            </p>
          </div>

          <div className="sih-callout-box">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <span>🏆</span> Solution Highlights
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Production-tested architecture ready for national deployment
            </span>

            <ul className="sih-highlights-list">
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>Complete ML pipeline with 6 trained models</span>
              </li>
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>Production backend with 25+ verified endpoints</span>
              </li>
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>Enterprise security (Bcrypt + JWT + OAuth 2.0)</span>
              </li>
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>Automated Brevo notification dispatch engine</span>
              </li>
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>45+ automated test cases, CI/CD, Docker ready</span>
              </li>
              <li>
                <span style={{ color: '#059669', fontSize: '1.1rem' }}>✅</span>
                <span>MoSPI IPMD PAIMANA data schema compliant</span>
              </li>
            </ul>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ea580c' }}>
                🌟 High Innovation Impact
              </span>
              <span className="badge-tag badge-blue">
                SIH 2026 Edition
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
