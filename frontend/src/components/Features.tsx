export function Features() {
  return (
    <section className="section" id="features">
      <div className="section-header">
        <span className="eyebrow">Platform Capabilities</span>
        <h2>Comprehensive Infrastructure Intelligence Suite</h2>
        <p>
          Engineered to satisfy stringent Indian governmental standards for security, scalability,
          and inter-departmental transparency.
        </p>
      </div>

      <div className="feature-grid-6">
        {/* Feature 1 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            🔐
          </div>
          <h3>Enterprise Security</h3>
          <p>
            Zero-trust architecture safeguarding critical governmental infrastructure telemetry and audit records.
          </p>
          <ul>
            <li>Bcrypt salted password hashing</li>
            <li>Cryptographic JWTs & Google OAuth 2.0</li>
            <li>Strict 3-tier Role-Based Access Control</li>
            <li>Endpoint rate-limiting against DDoS vectors</li>
          </ul>
        </div>

        {/* Feature 2 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            📊
          </div>
          <h3>Dual ML Predictions</h3>
          <p>
            Concurrent models predicting both temporal delay probability and fiscal cost overrun likelihood.
          </p>
          <ul>
            <li>6 production-trained ensemble pipelines</li>
            <li>Continuous 0–1 probability risk scoring</li>
            <li>Segment categorization (Low to Critical)</li>
            <li>85%+ validated precision on historical data</li>
          </ul>
        </div>

        {/* Feature 3 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
            📧
          </div>
          <h3>Smart Notifications</h3>
          <p>
            Autonomous alert scheduler that flags deteriorating metrics without producing email fatigue.
          </p>
          <ul>
            <li>Automated 15-minute scheduled cadence</li>
            <li>Differential alerting on worsening scores</li>
            <li>Ministry-specific subscription routing</li>
            <li>Executive HTML report formatting</li>
          </ul>
        </div>

        {/* Feature 4 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            🎯
          </div>
          <h3>Role-Based Access</h3>
          <p>
            Fine-grained access control ensuring each ministry official accesses relevant project dossiers.
          </p>
          <ul>
            <li><strong>Admin</strong>: Global platform governance & audits</li>
            <li><strong>Ministry Officer</strong>: Scoped departmental actions</li>
            <li><strong>Auditor</strong>: Read-only cross-sector verification</li>
            <li>Tamper-evident activity logs</li>
          </ul>
        </div>

        {/* Feature 5 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            📱
          </div>
          <h3>Real-Time Command Dashboard</h3>
          <p>
            Executive interface offering high-level ministry overviews down to project milestone specifics.
          </p>
          <ul>
            <li>Live status updates across 1,600+ projects</li>
            <li>Dynamic geographic & risk heatmaps</li>
            <li>Expenditure vs physical completion trends</li>
            <li>One-click exportable PDF & CSV reports</li>
          </ul>
        </div>

        {/* Feature 6 */}
        <div className="feature-box">
          <div className="feature-box-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
            🧪
          </div>
          <h3>Battle-Tested Codebase</h3>
          <p>
            Developed with rigorous continuous integration ensuring zero-downtime and rock-solid stability.
          </p>
          <ul>
            <li>45+ unit & integration test suites</li>
            <li>Automated GitHub Actions CI/CD</li>
            <li>Dependabot & Bandit security scanning</li>
            <li>75%+ verified test coverage</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
