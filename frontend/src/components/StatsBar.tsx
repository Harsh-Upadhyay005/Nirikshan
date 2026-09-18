import type { PlatformStats } from '../types'

type Props = {
  stats: PlatformStats
}

const cards = [
  { label: 'Ongoing projects', value: '1,600+', hint: 'Central sector, ₹150 Cr+' },
  { label: 'Portfolio value', value: '₹22 L Cr', hint: 'PAIMANA monitored' },
  { label: 'Production models', value: '6', hint: 'LightGBM + K-Means' },
  { label: 'Prediction latency', value: '<500ms', hint: 'POST /api/v1/predict' },
]

export function StatsBar({ stats }: Props) {
  return (
    <section className="stats-bar" aria-label="Platform statistics">
      {cards.map((card) => (
        <article key={card.label}>
          <p>{card.label}</p>
          <strong>{card.value}</strong>
          <span>{card.hint}</span>
        </article>
      ))}
      <article>
        <p>Registry coverage</p>
        <strong>
          {stats.categories}
          <small> cats</small>
        </strong>
        <span>
          {stats.agencies} agencies · {stats.states} states
          {stats.live ? ' · live from API' : ' · fallback'}
        </span>
      </article>
    </section>
  )
}
