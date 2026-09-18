export function SecuritySection() {
  const pillars = [
    {
      icon: '🔐',
      title: 'Authentication',
      points: [
        'Bcrypt salted password hashing',
        'Cryptographically signed JWT tokens',
        'Google OAuth 2.0 single sign-on',
        'Secure HTTP-only session cookies',
      ],
    },
    {
      icon: '🛡️',
      title: 'Authorization (RBAC)',
      points: [
        '3-tier roles: Admin, Officer, Auditor',
        'Strict ministry-scoped data boundary',
        'Immutable role verification middlewares',
        'Write-action permission segregation',
      ],
    },
    {
      icon: '🚨',
      title: 'Active Protection',
      points: [
        'SlowAPI endpoint rate limiting (5 req/min on auth)',
        'Parameterized SQL queries against injection',
        'CORS domain whitelist restriction',
        'Content Security Policy (CSP) headers',
      ],
    },
    {
      icon: '🔍',
      title: 'Audit Trail & Traceability',
      points: [
        'Granular request & anomaly logging',
        'User activity attribution timestamps',
        'Project intervention note change history',
        'Immutable tamper-evident records',
      ],
    },
    {
      icon: '✅',
      title: 'Automated Testing',
      points: [
        '45+ automated pytest suites',
        '75%+ backend code coverage threshold',
        'GitHub Actions continuous integration',
        'Zero-breakage staging migrations',
      ],
    },
    {
      icon: '🔒',
      title: 'Government Compliance',
      points: [
        'Built to MoSPI IPMD standards',
        'Citizen data privacy & data localization',
        'Bandit & Dependabot security scans',
        'Production readiness certified',
      ],
    },
  ]

  return (
    <section className="section" id="security">
      <div className="section-header">
        <span className="eyebrow">Zero-Trust Architecture</span>
        <h2>Enterprise-Grade Security & Compliance</h2>
        <p>
          Robust defenses designed to protect national infrastructure records and adhere strictly
          to Government of India cybersecurity frameworks.
        </p>
      </div>

      <div className="security-grid-6">
        {pillars.map((pillar, idx) => (
          <div className="security-card" key={idx}>
            <div className="security-card-header">
              <span style={{ fontSize: '1.5rem' }}>{pillar.icon}</span>
              <h3>{pillar.title}</h3>
            </div>
            <ul>
              {pillar.points.map((pt, pIdx) => (
                <li key={pIdx}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
