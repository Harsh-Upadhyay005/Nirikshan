export function Problem() {
  return (
    <section className="section section-subtle" id="problem">
      <div className="section-header">
        <span className="eyebrow">The National Challenge</span>
        <h2>Overcoming the Manual Bottleneck in Capital Projects</h2>
        <p>
          Managing mega-infrastructure across diverse ministries demands predictive foresight,
          not retrospective audits after deadlines have slipped.
        </p>
      </div>

      <div className="challenge-banner">
        <div className="challenge-banner-text">
          <strong>1,600+ Active Mega-Projects Worth ₹22 Lakh Crore</strong>
          <span>
            Every percentage point of delay drains public capital and defers national productivity.
            Conventional monthly reporting cycles are structurally too slow to prevent compounding slippages.
          </span>
        </div>
        <div className="challenge-banner-pill">
          ⚠️ Critical Intervention Gap
        </div>
      </div>

      <div className="problem-grid">
        <div className="problem-card">
          <div className="problem-icon-wrapper">
            ⏰
          </div>
          <h3>Delayed Detection</h3>
          <p>
            Traditional monitoring relies on retrospective monthly PDFs. By the time a project is formally
            flagged as delayed, critical contractor and procurement milestones are already irrecoverable.
          </p>
        </div>

        <div className="problem-card">
          <div className="problem-icon-wrapper">
            💸
          </div>
          <h3>Compounding Cost Overruns</h3>
          <p>
            Unmitigated schedule slippages trigger escalation clauses, idle machinery penalties, and loan
            interest overheads — leading to billions lost from taxpayers’ public investments.
          </p>
        </div>

        <div className="problem-card">
          <div className="problem-icon-wrapper">
            📊
          </div>
          <h3>Manual & Siloed Analysis</h3>
          <p>
            Project officers manually sift through dense 50-field tables without automated anomaly ranking.
            High-risk anomalies remain hidden beneath volume until an emergency escalation occurs.
          </p>
        </div>
      </div>
    </section>
  )
}
