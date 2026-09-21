import { useState, useEffect, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', green: '#22c55e', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }
const PALETTE = ['#f97316','#f59e0b','#14b8a6','#fb923c','#f43f5e','#ef4444','#22c55e','#a855f7','#64748b','#0ea5e9']

export function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [alerts,   setAlerts]   = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [view,     setView]     = useState<'ministry'|'sector'|'agency'>('ministry')

  const token   = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=2000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=500',    { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([p, a]) => { setProjects(p); setAlerts(a) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Group projects by selected dimension
  const grouped = useMemo(() => {
    const map: Record<string, { count: number; cost: number; riskSum: number; riskCount: number }> = {}
    const alertMap: Record<number, any> = {}
    alerts.forEach(a => { if (a.project_id) alertMap[a.project_id] = a })

    projects.forEach(p => {
      const key = view === 'ministry'
        ? (p.ministry?.name ?? 'Unknown')
        : view === 'sector'
        ? (p.category?.name ?? 'Others')
        : (p.agency?.name ?? 'Unknown')

      if (!map[key]) map[key] = { count: 0, cost: 0, riskSum: 0, riskCount: 0 }
      map[key].count++
      map[key].cost += +(p.original_cost_cr || 0)
      const a = alertMap[p.id]
      if (a) { map[key].riskSum += +(a.risk_score || 0); map[key].riskCount++ }
    })

    return Object.entries(map)
      .map(([name, d], i) => ({
        name,
        count: d.count,
        cost: Math.round(d.cost),
        avgRisk: d.riskCount ? Math.round((d.riskSum / d.riskCount) * 100) : 0,
        color: PALETTE[i % PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count)
  }, [projects, alerts, view])

  // Risk segment distribution from alerts
  const riskSegments = useMemo(() => {
    const map: Record<string, number> = {}
    alerts.forEach(a => { const s = a.risk_segment ?? 'Unknown'; map[s] = (map[s] ?? 0) + 1 })
    return Object.entries(map).map(([name, count]) => ({
      name, count,
      color: name === 'Critical Risk' ? WARM.red : name === 'High Risk' ? WARM.orange : name === 'Medium Risk' ? WARM.amber : WARM.green,
      pct: alerts.length ? Math.round((count / alerts.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count)
  }, [alerts])

  const maxCount = Math.max(...grouped.map(g => g.count), 1)

  // Top 5 by risk
  const topRisk = useMemo(() =>
    [...alerts].sort((a, b) => +(b.risk_score||0) - +(a.risk_score||0)).slice(0, 5),
  [alerts])

  // Risk probability histogram buckets
  const delayBuckets = useMemo(() => {
    const buckets = [0,0,0,0,0] // 0-20, 20-40, 40-60, 60-80, 80-100
    alerts.forEach(a => {
      const v = Math.round(+(a.delay_probability||0)*100)
      if (v < 20) buckets[0]++ ; else if (v < 40) buckets[1]++
      else if (v < 60) buckets[2]++ ; else if (v < 80) buckets[3]++
      else buckets[4]++
    })
    return buckets
  }, [alerts])
  const maxBucket = Math.max(...delayBuckets, 1)

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Analytics &amp; Insights</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>
            {loading ? 'Loading…' : `${projects.length} projects · ${alerts.length} risk predictions analysed`}
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Total Projects',    value: projects.length.toLocaleString(),              color: WARM.orange },
          { label: 'Total Outlay (Cr)', value: `₹${Math.round(projects.reduce((s,p)=>s+ +(p.original_cost_cr||0),0)).toLocaleString()}`, color: WARM.amber },
          { label: 'Risk Predictions',  value: alerts.length.toLocaleString(),                color: WARM.red },
          { label: 'Critical Alerts',   value: alerts.filter(a=>a.risk_segment==='Critical Risk').length.toLocaleString(), color: WARM.red },
          { label: 'Avg Risk Score',    value: alerts.length ? `${Math.round(alerts.reduce((s,a)=>s+ +(a.risk_score||0),0)/alerts.length*100)}%` : '—', color: WARM.teal },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: WARM.muted, marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px', marginBottom: '12px' }}>

        {/* Grouped bar chart */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Project Distribution</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['ministry','sector','agency'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '4px 10px', fontSize: '11.5px', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', background: view === v ? WARM.orange : 'white', color: view === v ? 'white' : WARM.muted, transition: 'all .15s', textTransform: 'capitalize' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {grouped.slice(0,20).map((g) => (
                <div key={g.name} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px 70px', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.name}>{g.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px' }}>
                      <div style={{ width: `${(g.count/maxCount)*100}%`, height: '100%', background: g.color, borderRadius: '5px', transition: 'width .4s' }} />
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: g.color, minWidth: '24px' }}>{g.count}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: WARM.muted, textAlign: 'right' }}>
                    {g.avgRisk > 0 ? <span style={{ color: g.avgRisk >= 70 ? WARM.red : g.avgRisk >= 50 ? WARM.orange : WARM.amber, fontWeight: 700 }}>{g.avgRisk}% risk</span> : '—'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: WARM.muted, textAlign: 'right', fontFamily: 'monospace' }}>
                    ₹{(g.cost/100).toFixed(0)}K Cr
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk segment donut */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Risk Segment Breakdown</div>

          {/* Donut via SVG */}
          {riskSegments.length > 0 && (() => {
            const r = 44, circ = 2 * Math.PI * r
            let offset = 0
            return (
              <div style={{ width: '130px', height: '130px', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {riskSegments.map((s, i) => {
                    const len = (s.pct / 100) * circ
                    const el = <circle key={i} cx={50} cy={50} r={r} fill="none" stroke={s.color}
                      strokeWidth={11} strokeDasharray={`${len} ${circ - len}`}
                      strokeDashoffset={-offset} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                    offset += len
                    return el
                  })}
                  <text x="50" y="47" textAnchor="middle" style={{ fontSize: '11px', fontWeight: 900, fill: WARM.text }}>{alerts.length}</text>
                  <text x="50" y="57" textAnchor="middle" style={{ fontSize: '5px', fill: WARM.muted }}>predictions</text>
                </svg>
              </div>
            )
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {riskSegments.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '8px', height: '8px', background: s.color, borderRadius: '2px' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: WARM.text }}>{s.name}</span>
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.muted }}>{s.count} ({s.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        {/* Delay probability histogram */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px' }}>Delay Probability Distribution</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '130px', marginBottom: '8px' }}>
            {['0–20%','20–40%','40–60%','60–80%','80–100%'].map((label, i) => {
              const count = delayBuckets[i]
              const barColors = [WARM.green, WARM.teal, WARM.amber, WARM.orange, WARM.red]
              return (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: barColors[i] }}>{count}</span>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '90px' }}>
                    <div style={{ width: '100%', height: `${(count/maxBucket)*100}%`, background: barColors[i], borderRadius: '4px 4px 0 0', minHeight: count > 0 ? '4px' : '0', transition: 'height .4s' }} />
                  </div>
                  <span style={{ fontSize: '9.5px', color: WARM.muted, textAlign: 'center' }}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top 5 riskiest projects */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Top 5 Riskiest Projects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? <div style={{ color: '#94a3b8', fontSize: '12px' }}>Loading…</div>
            : topRisk.length === 0 ? <div style={{ color: '#94a3b8', fontSize: '12px' }}>No predictions available.</div>
            : topRisk.map((a, i) => {
              const score = Math.round(+(a.risk_score||0)*100)
              const seg   = a.risk_segment ?? 'Unknown'
              const col   = seg === 'Critical Risk' ? WARM.red : seg === 'High Risk' ? WARM.orange : WARM.amber
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#fafafa', borderRadius: '8px', borderLeft: `3px solid ${col}` }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: WARM.muted, minWidth: '16px' }}>#{i+1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.project?.project_name ?? '—'}</div>
                    <div style={{ fontSize: '10.5px', color: WARM.muted, marginTop: '1px' }}>{a.project?.ministry?.name ?? '—'}</div>
                  </div>
                  <div style={{ padding: '3px 9px', background: col, color: 'white', borderRadius: '6px', fontSize: '12.5px', fontWeight: 900 }}>{score}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
