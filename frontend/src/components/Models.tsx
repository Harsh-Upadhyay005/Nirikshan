const models = [
  {
    name: 'Delay classifier',
    artifact: 'delay_classifier.joblib',
    metric: '85% accuracy · 0.90 AUC',
    output: 'Probability a project will miss schedule. Threshold >0.7 is high risk.',
  },
  {
    name: 'Cost overrun classifier',
    artifact: 'cost_overrun_classifier.joblib',
    metric: '82% accuracy · 0.87 AUC',
    output: 'Probability spend will exceed original cost. Threshold >0.5 is high risk.',
  },
  {
    name: 'Schedule slippage',
    artifact: 'schedule_slippage_months_regressor.joblib',
    metric: 'MAE 3.2 months · R² 0.67',
    output: 'Expected months of delay from the target date of completion.',
  },
  {
    name: 'Overrun magnitude',
    artifact: 'cost_overrun_pct_regressor.joblib',
    metric: 'MAE 8.5% · R² 0.53',
    output: 'Expected cost overrun percentage and rupees in crore.',
  },
  {
    name: 'Risk clustering',
    artifact: 'risk_clusters.joblib',
    metric: 'K-Means · 4 segments',
    output: 'Low, Moderate, High, Critical — the colours in the hero field.',
  },
  {
    name: 'Composite risk score',
    artifact: 'delay × 0.5 + overrun × 0.5',
    metric: 'Range 0–1',
    output: 'Drives needs_alert, 15-minute scheduler, and Brevo emails.',
  },
]

export function Models() {
  return (
    <section className="section" id="models">
      <div className="section-head">
        <p className="eyebrow">POST /api/v1/predict</p>
        <h2>Six models. One risk object officers can read.</h2>
        <p>
          Features are leak-safe: ministry frequency, log cost, progress, expenditure, project age.
          LightGBM handles missing Flash Report fields; encoders fall back for unseen agencies.
        </p>
      </div>
      <div className="model-grid">
        {models.map((model) => (
          <article key={model.name} className="model-card">
            <p className="artifact">{model.artifact}</p>
            <h3>{model.name}</h3>
            <p className="metric">{model.metric}</p>
            <p>{model.output}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
