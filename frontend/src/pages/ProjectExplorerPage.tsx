import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, AlertTriangle, Building2 } from 'lucide-react'
import { StateDistributionMap } from '../components/StateDistributionMap'

interface StatePanelItem {
  state: string
  projectCount: number
  totalCostCr: number
  highRiskCount: number
}

export function ProjectExplorerPage() {
  const [stats, setStats]         = useState<StatePanelItem[]>([])
  const [selected, setSelected]   = useState<StatePanelItem | null>(null)
  const [loading, setLoading]     = useState(true)
  const [totalProjects, setTotal] = useState(0)
  const [totalCost, setTotalCost] = useState(0)

  const token = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/projects?limit=1000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=500',    { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([projects, alerts]: [any[], any[]]) => {
      setTotal(projects.length)
      setTotalCost(projects.reduce((s: number, p: any) => s + (+p.original_cost_cr || 0), 0))

      // Build state-level aggregation from project ministry/agency (state data not in /projects without states join)
      // Use ministry as proxy grouping since states join not returned by default
      const ministryMap: Record<string, StatePanelItem> = {}
      projects.forEach((p: any) => {
        const key = p.ministry?.name ?? 'Unknown Ministry'
        if (!ministryMap[key]) ministryMap[key] = { state: key, projectCount: 0, totalCostCr: 0, highRiskCount: 0 }
        ministryMap[key].projectCount++
        ministryMap[key].totalCostCr += (+p.original_cost_cr || 0)
      })
      alerts.forEach((a: any) => {
        if (+a.risk_score >= 0.75) {
          const key = a.project?.ministry?.name ?? 'Unknown Ministry'
          if (ministryMap[key]) ministryMap[key].highRiskCount++
        }
      })
      setStats(Object.values(ministryMap).sort((a, b) => b.projectCount - a.projectCount))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '2px' }}>Project Explorer</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Geospatial distribution of infrastructure projects across India</p>
        </div>
        {!loading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'Total Projects', value: totalProjects.toLocaleString(), color: '#f97316' },
              { label: 'Total Outlay',   value: `₹${(totalCost/100).toFixed(0)}K Cr`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '12px' }}>
        {/* Map panel */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <StateDistributionMap onSelectState={(st: any) => {
            const match = stats.find(s => s.state.toLowerCase().includes(st.name?.toLowerCase() ?? ''))
            if (match) setSelected(match)
          }} />
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Selected state detail */}
          {selected ? (
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{selected.state}</div>
                <button onClick={() => setSelected(null)} style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              {[
                { label: 'Projects',    value: selected.projectCount.toString(),                            icon: Building2,    color: '#f97316' },
                { label: 'Total Cost',  value: `₹${(selected.totalCostCr/100).toFixed(0)}K Cr`,           icon: TrendingUp,   color: '#f59e0b' },
                { label: 'High Risk',   value: selected.highRiskCount.toString(),                           icon: AlertTriangle, color: '#ef4444' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ padding: '6px', background: '#fff7ed', borderRadius: '6px' }}>
                      <Icon size={14} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
              <MapPin size={28} color="#f97316" style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#c2410c', marginBottom: '4px' }}>Click a State</div>
              <div style={{ fontSize: '11.5px', color: '#9a3412' }}>Select any state on the map to view project details</div>
            </div>
          )}

          {/* Ministry-wise breakdown */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>Ministry-wise Distribution</div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '360px' }}>
                {stats.map((s, i) => {
                  const maxCount = stats[0]?.projectCount || 1
                  return (
                    <div key={i} onClick={() => setSelected(s)} style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: '7px', background: selected?.state === s.state ? '#fff7ed' : '#fafafa', border: `1px solid ${selected?.state === s.state ? '#fed7aa' : '#f1f5f9'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{s.state}</span>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f97316' }}>{s.projectCount}</span>
                      </div>
                      <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                        <div style={{ width: `${(s.projectCount / maxCount) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#f97316,#fb923c)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
