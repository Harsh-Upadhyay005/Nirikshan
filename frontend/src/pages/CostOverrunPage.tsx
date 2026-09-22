import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react'

interface Project {
  id: number
  project_code: number
  project_name: string
  original_cost_cr: string
  ministry: { name: string } | null
  category: { name: string } | null
  agency:   { name: string } | null
}

interface AlertRow {
  id: number
  project_id: number
  cost_overrun_probability: string | null
  expected_overrun_value_cr: string | null
  risk_segment: string | null
  risk_score: string | null
  predicted_at: string
  project: {
    project_name: string
    project_code: number
    original_cost_cr: string
    ministry: { name: string } | null
    category: { name: string } | null
  } | null
}

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

export function CostOverrunPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [alerts,   setAlerts]     = useState<AlertRow[]>([])
  const [loading,  setLoading]    = useState(true)
  const [sortByOverrun, setSortByOverrun] = useState(true)

  const token   = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=5000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=5000',    { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([p, a]) => { setProjects(p); setAlerts(a) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Join alerts (which have overrun predictions) with projects
  const enriched = useMemo(() => {
    const alertMap: Record<number, AlertRow> = {}
    alerts.forEach(a => { if (a.project_id) alertMap[a.project_id] = a })

    return projects.map(p => {
      const a = alertMap[p.id]
      const overrunProb = a ? Math.round(+(a.cost_overrun_probability ?? 0) * 100) : 0
      const overrunVal  = a ? Math.round(+(a.expected_overrun_value_cr ?? 0)) : 0
      const origCost    = Math.round(+(p.original_cost_cr ?? 0))
      return { ...p, overrunProb, overrunVal, origCost, segment: a?.risk_segment ?? null }
    }).sort((a, b) => sortByOverrun ? b.overrunProb - a.overrunProb : b.origCost - a.origCost)
  }, [projects, alerts, sortByOverrun])

  const totalOriginal    = projects.reduce((s, p) => s + +(p.original_cost_cr ?? 0), 0)
  const totalExpOverrun  = alerts.reduce((s, a) => s + +(a.expected_overrun_value_cr ?? 0), 0)
  const highOverrunCount = enriched.filter(p => p.overrunProb >= 60).length
  const criticalCount    = enriched.filter(p => p.overrunProb >= 80).length

  const SEG_COLOR: Record<string, string> = {
    'Critical Risk': '#ef4444', 'High Risk': '#f97316', 'Medium Risk': '#f59e0b', 'Low Risk': '#22c55e'
  }

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Cost Overrun Analysis</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>ML-predicted cost escalation risk across all central sector projects</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Total Sanctioned Outlay',   value: `₹${(totalOriginal / 100).toFixed(0)}K Cr`,            color: WARM.orange, icon: DollarSign    },
          { label: 'Expected Total Overrun',     value: `₹${Math.round(totalExpOverrun).toLocaleString()} Cr`, color: WARM.red,    icon: TrendingUp    },
          { label: 'High Overrun Risk Projects', value: String(highOverrunCount),                              color: WARM.orange, icon: AlertTriangle  },
          { label: 'Critical Overrun Risk',      value: String(criticalCount),                                 color: WARM.red,    icon: AlertTriangle  },
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

      {/* Chart: top 10 by overrun probability */}
      <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '14px' }}>Top 10 Projects by Cost Overrun Probability</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {enriched.slice(0, 10).map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 200px 80px', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted, textAlign: 'right' }}>#{i + 1}</span>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name}</div>
                <div style={{ fontSize: '10.5px', color: WARM.muted }}>{p.ministry?.name ?? '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '7px', background: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{ width: `${p.overrunProb}%`, height: '100%', background: p.overrunProb >= 80 ? WARM.red : p.overrunProb >= 60 ? WARM.orange : WARM.amber, borderRadius: '4px', transition: 'width .4s' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: p.overrunProb >= 80 ? WARM.red : p.overrunProb >= 60 ? WARM.orange : WARM.amber, minWidth: '32px' }}>{p.overrunProb}%</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', fontWeight: 700, color: WARM.orange }}>
                {p.overrunVal ? `+₹${p.overrunVal.toLocaleString()} Cr` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full table */}
      <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${WARM.border}` }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: WARM.text }}>All Projects — Cost Risk Table</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setSortByOverrun(true)}  style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', background: sortByOverrun ? WARM.orange : 'white', color: sortByOverrun ? 'white' : WARM.muted }}>Sort by Risk</button>
            <button onClick={() => setSortByOverrun(false)} style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', background: !sortByOverrun ? WARM.orange : 'white', color: !sortByOverrun ? 'white' : WARM.muted }}>Sort by Cost</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', fontSize: '10.5px', fontWeight: 700, color: WARM.muted, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                {['Project Name', 'Ministry', 'Sector', 'Original Cost (Cr)', 'Overrun Prob.', 'Exp. Overrun (Cr)', 'Segment'].map(h => (
                  <th key={h} style={{ padding: '9px 12px', borderBottom: `1px solid ${WARM.border}`, textAlign: h.includes('Cost') || h.includes('Prob') || h.includes('Overrun') ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading…</td></tr>
              ) : enriched.map((p, i) => (
                <tr key={p.id} style={{ borderTop: `1px solid #f1f5f9`, background: i % 2 === 0 ? 'white' : '#fafafa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fffbf5'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}>
                  <td style={{ padding: '9px 12px', fontSize: '12.5px', fontWeight: 600, color: WARM.text, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.project_name}>{p.project_name}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11.5px', color: WARM.muted, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ministry?.name ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: '11.5px', color: WARM.muted }}>{p.category?.name ?? '—'}</td>
                  <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: 700, color: WARM.text, textAlign: 'right', fontFamily: 'monospace' }}>{p.origCost.toLocaleString()}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: p.overrunProb >= 80 ? WARM.red : p.overrunProb >= 60 ? WARM.orange : p.overrunProb > 0 ? WARM.amber : WARM.muted }}>
                      {p.overrunProb > 0 ? `${p.overrunProb}%` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', fontSize: '12px', fontWeight: 700, color: WARM.orange, textAlign: 'right', fontFamily: 'monospace' }}>{p.overrunVal ? `+${p.overrunVal.toLocaleString()}` : '—'}</td>
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
    </div>
  )
}
