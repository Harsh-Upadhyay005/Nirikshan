import { useState, useEffect } from 'react'
import { FileText, Download, RefreshCw, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'

const WARM = { orange: '#f97316', amber: '#f59e0b', red: '#ef4444', teal: '#14b8a6', green: '#22c55e', border: '#e2e8f0', text: '#1e293b', muted: '#64748b' }

export function ReportsPage() {
  const [projects,  setProjects]  = useState<any[]>([])
  const [alerts,    setAlerts]    = useState<any[]>([])
  const [summary,   setSummary]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  const token   = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=1000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=500',    { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts/summary',      { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([p, a, s]) => { setProjects(p); setAlerts(a); setSummary(s) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function downloadCSV(filename: string, rows: string[][], headers: string[]) {
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function generateProjectReport() {
    setGenerating('projects')
    const rows = projects.map(p => [
      p.project_code, p.project_name,
      p.ministry?.name ?? '', p.category?.name ?? '', p.agency?.name ?? '',
      p.original_cost_cr, p.start_date ?? '', p.target_doc ?? '',
      p.is_multi_state ? 'Yes' : 'No',
    ])
    downloadCSV('nirikshan_projects_report.csv', rows, ['Code','Name','Ministry','Sector','Agency','Cost (Cr)','Start Date','Target DOC','Multi-State'])
    setTimeout(() => setGenerating(null), 800)
  }

  function generateRiskReport() {
    setGenerating('risk')
    const rows = alerts.map(a => [
      a.project?.project_code ?? '', a.project?.project_name ?? '',
      a.project?.ministry?.name ?? '', a.risk_segment ?? '',
      Math.round(+(a.risk_score||0)*100),
      Math.round(+(a.delay_probability||0)*100) + '%',
      Math.round(+(a.cost_overrun_probability||0)*100) + '%',
      +(a.expected_slippage_months||0).toFixed(1),
      Math.round(+(a.expected_overrun_value_cr||0)),
      a.predicted_at ? new Date(a.predicted_at).toLocaleDateString('en-IN') : '',
    ])
    downloadCSV('nirikshan_risk_report.csv', rows, ['Code','Project Name','Ministry','Risk Segment','Risk Score','Delay Prob.','Cost Overrun Prob.','Exp. Slippage (mo)','Exp. Overrun (Cr)','Predicted At'])
    setTimeout(() => setGenerating(null), 800)
  }

  // Derived stats
  const totalCost      = projects.reduce((s,p) => s + +(p.original_cost_cr||0), 0)
  const criticalCount  = alerts.filter(a => a.risk_segment === 'Critical Risk').length
  const highCount      = alerts.filter(a => a.risk_segment === 'High Risk').length
  const avgDelay       = alerts.length ? alerts.reduce((s,a)=>s+ +(a.delay_probability||0),0)/alerts.length : 0
  const totalOverrun   = alerts.reduce((s,a)=>s+ +(a.expected_overrun_value_cr||0),0)

  // Ministry-wise summary
  const minSummary: Record<string, { count: number; cost: number; alerts: number }> = {}
  projects.forEach(p => {
    const m = p.ministry?.name ?? 'Unknown'
    if (!minSummary[m]) minSummary[m] = { count: 0, cost: 0, alerts: 0 }
    minSummary[m].count++
    minSummary[m].cost += +(p.original_cost_cr||0)
  })
  alerts.forEach(a => {
    const m = a.project?.ministry?.name ?? 'Unknown'
    if (!minSummary[m]) minSummary[m] = { count: 0, cost: 0, alerts: 0 }
    minSummary[m].alerts++
  })
  const minRows = Object.entries(minSummary).sort((a,b) => b[1].count - a[1].count)

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>Reports</h1>
          <p style={{ fontSize: '12px', color: WARM.muted }}>Generate and export platform reports for stakeholders and audit purposes</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPI summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Total Projects',        value: projects.length.toLocaleString(), color: WARM.orange, icon: FileText     },
          { label: 'Total Sanctioned',      value: `₹${(totalCost/100).toFixed(0)}K Cr`, color: WARM.amber, icon: DollarSign },
          { label: 'Critical+High Alerts',  value: (criticalCount+highCount).toLocaleString(), color: WARM.red, icon: AlertTriangle },
          { label: 'Avg Delay Probability', value: `${Math.round(avgDelay*100)}%`,    color: WARM.amber, icon: Clock        },
          { label: 'Total Exp. Overrun',    value: `₹${Math.round(totalOverrun).toLocaleString()} Cr`, color: WARM.red, icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: WARM.muted }}>{label}</span>
              <div style={{ padding: '4px', background: '#fff7ed', borderRadius: '5px' }}><Icon size={12} color={color} /></div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '14px' }}>
        {[
          {
            id: 'projects', title: 'Project Portfolio Report',
            desc: 'Full list of all central sector projects with cost, timeline, ministry, and sector details.',
            rows: projects.length, icon: FileText, color: WARM.orange,
            action: generateProjectReport,
          },
          {
            id: 'risk', title: 'Risk Predictions Report',
            desc: 'ML-predicted risk scores, delay probability, expected slippage and cost overrun for all flagged projects.',
            rows: alerts.length, icon: AlertTriangle, color: WARM.red,
            action: generateRiskReport,
          },
          {
            id: 'summary', title: 'Alert Summary Report',
            desc: `${criticalCount} critical · ${highCount} high risk projects. Download aggregated alert summary as CSV.`,
            rows: criticalCount + highCount, icon: TrendingUp, color: WARM.amber,
            action: () => {
              setGenerating('summary')
              if (summary) {
                const rows = [[
                  summary.total_alerts, summary.critical_risk_count, summary.high_risk_count,
                  Math.round(summary.total_expected_overrun_cr),
                  Math.round(summary.average_delay_probability*100) + '%',
                  Math.round(summary.average_cost_overrun_probability*100) + '%',
                ]]
                downloadCSV('nirikshan_alert_summary.csv', rows, ['Total Alerts','Critical','High','Exp. Overrun (Cr)','Avg Delay Prob.','Avg Cost Overrun Prob.'])
              }
              setTimeout(() => setGenerating(null), 800)
            },
          },
        ].map(card => {
          const Icon = card.icon
          const isGen = generating === card.id
          return (
            <div key={card.id} style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#fff7ed', borderRadius: '8px' }}><Icon size={18} color={card.color} /></div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: WARM.text }}>{card.title}</div>
                  <div style={{ fontSize: '11px', color: WARM.muted }}>{card.rows} records</div>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: WARM.muted, lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
              <button onClick={card.action} disabled={loading || isGen}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', background: loading ? '#f1f5f9' : `linear-gradient(135deg,${card.color},${card.color}dd)`, color: loading ? '#94a3b8' : 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 'auto' }}>
                {isGen ? <CheckCircle2 size={13} /> : <Download size={13} />}
                {isGen ? 'Downloaded!' : 'Download CSV'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Ministry-wise summary table */}
      <div style={{ background: 'white', border: `1px solid ${WARM.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${WARM.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Ministry-wise Summary</span>
          <button onClick={() => {
            const rows = minRows.map(([name, d]) => [name, String(d.count), Math.round(d.cost).toLocaleString(), String(d.alerts)])
            downloadCSV('nirikshan_ministry_summary.csv', rows, ['Ministry','Projects','Total Cost (Cr)','Risk Alerts'])
          }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: '#fff7ed', color: WARM.orange, border: '1px solid #fed7aa', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>
            <Download size={11} /> Export
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', fontSize: '10.5px', fontWeight: 700, color: WARM.muted, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                <th style={{ padding: '9px 14px', textAlign: 'left', borderBottom: `1px solid ${WARM.border}` }}>Ministry</th>
                <th style={{ padding: '9px 14px', textAlign: 'right', borderBottom: `1px solid ${WARM.border}` }}>Projects</th>
                <th style={{ padding: '9px 14px', textAlign: 'right', borderBottom: `1px solid ${WARM.border}` }}>Total Cost (Cr)</th>
                <th style={{ padding: '9px 14px', textAlign: 'right', borderBottom: `1px solid ${WARM.border}` }}>Risk Alerts</th>
                <th style={{ padding: '9px 14px', textAlign: 'left', borderBottom: `1px solid ${WARM.border}` }}>Alert Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Loading…</td></tr>
              ) : minRows.map(([name, d], i) => {
                const rate = d.count > 0 ? Math.round((d.alerts/d.count)*100) : 0
                return (
                  <tr key={name} style={{ borderTop: '1px solid #f1f5f9', background: i%2===0 ? 'white' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background='#fffbf5'}
                    onMouseLeave={e => e.currentTarget.style.background=i%2===0?'white':'#fafafa'}>
                    <td style={{ padding: '9px 14px', fontSize: '12.5px', fontWeight: 600, color: WARM.text }}>{name}</td>
                    <td style={{ padding: '9px 14px', fontSize: '12.5px', fontWeight: 700, color: WARM.orange, textAlign: 'right' }}>{d.count}</td>
                    <td style={{ padding: '9px 14px', fontSize: '12px', fontFamily: 'monospace', textAlign: 'right', color: WARM.text }}>{Math.round(d.cost).toLocaleString()}</td>
                    <td style={{ padding: '9px 14px', fontSize: '12.5px', fontWeight: 700, color: d.alerts > 0 ? WARM.red : WARM.muted, textAlign: 'right' }}>{d.alerts}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '60px', height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
                          <div style={{ width: `${Math.min(rate,100)}%`, height: '100%', background: rate>=50?WARM.red:rate>=25?WARM.orange:WARM.amber, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: WARM.muted }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
