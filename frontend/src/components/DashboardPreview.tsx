import { useState } from 'react'

type ProjectRow = {
  id: string
  name: string
  ministry: string
  costCr: number
  physicalPct: number
  delayProb: number
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low'
  intervention: string
}

const MOCK_PROJECTS: Record<string, ProjectRow[]> = {
  All: [
    { id: 'NH-44-PKG4', name: 'NH-44 Corridor 6-Laning (Jhansi-Lalitpur)', ministry: 'Road Transport', costCr: 1420, physicalPct: 64, delayProb: 0.88, riskLevel: 'Critical', intervention: 'Land Acquisition Expedited' },
    { id: 'WDFC-JNPT', name: 'Western DFC (Vadodara–JNPT Freight Rail)', ministry: 'Railways', costCr: 6850, physicalPct: 78, delayProb: 0.74, riskLevel: 'High', intervention: 'Bridge Girder Clearance' },
    { id: 'GRID-NE-5', name: 'North-East 400kV Transmission Ring Ph-II', ministry: 'Power', costCr: 890, physicalPct: 91, delayProb: 0.22, riskLevel: 'Low', intervention: 'On Schedule' },
    { id: 'GAIL-URJA', name: 'Pradhan Mantri Urja Ganga Pipeline (Sec-3)', ministry: 'Petroleum', costCr: 3240, physicalPct: 83, delayProb: 0.49, riskLevel: 'Moderate', intervention: 'River Crossing Review' },
    { id: 'MAHA-METRO', name: 'Pune Metro Rail Extension Line 3', ministry: 'Urban Affairs', costCr: 2180, physicalPct: 71, delayProb: 0.81, riskLevel: 'Critical', intervention: 'ROW Clearance Escalated' },
  ],
  Roads: [
    { id: 'NH-44-PKG4', name: 'NH-44 Corridor 6-Laning (Jhansi-Lalitpur)', ministry: 'Road Transport', costCr: 1420, physicalPct: 64, delayProb: 0.88, riskLevel: 'Critical', intervention: 'Land Acquisition Expedited' },
    { id: 'NH-27-EXP', name: 'East-West Corridor Bypass (Silchar)', ministry: 'Road Transport', costCr: 940, physicalPct: 58, delayProb: 0.68, riskLevel: 'High', intervention: 'Monsoon Mitigation' },
    { id: 'DEL-AMR-EX', name: 'Delhi-Amritsar-Katra Expressway Pkg 8', ministry: 'Road Transport', costCr: 2450, physicalPct: 84, delayProb: 0.31, riskLevel: 'Low', intervention: 'Paving Commenced' },
  ],
  Railways: [
    { id: 'WDFC-JNPT', name: 'Western DFC (Vadodara–JNPT Freight Rail)', ministry: 'Railways', costCr: 6850, physicalPct: 78, delayProb: 0.74, riskLevel: 'High', intervention: 'Bridge Girder Clearance' },
    { id: 'USBRL-TUN', name: 'Udhampur-Srinagar-Baramulla Tunnel T-49', ministry: 'Railways', costCr: 4120, physicalPct: 96, delayProb: 0.25, riskLevel: 'Low', intervention: 'Final Signalling' },
    { id: 'MUM-AHM-HSR', name: 'Mumbai-Ahmedabad High Speed Rail (Pier Works)', ministry: 'Railways', costCr: 12500, physicalPct: 52, delayProb: 0.82, riskLevel: 'Critical', intervention: 'Undersea Tunnel TBM' },
  ],
  Power: [
    { id: 'GRID-NE-5', name: 'North-East 400kV Transmission Ring Ph-II', ministry: 'Power', costCr: 890, physicalPct: 91, delayProb: 0.22, riskLevel: 'Low', intervention: 'On Schedule' },
    { id: 'SOLAR-LEH', name: '10GW Renewable Energy Park (Pang-Leh)', ministry: 'Power', costCr: 5400, physicalPct: 38, delayProb: 0.79, riskLevel: 'Critical', intervention: 'BESS Battery Tendering' },
  ],
  Petroleum: [
    { id: 'GAIL-URJA', name: 'Pradhan Mantri Urja Ganga Pipeline (Sec-3)', ministry: 'Petroleum', costCr: 3240, physicalPct: 83, delayProb: 0.49, riskLevel: 'Moderate', intervention: 'River Crossing Review' },
    { id: 'BARMER-REF', name: 'HPCL Rajasthan Refinery Complex (9 MMTPA)', ministry: 'Petroleum', costCr: 7200, physicalPct: 88, delayProb: 0.39, riskLevel: 'Moderate', intervention: 'Pre-Commissioning' },
  ],
}

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const rows = MOCK_PROJECTS[activeTab] || MOCK_PROJECTS.All

  const getRiskBadgeClass = (level: ProjectRow['riskLevel']) => {
    switch (level) {
      case 'Critical': return 'badge-red'
      case 'High': return 'badge-saffron'
      case 'Moderate': return 'badge-amber'
      case 'Low': return 'badge-green'
    }
  }

  return (
    <section className="section section-subtle" id="dashboard">
      <div className="section-header">
        <span className="eyebrow">Interactive Console Preview</span>
        <h2>Monitor 1,600+ Mega-Projects at a Glance</h2>
        <p>
          High-fidelity multi-tier telemetry tracking project expenditure, physical milestones,
          and ML risk segment projections in real time.
        </p>
      </div>

      <div className="dashboard-preview-card">
        {/* Window Chrome */}
        <div className="dashboard-window-bar">
          <div className="window-dots">
            <span className="window-dot red" />
            <span className="window-dot yellow" />
            <span className="window-dot green" />
          </div>
          <span className="window-title">MoSPI IPMD — Nirikshan Executive Risk Console (PAIMANA Live)</span>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>● SECURE HTTPS / TLS 1.3</span>
        </div>

        {/* Dashboard Body */}
        <div className="dashboard-body">
          {/* Top KPI row */}
          <div className="mockup-kpis">
            <div className="mockup-kpi-card">
              <div className="mockup-kpi-title">Active Monitored</div>
              <div className="mockup-kpi-val" style={{ color: '#1d4ed8' }}>1,614</div>
              <span style={{ fontSize: '0.75rem', color: '#059669' }}>↑ 12 new this quarter</span>
            </div>
            <div className="mockup-kpi-card">
              <div className="mockup-kpi-title">Critical Attention</div>
              <div className="mockup-kpi-val" style={{ color: '#dc2626' }}>87</div>
              <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Requires Ministry Intervention</span>
            </div>
            <div className="mockup-kpi-card">
              <div className="mockup-kpi-title">High Slippage Risk</div>
              <div className="mockup-kpi-val" style={{ color: '#ea580c' }}>234</div>
              <span style={{ fontSize: '0.75rem', color: '#ea580c' }}>Delay Prob &gt; 65%</span>
            </div>
            <div className="mockup-kpi-card">
              <div className="mockup-kpi-title">On Schedule / Low Risk</div>
              <div className="mockup-kpi-val" style={{ color: '#059669' }}>1,293</div>
              <span style={{ fontSize: '0.75rem', color: '#059669' }}>80.1% Portfolio Health</span>
            </div>
          </div>

          {/* Ministry Filter Tabs */}
          <div className="mockup-tabs">
            {['All', 'Roads', 'Railways', 'Power', 'Petroleum'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`mockup-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'All' ? 'All Ministries' : tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Project Code & Title</th>
                  <th>Ministry</th>
                  <th>Cost (₹ Cr)</th>
                  <th>Physical Progress</th>
                  <th>Delay Risk</th>
                  <th>Severity</th>
                  <th>Action Trigger</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.id}</span>
                    </td>
                    <td>{row.ministry}</td>
                    <td style={{ fontWeight: 600 }}>₹{row.costCr.toLocaleString()} Cr</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '60px', overflow: 'hidden' }}>
                          <div style={{ width: `${row.physicalPct}%`, height: '100%', background: row.physicalPct > 75 ? '#059669' : '#1d4ed8' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{row.physicalPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: row.delayProb > 0.7 ? '#dc2626' : row.delayProb > 0.5 ? '#ea580c' : '#059669' }}>
                        {(row.delayProb * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge-tag ${getRiskBadgeClass(row.riskLevel)}`}>
                        {row.riskLevel}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {row.intervention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
