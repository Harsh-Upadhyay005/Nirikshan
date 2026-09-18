export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Data Ingestion',
      subtitle: 'PAIMANA Flash Reports',
      desc: 'Ingests monthly unstructured PDFs and CSVs covering 1,600+ central projects and 50+ raw metrics.',
      tag: 'Raw Telemetry',
    },
    {
      num: '02',
      title: 'ML Analysis',
      subtitle: '6 Predictive Models',
      desc: 'Ensemble LightGBM models evaluate feature velocity, physical delays, and expenditure slippage in <500ms.',
      tag: 'AI Pipeline',
    },
    {
      num: '03',
      title: 'Risk Scoring',
      subtitle: 'Composite 0–1 Index',
      desc: 'Categorizes each project into one of 4 standardized tiers: Low, Moderate, High, or Critical Attention.',
      tag: 'Classification',
    },
    {
      num: '04',
      title: 'Smart Alerts',
      subtitle: '15-Min Brevo Engine',
      desc: 'Differential alert engine dispatches branded alerts to assigned ministry desk officers for worsening risks.',
      tag: 'Targeted Push',
    },
    {
      num: '05',
      title: 'Proactive Action',
      subtitle: 'Executive Intervention',
      desc: 'Project directors resolve ROW impediments, expedite sanctions, and record mitigation audit trails.',
      tag: 'Resolution',
    },
  ]

  return (
    <section className="section section-subtle" id="how-it-works">
      <div className="section-header">
        <span className="eyebrow">Operational Pipeline</span>
        <h2>From Data to Action in 5 Steps</h2>
        <p>
          How raw monthly infrastructure records are transformed into actionable interventions
          that save taxpayer funds.
        </p>
      </div>

      <div className="timeline-track">
        {steps.map((step) => (
          <div className="timeline-step-card" key={step.num}>
            <div className="step-num-badge">{step.num}</div>
            <span className="badge-tag badge-blue" style={{ marginBottom: '0.65rem' }}>
              {step.tag}
            </span>
            <h3>{step.title}</h3>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '0.5rem' }}>
              {step.subtitle}
            </div>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
