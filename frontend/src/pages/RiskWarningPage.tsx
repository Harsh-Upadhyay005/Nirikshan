import { useState, useEffect, useMemo } from 'react'
import { AlertTriangle, TrendingUp, DollarSign, Clock, RefreshCw, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

interface Alert {
  id: number
  project_id: number
  risk_segment: string | null
  risk_score: string | null
  delay_probability: string | null
  cost_overrun_probability: string | null
  expected_slippage_months: string | null
  expected_overrun_value_cr: string | null
  needs_alert: boolean
  predicted_at: string
  project: {
    project_name: string
    project_code: number
    ministry: { name: string } | null
    category: { name: string } | null
  } | null
}

interface Summary {
  total_alerts: number
  critical_risk_count: number
  high_risk_count: number
  total_expected_overrun_cr: number
  average_delay_probability: number
  average_cost_overrun_probability: number
}

const SEG_COLOR: Record<string, string> = {
  'Critical Risk': '#ef4444',
  'High Risk':     '#f97316',
  'Medium Risk':   '#f59e0b',
  'Low Risk':      '#22c55e',
}

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

export function RiskWarningPage() {
  const [alerts, setAlerts]       = useState<Alert[]>([])
  const [summary, setSummary]     = useState<Summary | null>(null)
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState<string>('All')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<Alert | null>(null)

  const token = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/alerts?limit=500',  { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts/summary',    { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([a, s]) => {
      setAlerts(a)
      setSummary(s)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = alerts
    if (filter !== 'All') list = list.filter(a => a.risk_segment === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        (a.project?.project_name ?? '').toLowerCase().includes(q) ||
        (a.project?.ministry?.name ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [alerts, filter, search])

  const segments = ['All', 'Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk']

  function scoreBar(val: string | null) {
    const n = Math.round(+(val ?? 0) * 100)
    const color = n >= 75 ? WARM.red : n >= 55 ? WARM.orange : n >= 35 ? WARM.amber : '#22c55e'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ flex: 1, height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
          <div style={{ width: `${n}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '28px' }}>{n}%</span>
      </div>
    )
  }

  return (
    <DashboardLayout searchValue={search} onSearchChange={v => { setSearch(v) }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Risk &amp; Early Warning</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>
            ML-predicted risk alerts · LightGBM model trained on MoSPI IPMD Flash Reports · Risk scores from 0–100
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Total Alerts',          value: summary.total_alerts,                                      color: WARM.orange, icon: AlertTriangle },
            { label: 'Critical Risk',          value: summary.critical_risk_count,                               color: WARM.red,    icon: AlertTriangle },
            { label: 'High Risk',              value: summary.high_risk_count,                                   color: WARM.orange, icon: TrendingUp    },
            { label: 'Exp. Overrun (Cr)',      value: `₹${Math.round(summary.total_expected_overrun_cr).toLocaleString()}`, color: WARM.amber, icon: DollarSign },
            { label: 'Avg Delay Prob.',        value: `${Math.round(summary.average_delay_probability * 100)}%`,color: WARM.amber,  icon: Clock         },
            { label: 'Avg Cost Overrun Prob.', value: `${Math.round(summary.average_cost_overrun_probability * 100)}%`, color: '#a855f7', icon: TrendingUp },
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
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '12px' }}>
        {/* Alert list */}
        <div>
          {/* Segment filter tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {segments.map(seg => (
              <button key={seg} onClick={() => setFilter(seg)}
                style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', background: filter === seg ? (SEG_COLOR[seg] ?? WARM.orange) : 'white', color: filter === seg ? 'white' : WARM.muted, transition: 'all .15s' }}>
                {seg}
                {seg !== 'All' && <span style={{ marginLeft: '5px', opacity: .8 }}>({alerts.filter(a => a.risk_segment === seg).length})</span>}
                {seg === 'All' && <span style={{ marginLeft: '5px', opacity: .8 }}>({alerts.length})</span>}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.4fr 100px 90px 90px 90px', padding: '9px 14px', background: '#f8fafc', fontSize: '10.5px', fontWeight: 700, color: WARM.muted, textTransform: 'uppercase', letterSpacing: '.4px', borderBottom: `1px solid ${WARM.border}` }}>
              <span>Project</span><span>Ministry</span><span>Risk Tier</span><span>Risk Score (0-100)</span><span>Delay Prob.</span><span>Predicted At</span>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading alerts…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No alerts match your filters.</div>
            ) : filtered.map((a, i) => {
              const seg = a.risk_segment ?? 'Low Risk'
              const segColor = SEG_COLOR[seg] ?? '#22c55e'
              const score = Math.round(+(a.risk_score ?? 0) * 100)
              const isSelected = selected?.id === a.id
              return (
                <div key={a.id} onClick={() => setSelected(isSelected ? null : a)}
                  style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.4fr 100px 90px 90px 90px', padding: '10px 14px', borderTop: `1px solid #f1f5f9`, cursor: 'pointer', background: isSelected ? '#fff7ed' : i % 2 === 0 ? 'white' : '#fafafa', alignItems: 'center', transition: 'background .1s' }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fffbf5' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.project?.project_name ?? '—'}</div>
                    <div style={{ fontSize: '10.5px', color: WARM.muted, marginTop: '1px', fontFamily: 'monospace' }}>#{a.project?.project_code}</div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: WARM.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.project?.ministry?.name ?? '—'}</div>
                  <span style={{ display: 'inline-block', padding: '2px 8px', background: segColor + '20', color: segColor, fontSize: '10.5px', fontWeight: 700, borderRadius: '10px' }}>{seg}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '28px', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{ width: `${score}%`, height: '100%', background: segColor, borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: segColor }}>{score}</span>
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.amber }}>{Math.round(+(a.delay_probability ?? 0) * 100)}%</span>
                  <span style={{ fontSize: '10.5px', color: WARM.muted, fontFamily: 'monospace' }}>{a.predicted_at ? new Date(a.predicted_at).toLocaleDateString('en-IN') : '—'}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: WARM.muted }}>Showing {filtered.length} of {alerts.length} alerts</div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '16px', alignSelf: 'start', position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Alert Detail</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: WARM.muted, fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 800, color: WARM.text, marginBottom: '4px', lineHeight: 1.3 }}>{selected.project?.project_name}</div>
            <div style={{ fontSize: '11.5px', color: WARM.muted, marginBottom: '14px' }}>{selected.project?.ministry?.name} · {selected.project?.category?.name}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Risk Segment',           value: selected.risk_segment ?? '—',                          color: SEG_COLOR[selected.risk_segment ?? ''] ?? '#22c55e' },
                { label: 'Risk Score',             value: `${Math.round(+(selected.risk_score ?? 0) * 100)} / 100`, color: WARM.orange },
                { label: 'Delay Probability',      value: `${Math.round(+(selected.delay_probability ?? 0) * 100)}%`, color: WARM.amber },
                { label: 'Cost Overrun Prob.',     value: `${Math.round(+(selected.cost_overrun_probability ?? 0) * 100)}%`, color: WARM.red },
                { label: 'Expected Slippage',      value: `${+(selected.expected_slippage_months ?? 0).toFixed(1)} months`, color: WARM.orange },
                { label: 'Expected Overrun Value', value: `₹${Math.round(+(selected.expected_overrun_value_cr ?? 0)).toLocaleString()} Cr`, color: WARM.red },
              ].map(item => (
                <div key={item.label} style={{ padding: '10px 12px', background: '#fafafa', borderRadius: '7px' }}>
                  <div style={{ fontSize: '10.5px', color: WARM.muted, fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fff7ed', borderRadius: '7px', fontSize: '11px', color: '#9a3412' }}>
              <strong>Predicted at:</strong> {selected.predicted_at ? new Date(selected.predicted_at).toLocaleString('en-IN') : '—'}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
