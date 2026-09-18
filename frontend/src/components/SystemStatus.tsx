import type { PlatformStats } from '../types'

type Props = {
  stats: PlatformStats
}

export function SystemStatus({ stats }: Props) {
  const rows = [
    { label: 'API', value: stats.health?.status ?? 'unreachable' },
    { label: 'PostgreSQL', value: stats.health?.database ?? 'unknown' },
    { label: 'ML artifacts', value: stats.health?.ml_models ?? 'unknown' },
    { label: 'GET /api/v1/ministries', value: String(stats.ministries) },
    { label: 'GET /api/v1/categories', value: String(stats.categories) },
    { label: 'GET /api/v1/agencies', value: String(stats.agencies) },
    { label: 'GET /api/v1/states', value: String(stats.states) },
  ]

  return (
    <section className="status-panel">
      <div>
        <p className="eyebrow">GET /health</p>
        <h2>The public registry this page already queries.</h2>
        <p>
          Ministries, categories, agencies, and states are unauthenticated lookup routes — the same
          dictionaries the predict payload and signup ministry_officer field depend on.
        </p>
      </div>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
