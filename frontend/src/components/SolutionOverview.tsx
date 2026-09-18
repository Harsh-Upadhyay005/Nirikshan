export function SolutionOverview() {
  return (
    <section className="section" id="solution">
      <div className="section-header">
        <span className="eyebrow">How Nirikshan Solves It</span>
        <h2>Predict. Alert. Intervene.</h2>
        <p>
          A unified intelligence pipeline engineered to detect risks early, alert the right stakeholders,
          and unlock timely administrative action.
        </p>
      </div>

      <div className="solution-grid">
        {/* Card 1: Predict */}
        <div className="solution-card predict">
          <div className="solution-card-tag">
            🤖 Step 01 · Machine Learning
          </div>
          <h3>Predict with High Precision</h3>
          <p>
            Trained ensemble models digest monthly progress curves, physical deliverables, and expenditure
            ratios to project timeline and budgetary outcomes.
          </p>
          <ul className="solution-list">
            <li>
              <span className="check">✓</span>
              <span><strong>6 production models</strong> assessing 16+ telemetry parameters</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>85% delay accuracy</strong> validated on historical MoSPI records</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>0–1 continuous risk score</strong> with explainable feature impacts</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>4 automated segments</strong>: Low, Moderate, High, and Critical</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Alert */}
        <div className="solution-card alert">
          <div className="solution-card-tag">
            📧 Step 02 · Smart Automation
          </div>
          <h3>Automated Differential Alerts</h3>
          <p>
            An autonomous notification engine dispatches targeted, priority-ranked alerts before
            slippages become irreparable crisis points.
          </p>
          <ul className="solution-list">
            <li>
              <span className="check">✓</span>
              <span><strong>15-minute scheduled cadence</strong> with Brevo SMTP email delivery</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>Differential filtering</strong>: alerts trigger only on new or worsening risk</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>Ministry-specific routing</strong> straight to assigned desk officers</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>Responsive HTML briefs</strong> optimized for mobile and desktop</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Intervene */}
        <div className="solution-card intervene">
          <div className="solution-card-tag">
            ⚡ Step 03 · Executive Action
          </div>
          <h3>Proactive Administrative Intervention</h3>
          <p>
            Empower secretariats and project directors with role-tailored dashboards to reallocate resources,
            streamline clearances, and track corrective notes.
          </p>
          <ul className="solution-list">
            <li>
              <span className="check">✓</span>
              <span><strong>Action-oriented console</strong> surfacing root-cause delay contributors</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>3-tier role permissions</strong> for MoSPI, line ministries, and auditors</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>Project audit notes</strong> & milestone mitigation tracking</span>
            </li>
            <li>
              <span className="check">✓</span>
              <span><strong>Targeted early action</strong> protecting public capital from cost escalation</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
