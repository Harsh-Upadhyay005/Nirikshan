export function TechStack() {
  return (
    <section className="section section-subtle" id="tech-stack">
      <div className="section-header">
        <span className="eyebrow">Architecture & Engine</span>
        <h2>Powered by Cutting-Edge AI & Government-Grade Engineering</h2>
        <p>
          Constructed with a modern, high-throughput microservices architecture delivering real-time
          risk scoring with sub-second API latency.
        </p>
      </div>

      <div className="tech-categories">
        {/* ML Category */}
        <div className="tech-group-card">
          <h3>
            <span>🧠</span> ML Intelligence Core
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Multi-target predictive ensemble pipelines analyzing project trajectories and historical slippages.
          </p>
          <div className="tech-pill-cloud">
            <span className="tech-pill">⚡ LightGBM Classifiers</span>
            <span className="tech-pill">📊 Scikit-learn Ensembles</span>
            <span className="tech-pill">🐍 Python 3.13 Runtime</span>
            <span className="tech-pill">📈 Pandas & NumPy Pipelines</span>
            <span className="tech-pill">🎯 Dual Target (Delay & Cost)</span>
            <span className="tech-pill">🔍 16+ Engineered Features</span>
          </div>
        </div>

        {/* Backend Category */}
        <div className="tech-group-card">
          <h3>
            <span>⚡</span> Backend & Microservices
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Asynchronous RESTful APIs with strict validation, connection pooling, and multi-tenant scoping.
          </p>
          <div className="tech-pill-cloud">
            <span className="tech-pill">⚡ FastAPI Async Engine</span>
            <span className="tech-pill">🔐 JWT + Google OAuth 2.0</span>
            <span className="tech-pill">📧 Brevo Automated SMTP</span>
            <span className="tech-pill">🗄️ PostgreSQL + Connection Pool</span>
            <span className="tech-pill">🛡️ Pydantic V2 Validation</span>
            <span className="tech-pill">⏱️ SlowAPI Rate Limiting</span>
          </div>
        </div>

        {/* Infrastructure Category */}
        <div className="tech-group-card">
          <h3>
            <span>🐳</span> Infrastructure & Quality
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Production-ready orchestration with automated continuous integration and vulnerability scanning.
          </p>
          <div className="tech-pill-cloud">
            <span className="tech-pill">🐳 Docker Multi-Stage Builds</span>
            <span className="tech-pill">🔄 GitHub Actions CI/CD</span>
            <span className="tech-pill">✅ 45+ Automated Pytest Cases</span>
            <span className="tech-pill">📊 75%+ Code Coverage</span>
            <span className="tech-pill">🌐 React 19 + Three.js 3D</span>
            <span className="tech-pill">🔒 Security Hardened Headers</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="tech-metrics-bar">
        <div>
          <div className="tech-metric-val">85%</div>
          <div className="tech-metric-lbl">Delay Prediction Accuracy (ROC-AUC 0.90)</div>
        </div>
        <div>
          <div className="tech-metric-val">82%</div>
          <div className="tech-metric-lbl">Cost Overrun Accuracy (ROC-AUC 0.87)</div>
        </div>
        <div>
          <div className="tech-metric-val">&lt; 100ms</div>
          <div className="tech-metric-lbl">Median API Prediction Response Time</div>
        </div>
      </div>
    </section>
  )
}
