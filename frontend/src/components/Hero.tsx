import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import type { PlatformStats } from '../types'

const HeroScene = lazy(() =>
  import('./HeroScene').then((module) => ({ default: module.HeroScene })),
)

type Props = {
  stats: PlatformStats
}

export function Hero({ stats }: Props) {
  const isHealthy = stats.health?.status === 'healthy'

  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="sih-badge">
          <span className="dot" />
          <span>Smart India Hackathon 2026 · MoSPI IPMD Early Warning</span>
        </div>

        <h1>
          AI-Powered Early Warning System
          <br />
          for <em>Infrastructure Monitoring</em>
        </h1>

        <p className="hero-lede">
          Predict delays. Prevent overruns. Protect taxpayer investments. Nirikshan continuously
          analyzes monthly Flash Reports across 1,600+ central sector projects worth ₹22 lakh crore,
          arming officers with proactive intelligence before slippages compound.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="btn-primary btn-lg">
            🚀 Get Started
          </Link>
          <a href="#dashboard" className="btn-secondary btn-lg">
            📊 View Demo
          </a>
          <a href="#api" className="btn-ghost btn-lg">
            📖 Documentation
          </a>
        </div>

        {/* Hero Integrated Stats Ribbon */}
        <div className="hero-stats-ribbon">
          <div className="hero-stat-item">
            <span className="hero-stat-val blue">1,600+</span>
            <span className="hero-stat-lbl">Central Projects Monitored</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-val saffron">₹22L Cr</span>
            <span className="hero-stat-lbl">Infrastructure Portfolio</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-val green">85%</span>
            <span className="hero-stat-lbl">Delay Prediction Accuracy</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-val">15 min</span>
            <span className="hero-stat-lbl">Automated Alert Cadence</span>
          </div>
        </div>
      </div>

      <div className="hero-canvas" aria-label="3D Interactive India Infrastructure Map">
        <Suspense fallback={
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#64748b' }}>
            <span>Initializing 3D India Infrastructure Corridors…</span>
          </div>
        }>
          <HeroScene />
        </Suspense>

        <div className="canvas-legend">
          <span style={{ fontWeight: 700, color: '#1d4ed8' }}>Live Corridors & Nodes</span>
          <div className="legend-items">
            <span><span className="legend-dot" style={{ background: '#059669' }} /> Low</span>
            <span><span className="legend-dot" style={{ background: '#d97706' }} /> Moderate</span>
            <span><span className="legend-dot" style={{ background: '#ea580c' }} /> High</span>
            <span><span className="legend-dot" style={{ background: '#dc2626' }} /> Critical</span>
          </div>
          <span style={{ color: isHealthy ? '#059669' : '#64748b' }}>
            ● {isHealthy ? 'Telemetry Online' : 'MoSPI Live Feed'}
          </span>
        </div>
      </div>
    </section>
  )
}
