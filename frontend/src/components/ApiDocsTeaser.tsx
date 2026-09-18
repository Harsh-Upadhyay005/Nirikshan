import { useState } from 'react'

export function ApiDocsTeaser() {
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'typescript'>('curl')
  const [copied, setCopied] = useState(false)

  const SNIPPETS = {
    curl: `curl -X POST https://api.nirikshan.gov.in/api/v1/predict \\
  -H "Authorization: Bearer <jwt_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ministry": "Road Transport and Highways",
    "project_name": "NH-44 Corridor Package 4",
    "original_cost_cr": 1420.0,
    "cumulative_expenditure_cr": 980.5,
    "physical_progress_pct": 64.2,
    "original_duration_months": 36,
    "delay_reported_months": 14
  }'`,

    python: `import httpx

headers = {"Authorization": "Bearer <jwt_token>"}
payload = {
    "ministry": "Road Transport and Highways",
    "project_name": "NH-44 Corridor Package 4",
    "original_cost_cr": 1420.0,
    "cumulative_expenditure_cr": 980.5,
    "physical_progress_pct": 64.2,
    "original_duration_months": 36,
    "delay_reported_months": 14
}

response = httpx.post("https://api.nirikshan.gov.in/api/v1/predict", json=payload, headers=headers)
prediction = response.json()
print(f"Risk Segment: {prediction['risk_segment']}")`,

    typescript: `interface PredictPayload {
  ministry: string;
  project_name: string;
  original_cost_cr: number;
  cumulative_expenditure_cr: number;
  physical_progress_pct: number;
  original_duration_months: number;
  delay_reported_months: number;
}

const response = await fetch('https://api.nirikshan.gov.in/api/v1/predict', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <jwt_token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

const result = await response.json();`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeLang])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="section" id="api">
      <div className="section-header">
        <span className="eyebrow">Developer & Agency Integration</span>
        <h2>Developer-Friendly RESTful API</h2>
        <p>
          Seamlessly integrate predictive early-warning risk scoring into existing line ministry ERPs,
          PAIMANA portals, and departmental workflows.
        </p>
      </div>

      <div className="api-teaser-box">
        {/* Top bar with tabs & copy button */}
        <div className="api-top-bar">
          <div className="api-tabs">
            <button
              type="button"
              className={`api-tab-btn ${activeLang === 'curl' ? 'active' : ''}`}
              onClick={() => setActiveLang('curl')}
            >
              cURL
            </button>
            <button
              type="button"
              className={`api-tab-btn ${activeLang === 'python' ? 'active' : ''}`}
              onClick={() => setActiveLang('python')}
            >
              Python
            </button>
            <button
              type="button"
              className={`api-tab-btn ${activeLang === 'typescript' ? 'active' : ''}`}
              onClick={() => setActiveLang('typescript')}
            >
              TypeScript
            </button>
          </div>

          <button type="button" className="copy-snippet-btn" onClick={handleCopy}>
            {copied ? '✓ Copied to Clipboard' : '📋 Copy Code'}
          </button>
        </div>

        {/* Code Panels */}
        <div className="api-code-split">
          <div className="code-panel request">
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.85rem', letterSpacing: '0.05em' }}>
              // Request Payload (POST /api/v1/predict)
            </div>
            <pre>
              <code>{SNIPPETS[activeLang]}</code>
            </pre>
          </div>

          <div className="code-panel">
            <div style={{ color: '#34d399', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.85rem', letterSpacing: '0.05em' }}>
              // 200 OK — Real-Time Inference Response (&lt;100ms)
            </div>
            <pre>
              <code>
{`{
  "status": "success",
  "project_id": "NH-44-PKG4",
  "delay_probability": 0.88,
  "cost_overrun_probability": 0.74,
  "risk_score_continuous": 0.824,
  "risk_segment": "Critical Attention",
  "needs_attention": true,
  "key_delay_drivers": [
    "Right-of-Way forest clearance pending",
    "Expenditure vs physical completion lag > 15%"
  ],
  "recommended_action": "Trigger Ministry Secretary Escalation Brief"
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}
