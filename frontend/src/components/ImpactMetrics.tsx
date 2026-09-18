export function ImpactMetrics() {
  const metrics = [
    {
      percentage: 85,
      label: 'Delay Prediction Accuracy',
      sublabel: 'Validated ROC-AUC 0.90 across 10-year MoSPI historical project series',
      strokeColor: '#1d4ed8',
      displayValue: '85%',
    },
    {
      percentage: 82,
      label: 'Cost Overrun Accuracy',
      sublabel: 'Trained to detect capital expenditure drift before formal budget revisions',
      strokeColor: '#ea580c',
      displayValue: '82%',
    },
    {
      percentage: 95,
      label: 'API Response Latency',
      sublabel: 'Optimized asynchronous microservices responding in sub-100ms timings',
      strokeColor: '#059669',
      displayValue: '<100ms',
    },
    {
      percentage: 90,
      label: 'Portfolio Capital Monitored',
      sublabel: 'Protecting massive public investments across national highway & rail grids',
      strokeColor: '#2563eb',
      displayValue: '₹22L Cr',
    },
    {
      percentage: 88,
      label: 'Active Mega-Projects Tracked',
      sublabel: 'Central sector infrastructure projects monitored across 50+ ministries',
      strokeColor: '#7c3aed',
      displayValue: '1,600+',
    },
    {
      percentage: 100,
      label: 'Scheduled Alert Frequency',
      sublabel: 'Continuous automated background scanning and Brevo notifications',
      strokeColor: '#0284c7',
      displayValue: '15 min',
    },
  ]

  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <section className="section" id="metrics">
      <div className="section-header">
        <span className="eyebrow">Measurable Outcomes</span>
        <h2>Impact by the Numbers</h2>
        <p>
          Delivering quantifiable precision, near-instantaneous telemetry, and immense capital
          protection for the Government of India.
        </p>
      </div>

      <div className="impact-circles-grid">
        {metrics.map((m, idx) => {
          const strokeDashoffset = circumference - (m.percentage / 100) * circumference
          return (
            <div className="impact-circle-card" key={idx}>
              <div className="circle-meter">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle
                    className="circle-bg"
                    cx="64"
                    cy="64"
                    r={radius}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    className="circle-fill"
                    cx="64"
                    cy="64"
                    r={radius}
                    strokeWidth="8"
                    fill="none"
                    stroke={m.strokeColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="circle-center-text" style={{ color: m.strokeColor }}>
                  {m.displayValue}
                </div>
              </div>
              <h3>{m.label}</h3>
              <p>{m.sublabel}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
