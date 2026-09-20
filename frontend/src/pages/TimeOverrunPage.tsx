import { useState, useEffect, useMemo } from 'react'
import { Clock, TrendingUp, AlertTriangle, RefreshCw, Calendar } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

export function TimeOverrunPage() {
  const [projects,   setProjects]   = useState<any[]>([])
  const [alerts,     setAlerts]     = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filterSeg,  setFilterSeg]  = useState('All')

  const token   = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=1000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=500',    { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([p, a]) => { setProjects(p); setAlerts(a) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const enriched = useMemo(() => {
    const alertMap: Record<number, any> = {}
    alerts.forEach(a => { if (a.project_id) alertMap[a.project_id] = a })

    return projects.map(p => {
      const a = alertMap[p.id]
      const delayProb     = a ? Math.round(+(a.delay_probability ?? 0) * 100) : 0
      const expectedSlip  = a ? +(a.expected_slippage_months ?? 0) : 0
      const segment       = a?.risk_segment ?? null

      // Calculate days since target DOC if overdue
      const targetDoc = p.target_doc ? new Date(p.target_doc) : null
      const today     = new Date()
      const overdueMonths = targetDoc && targetDoc < today
        ? Math.round((today.getTime() - targetDoc.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0

      return { ...p, delayProb, expectedSlip, segment, overdueMonths, targetDoc }
    }).filter(p => {
      if (filterSeg !== 'All' && p.segment !== filterSeg) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return p.project_name.toLowerCase().includes(q) || (p.ministry?.name ?? '').toLowerCase().includes(q)
      }
      return true
    }).sort((a, b) => b.delayProb - a.delayProb)
  }, [projects, alerts, search, filterSeg])

  const overdueCount    = enriched.filter(p => p.overdueMonths > 0).length
  const highDelayCount  = enriched.filter(p => p.delayProb >= 70).length
  const avgExpSlip      = enriched.length ? (enriched.reduce((s, p) => s + p.expectedSlip, 0) / enriched.length).toFixed(1) : '0'
  const totalExpSlip    = enriched.reduce((s, p) => s + p.expectedSlip, 0)

  const segments = ['All', 'Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk']
  const SEG_COLOR: Record<string, string> = {
    'Critical Risk': '#ef4444', 'High Risk': '#f97316', 'Medium Risk': '#f59e0b', 'Low Risk': '#22c55e'
  }

  // Bucket distribution for bar chart
  const buckets = [
    { label: '0–25%',   count: enriched.filter(p => p.delayProb < 25).length,                    color: '#22c55e' },
    { label: '25–50%',  count: enriched.filter(p => p.delayProb >= 25 && p.delayProb < 50).length, color: WARM.teal },
    { label: '50–75%',  count: enriched.filter(p => p.delayProb >= 50 && p.delayProb < 75).length, color: WARM.amber },
    { label: '75–100%', count: enriched.filter(p => p.delayProb >= 75).length,                   color: WARM.red   },
  ]
  const maxBucket = Math.max(...buckets.map(b => b.count), 1)

  return (
    <DashboardLayout searchValue={search} onSearchChange={setSearch}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Time Overrun Analysis</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>Schedule delay risk prediction and overdue project tracking</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Overdue Projects',     value: String(overdueCount),           color: WARM.red,    icon: AlertTriangle },
          { label: 'High Delay Risk',      value: String(highDelayCount),         color: WARM.orange, icon: TrendingUp    },
          { label: 'Avg Expected Slippage',value: `${avgExpSlip} months`,         color: WARM.amber,  icon: Clock         },
          { label: 'Total Exp. Slippage',  value: `${Math.round(totalExpSlip)} months`, color: WARM.teal, icon: Calendar },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: WARM.muted }}>{label}</span>
              <div style={{ padding: '4px', background: '#fff7ed', borderRadius: '5px' }}><Icon size={12} color={color} /></div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px', marginBottom: '12px' }}>
        {/* Delay probability distribution */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px' }}>Delay Probability Distribution</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '140px' }}>
            {buckets.map(b => (
              <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: b.color }}>{b.count}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100px' }}>
                  <div style={{ width: '100%', height: `${(b.count / maxBucket) * 100}%`, background: b.color, borderRadius: '4px 4px 0 0', minHeight: b.count > 0 ? '4px' : '0', transition: 'height .4s' }} />
                </div>
                <span style={{ fontSize: '10.5px', color: WARM.muted, textAlign: 'center' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue summary */}
        <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Most Overdue Projects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {enriched.filter(p => p.overdueMonths > 0).slice(0, 6).map((p, i) => (
              <div key={p.id} style={{ padding: '8px 10px', background: '#fafafa', borderRadius: '6px', borderLeft: `3px solid ${p.overdueMonths > 24 ? WARM.red : p.overdueMonths > 12 ? WARM.orange : WARM.amber}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.project_name}>{p.project_name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                  <span style={{ fontSize: '10.5px', color: WARM.muted }}>{p.ministry?.name?.slice(0, 20)}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: p.overdueMonths > 24 ? WARM.red : WARM.orange }}>{p.overdueMonths} mo overdue</span>
                </div>
              </div>
            ))}
            {enriched.filter(p => p.overdueMonths > 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
                {loading ? 'Loading…' : 'No overdue projects found.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {segments.map(seg => (
          <button key={seg} onClick={() => setFilterSeg(seg)}
            style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', background: filterSeg === seg ? (SEG_COLOR[seg] ?? WARM.orange) : 'white', color: filterSeg === seg ? 'white' : WARM.muted, transition: 'all .15s' }}>
            {seg}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', fontSize: '10.5px', fontWeight: 700, color: WARM.muted, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                {['Project Name','Ministry','Sector','Start Date','Target DOC','Delay Prob.','Exp. Slippage','Overdue','Risk Segment'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', borderBottom: `1px solid ${WARM.border}`, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              ) : enriched.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fffbf5'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}>
                  <td style={{ padding: '9px 12px', fontSize: '12.5px', fontWeight: 600, color: WARM.text, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.project_name}>{p.project_name}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11.5px', color: WARM.muted, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ministry?.name ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11.5px', color: WARM.muted }}>{p.category?.name ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11px', fontFamily: 'monospace', color: WARM.muted }}>{p.start_date ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11px', fontFamily: 'monospace', color: p.overdueMonths > 0 ? WARM.red : WARM.muted }}>{p.target_doc ?? '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '40px', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                        <div style={{ width: `${p.delayProb}%`, height: '100%', background: p.delayProb >= 75 ? WARM.red : p.delayProb >= 50 ? WARM.orange : WARM.amber, borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: p.delayProb >= 75 ? WARM.red : p.delayProb >= 50 ? WARM.orange : p.delayProb > 0 ? WARM.amber : WARM.muted }}>{p.delayProb > 0 ? `${p.delayProb}%` : '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: '11.5px', fontWeight: 700, color: WARM.amber }}>{p.expectedSlip > 0 ? `${p.expectedSlip.toFixed(1)} mo` : '—'}</td>
                  <td style={{ padding: '9px 12px' }}>
                    {p.overdueMonths > 0 ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', background: p.overdueMonths > 24 ? WARM.red : WARM.orange, padding: '2px 8px', borderRadius: '10px' }}>{p.overdueMonths} mo</span>
                    ) : <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>On track</span>}
                  </td>
                  <td style={{ padding: '9px 12px' }}>
                    {p.segment ? (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: (SEG_COLOR[p.segment] ?? '#94a3b8') + '20', color: SEG_COLOR[p.segment] ?? '#94a3b8' }}>{p.segment}</span>
                    ) : <span style={{ fontSize: '11px', color: '#cbd5e1' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
