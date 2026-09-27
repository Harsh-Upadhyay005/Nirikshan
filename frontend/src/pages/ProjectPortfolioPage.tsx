import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search, ChevronDown, ChevronUp, RefreshCw, LayoutGrid, List,
  AlertTriangle, TrendingUp, Clock, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, X, BarChart3, Activity, Shield,
  ChevronRight, Filter, SortAsc
} from 'lucide-react'

/* ─── Data interfaces ─── */
interface Snapshot {
  id: number
  project_id: number
  report_month: string
  revised_doc: string | null
  revised_cost_cr: string | null
  cumulative_expenditure_cr: string | null
  physical_progress_pct: string | null
  is_delayed: boolean | null
  is_cost_overrun: boolean | null
  schedule_slippage_months: number | null
  cost_overrun_pct: string | null
}

interface Prediction {
  id: number
  project_id: number
  model_version: string
  delay_probability: string | null
  cost_overrun_probability: string | null
  expected_slippage_months: string | null
  expected_overrun_value_cr: string | null
  risk_segment: string | null
  risk_score: string | null
  needs_alert: boolean
  predicted_at: string
}

interface Project {
  id: number
  project_code: number
  project_name: string
  original_cost_cr: string
  start_date: string
  target_doc: string | null
  is_multi_state: boolean
  ministry: { id: number; name: string } | null
  category: { id: number; name: string } | null
  agency: { id: number; name: string } | null
}

interface AlertData {
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

/* Merged project+risk info for display */
interface EnrichedProject {
  project: Project
  riskScore: number
  riskSegment: string
  delayProb: number
  costOverrunProb: number
  slippageMonths: number
  overrunValueCr: number
  physicalProgress: number
  expenditureCr: number
  revisedCostCr: number
  isDelayed: boolean
  isCostOverrun: boolean
  snapshots: Snapshot[]
  predictions: Prediction[]
}

/* ─── Constants ─── */
const RISK_COLORS: Record<string, string> = {
  'Critical Risk': '#ef4444',
  'High Risk': '#f97316',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#22c55e',
}
const RISK_BG: Record<string, string> = {
  'Critical Risk': '#fef2f2',
  'High Risk': '#fff7ed',
  'Medium Risk': '#fefce8',
  'Low Risk': '#f0fdf4',
}
const ALL_RISK_LEVELS = ['Critical Risk', 'High Risk', 'Medium Risk', 'Low Risk']

type SortKey = 'cost' | 'risk' | 'progress' | 'name' | 'slippage'
type ViewMode = 'cards' | 'table'

/* ─── Helper: risk segment from score ─── */
function segmentFromScore(score: number): string {
  if (score >= 0.75) return 'Critical Risk'
  if (score >= 0.55) return 'High Risk'
  if (score >= 0.35) return 'Medium Risk'
  return 'Low Risk'
}

/* ─── Main Component ─── */
export function ProjectPortfolioPage() {
  const [projects, setProjects]       = useState<Project[]>([])
  const [alerts, setAlerts]           = useState<AlertData[]>([])
  const [ministries, setMinistries]   = useState<{ id: number; name: string }[]>([])
  const [categories, setCategories]   = useState<{ id: number; name: string }[]>([])
  const [states, setStates]           = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterMinistry, setFilterMinistry] = useState('')
  const [filterRisk, setFilterRisk]         = useState('')
  const [filterSector, setFilterSector]     = useState('')
  const [filterState, setFilterState]       = useState('')
  const [sortKey, setSortKey]               = useState<SortKey>('risk')
  const [sortAsc, setSortAsc]               = useState(false)
  const [viewMode, setViewMode]             = useState<ViewMode>('cards')
  const [selectedProject, setSelectedProject] = useState<EnrichedProject | null>(null)
  const [detailLoading, setDetailLoading]     = useState(false)
  const [detailSnapshots, setDetailSnapshots] = useState<Snapshot[]>([])
  const [detailPredictions, setDetailPredictions] = useState<Prediction[]>([])
  const [page, setPage] = useState(1)
  const PAGE_SIZE = viewMode === 'cards' ? 12 : 20

  const token = localStorage.getItem('nirikshan_token') ?? ''
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  /* ─── Data loading ─── */
  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=5000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=5000',   { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/ministries',           { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/categories',           { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/states',               { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([p, a, m, c, s]) => {
      setProjects(p)
      setAlerts(a)
      setMinistries(m)
      setCategories(c)
      setStates(s)
    }).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  /* ─── Build enriched project list ─── */
  const enriched: EnrichedProject[] = useMemo(() => {
    // Index alerts by project_id
    const alertMap = new Map<number, AlertData>()
    alerts.forEach(a => {
      const pid = a.project_id
      const existing = alertMap.get(pid)
      if (!existing || (+a.risk_score! || 0) > (+existing.risk_score! || 0)) {
        alertMap.set(pid, a)
      }
    })

    return projects.map(p => {
      const alert = alertMap.get(p.id)
      const riskScore = alert ? (+alert.risk_score! || 0) : 0
      const riskSegment = alert?.risk_segment || segmentFromScore(riskScore)
      return {
        project: p,
        riskScore,
        riskSegment,
        delayProb: alert ? (+alert.delay_probability! || 0) : 0,
        costOverrunProb: alert ? (+alert.cost_overrun_probability! || 0) : 0,
        slippageMonths: alert ? (+alert.expected_slippage_months! || 0) : 0,
        overrunValueCr: alert ? (+alert.expected_overrun_value_cr! || 0) : 0,
        physicalProgress: 0,  // will be updated from snapshot
        expenditureCr: 0,
        revisedCostCr: +p.original_cost_cr || 0,
        isDelayed: false,
        isCostOverrun: false,
        snapshots: [],
        predictions: [],
      }
    })
  }, [projects, alerts])

  /* ─── Filtering & Sorting ─── */
  const filtered = useMemo(() => {
    let list = [...enriched]

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.project.project_name.toLowerCase().includes(q) ||
        String(e.project.project_code).includes(q) ||
        (e.project.ministry?.name ?? '').toLowerCase().includes(q) ||
        (e.project.agency?.name ?? '').toLowerCase().includes(q)
      )
    }

    // Filters
    if (filterMinistry) list = list.filter(e => e.project.ministry?.name === filterMinistry)
    if (filterSector)   list = list.filter(e => e.project.category?.name === filterSector)
    if (filterRisk)     list = list.filter(e => e.riskSegment === filterRisk)
    // State filter — if the project name or agency contains state name as a proxy
    if (filterState) {
      const st = filterState.toLowerCase()
      list = list.filter(e =>
        e.project.project_name.toLowerCase().includes(st) ||
        (e.project.agency?.name ?? '').toLowerCase().includes(st)
      )
    }

    // Sort
    list.sort((a, b) => {
      let va = 0, vb = 0
      switch (sortKey) {
        case 'cost':     va = +a.project.original_cost_cr || 0; vb = +b.project.original_cost_cr || 0; break
        case 'risk':     va = a.riskScore; vb = b.riskScore; break
        case 'progress': va = a.physicalProgress; vb = b.physicalProgress; break
        case 'slippage': va = a.slippageMonths; vb = b.slippageMonths; break
        case 'name':     return sortAsc
          ? a.project.project_name.localeCompare(b.project.project_name)
          : b.project.project_name.localeCompare(a.project.project_name)
      }
      return sortAsc ? va - vb : vb - va
    })

    return list
  }, [enriched, search, filterMinistry, filterSector, filterRisk, filterState, sortKey, sortAsc])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  /* ─── Stats ─── */
  const totalCostCr = filtered.reduce((s, e) => s + (+e.project.original_cost_cr || 0), 0)
  const criticalCount = filtered.filter(e => e.riskSegment === 'Critical Risk').length
  const highRiskCount = filtered.filter(e => e.riskSegment === 'High Risk').length

  /* ─── Detail Panel ─── */
  const openDetail = useCallback((ep: EnrichedProject) => {
    setSelectedProject(ep)
    setDetailLoading(true)
    setDetailSnapshots([])
    setDetailPredictions([])

    // Fetch project detail with snapshots & predictions
    Promise.all([
      fetch(`/api/v1/projects/${ep.project.id}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`/api/v1/alerts?limit=100`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([detail, allAlerts]) => {
      if (detail?.snapshots) setDetailSnapshots(detail.snapshots)
      // Get predictions for this project from alerts
      const projectAlerts = (allAlerts as AlertData[]).filter(a => a.project_id === ep.project.id)
      const preds: Prediction[] = projectAlerts.map(a => ({
        id: a.id,
        project_id: a.project_id,
        model_version: 'v1.0',
        delay_probability: a.delay_probability,
        cost_overrun_probability: a.cost_overrun_probability,
        expected_slippage_months: a.expected_slippage_months,
        expected_overrun_value_cr: a.expected_overrun_value_cr,
        risk_segment: a.risk_segment,
        risk_score: a.risk_score,
        needs_alert: a.needs_alert,
        predicted_at: a.predicted_at,
      }))
      setDetailPredictions(preds)
    }).finally(() => setDetailLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeFilters = [filterMinistry, filterRisk, filterSector, filterState, search].filter(Boolean).length

  /* ─── RENDER ─── */
  return (
    <div style={{ padding: '16px 20px', position: 'relative', minHeight: '100%' }}>

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="#f97316" /> Project Portfolio
          </h1>
          <p style={{ fontSize: '12.5px', color: '#64748b' }}>
            {loading ? 'Loading…' : `${filtered.length} projects · ₹${(totalCostCr / 100).toFixed(0)}K Cr total outlay`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => { setViewMode('cards'); setPage(1) }}
              style={{ ...viewToggleStyle, background: viewMode === 'cards' ? '#f97316' : 'white', color: viewMode === 'cards' ? 'white' : '#64748b' }}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => { setViewMode('table'); setPage(1) }}
              style={{ ...viewToggleStyle, background: viewMode === 'table' ? '#f97316' : 'white', color: viewMode === 'table' ? 'white' : '#64748b' }}>
              <List size={14} />
            </button>
          </div>
          <button onClick={load} style={refreshBtnStyle}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Summary KPI Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Total Projects', value: filtered.length.toLocaleString(), icon: Building2, color: '#f97316', bg: '#fff7ed' },
          { label: 'Total Outlay', value: `₹${(totalCostCr / 100).toFixed(0)}K Cr`, icon: DollarSign, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Critical Risk', value: criticalCount.toString(), icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
          { label: 'High Risk', value: highRiskCount.toString(), icon: TrendingUp, color: '#f97316', bg: '#fff7ed' },
        ].map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} style={kpiCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: kpi.bg, borderRadius: '8px' }}>
                  <Icon size={16} color={kpi.color} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Filters Bar ─── */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center',
        padding: '10px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px',
      }}>
        <Filter size={14} color="#94a3b8" />

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search projects…"
            style={searchInputStyle}
            onFocus={e => e.target.style.borderColor = '#f97316'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>

        {/* Ministry filter */}
        <select value={filterMinistry} onChange={e => { setFilterMinistry(e.target.value); setPage(1) }}
          style={selectStyle(!!filterMinistry)}>
          <option value="">All Ministries</option>
          {ministries.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>

        {/* Risk Level filter */}
        <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1) }}
          style={selectStyle(!!filterRisk)}>
          <option value="">All Risk Levels</option>
          {ALL_RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Sector filter */}
        <select value={filterSector} onChange={e => { setFilterSector(e.target.value); setPage(1) }}
          style={selectStyle(!!filterSector)}>
          <option value="">All Sectors</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {/* State filter */}
        <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1) }}
          style={selectStyle(!!filterState)}>
          <option value="">All States</option>
          {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          <SortAsc size={13} color="#94a3b8" />
          <select value={sortKey} onChange={e => { setSortKey(e.target.value as SortKey); setPage(1) }}
            style={{ ...selectStyle(false), fontWeight: 700, fontSize: '11.5px' }}>
            <option value="risk">Sort: Risk Score</option>
            <option value="cost">Sort: Project Cost</option>
            <option value="progress">Sort: Progress %</option>
            <option value="slippage">Sort: Slippage</option>
            <option value="name">Sort: Name</option>
          </select>
          <button onClick={() => setSortAsc(a => !a)}
            style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {sortAsc ? <ChevronUp size={13} color="#64748b" /> : <ChevronDown size={13} color="#64748b" />}
          </button>
        </div>

        {activeFilters > 0 && (
          <button onClick={() => { setFilterMinistry(''); setFilterRisk(''); setFilterSector(''); setFilterState(''); setSearch(''); setPage(1) }}
            style={clearBtnStyle}>
            Clear ({activeFilters}) ×
          </button>
        )}
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div style={{ fontSize: '13px' }}>Loading projects…</div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
          <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px', color: '#64748b' }}>No projects found</div>
          <div style={{ fontSize: '12px' }}>Try adjusting your filters or search terms.</div>
        </div>
      ) : viewMode === 'cards' ? (
        /* ═══ Card View ═══ */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {paginated.map(ep => (
            <ProjectCard key={ep.project.id} ep={ep} onClick={() => openDetail(ep)} />
          ))}
        </div>
      ) : (
        /* ═══ Table (Explorer) View ═══ */
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Code</th>
                  <th style={{ ...thStyle, width: '24%' }}>Project Name</th>
                  <th style={thStyle}>Ministry</th>
                  <th style={thStyle}>Sector</th>
                  <th style={thStyle}>Cost (Cr)</th>
                  <th style={thStyle}>Risk</th>
                  <th style={thStyle}>Delay %</th>
                  <th style={thStyle}>Slippage</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(ep => {
                  const seg = ep.riskSegment
                  return (
                    <tr key={ep.project.id}
                      style={{ transition: 'background .15s', cursor: 'pointer' }}
                      onClick={() => openDetail(ep)}
                      onMouseEnter={e => e.currentTarget.style.background = '#fffbf5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11.5px', color: '#f97316', fontWeight: 700 }}>{ep.project.project_code}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, maxWidth: '220px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ep.project.project_name}>{ep.project.project_name}</div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '11.5px', maxWidth: '130px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ep.project.ministry?.name}>{ep.project.ministry?.name ?? '—'}</div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '11.5px' }}>{ep.project.category?.name ?? '—'}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#f97316', textAlign: 'right', fontFamily: 'monospace' }}>
                        {Number(ep.project.original_cost_cr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: '10.5px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700,
                          background: RISK_BG[seg] || '#f8fafc', color: RISK_COLORS[seg] || '#94a3b8',
                        }}>{seg || 'N/A'}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: ep.delayProb > 0.7 ? '#ef4444' : ep.delayProb > 0.4 ? '#f59e0b' : '#22c55e' }}>
                        {ep.delayProb > 0 ? `${(ep.delayProb * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', color: ep.slippageMonths > 12 ? '#ef4444' : '#64748b' }}>
                        {ep.slippageMonths > 0 ? `${ep.slippageMonths.toFixed(1)}m` : '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '11.5px', fontFamily: 'monospace' }}>{ep.project.start_date}</td>
                      <td style={tdStyle}>
                        <ChevronRight size={14} color="#94a3b8" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Page {page} of {totalPages} · Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={pageBtnStyle(page === 1)}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={pageBtnStyle(page === 1)}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return <button key={pg} onClick={() => setPage(pg)} style={pageBtnStyle(false, pg === page)}>{pg}</button>
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>»</button>
          </div>
        </div>
      )}

      {/* ─── Detail Slide-in Panel ─── */}
      {selectedProject && (
        <>
          {/* Overlay */}
          <div onClick={() => setSelectedProject(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 999, transition: 'opacity .2s' }} />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '92vw',
            background: 'white', zIndex: 1000, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', animation: 'slideIn .25s ease-out',
          }}>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

            {/* Panel Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, marginRight: '12px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#f97316', fontWeight: 700, marginBottom: '4px' }}>
                  #{selectedProject.project.project_code}
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3, marginBottom: '6px' }}>
                  {selectedProject.project.project_name}
                </h2>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedProject.project.ministry && (
                    <span style={detailTagStyle('#fff7ed', '#c2410c')}>
                      <Building2 size={10} /> {selectedProject.project.ministry.name}
                    </span>
                  )}
                  {selectedProject.project.category && (
                    <span style={detailTagStyle('#f0fdf4', '#166534')}>
                      {selectedProject.project.category.name}
                    </span>
                  )}
                  <span style={{
                    ...detailTagStyle(RISK_BG[selectedProject.riskSegment] || '#f8fafc', RISK_COLORS[selectedProject.riskSegment] || '#94a3b8'),
                    fontWeight: 800,
                  }}>
                    <Shield size={10} /> {selectedProject.riskSegment || 'N/A'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedProject(null)}
                style={{ padding: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading details…</div>
              ) : (
                <>
                  {/* Key Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                    {[
                      { label: 'Original Cost', value: `₹${Number(selectedProject.project.original_cost_cr).toLocaleString('en-IN')} Cr`, icon: DollarSign, color: '#f97316' },
                      { label: 'Risk Score', value: `${(selectedProject.riskScore * 100).toFixed(0)}%`, icon: AlertTriangle, color: RISK_COLORS[selectedProject.riskSegment] || '#64748b' },
                      { label: 'Delay Probability', value: `${(selectedProject.delayProb * 100).toFixed(0)}%`, icon: Clock, color: selectedProject.delayProb > 0.7 ? '#ef4444' : '#f59e0b' },
                      { label: 'Cost Overrun Prob', value: `${(selectedProject.costOverrunProb * 100).toFixed(0)}%`, icon: TrendingUp, color: selectedProject.costOverrunProb > 0.5 ? '#ef4444' : '#f59e0b' },
                      { label: 'Expected Slippage', value: selectedProject.slippageMonths > 0 ? `${selectedProject.slippageMonths.toFixed(1)} months` : 'N/A', icon: ArrowDownRight, color: '#ef4444' },
                      { label: 'Overrun Value', value: selectedProject.overrunValueCr > 0 ? `₹${selectedProject.overrunValueCr.toFixed(0)} Cr` : 'N/A', icon: ArrowUpRight, color: '#dc2626' },
                    ].map(m => {
                      const Icon = m.icon
                      return (
                        <div key={m.label} style={{
                          padding: '12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Icon size={13} color={m.color} />
                            <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>{m.label}</span>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 900, color: m.color }}>{m.value}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Timeline */}
                  <div style={sectionHeaderStyle}>
                    <Clock size={13} color="#f97316" /> Timeline
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                    <div style={timelineBoxStyle}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Start Date</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{selectedProject.project.start_date || '—'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0' }}>→</div>
                    <div style={timelineBoxStyle}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Target DOC</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: selectedProject.project.target_doc ? '#1e293b' : '#94a3b8', fontFamily: 'monospace' }}>{selectedProject.project.target_doc || 'Not set'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0' }}>→</div>
                    <div style={timelineBoxStyle}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Agency</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }} title={selectedProject.project.agency?.name}>{selectedProject.project.agency?.name || '—'}</div>
                    </div>
                  </div>

                  {/* Cost History from Snapshots */}
                  {detailSnapshots.length > 0 && (
                    <>
                      <div style={sectionHeaderStyle}>
                        <DollarSign size={13} color="#f97316" /> Cost History & Progress
                      </div>
                      <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9', padding: '12px', marginBottom: '18px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                          <thead>
                            <tr>
                              <th style={miniThStyle}>Month</th>
                              <th style={miniThStyle}>Revised Cost</th>
                              <th style={miniThStyle}>Expenditure</th>
                              <th style={miniThStyle}>Progress</th>
                              <th style={miniThStyle}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailSnapshots.slice(-6).map(s => (
                              <tr key={s.id}>
                                <td style={miniTdStyle}>{s.report_month}</td>
                                <td style={{ ...miniTdStyle, fontFamily: 'monospace', fontWeight: 600 }}>
                                  {s.revised_cost_cr ? `₹${Number(s.revised_cost_cr).toLocaleString('en-IN')}` : '—'}
                                </td>
                                <td style={{ ...miniTdStyle, fontFamily: 'monospace' }}>
                                  {s.cumulative_expenditure_cr ? `₹${Number(s.cumulative_expenditure_cr).toLocaleString('en-IN')}` : '—'}
                                </td>
                                <td style={miniTdStyle}>
                                  {s.physical_progress_pct ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <div style={{ width: '50px', height: '5px', background: '#e2e8f0', borderRadius: '3px' }}>
                                        <div style={{ width: `${Math.min(100, +s.physical_progress_pct)}%`, height: '100%', background: '#f97316', borderRadius: '3px' }} />
                                      </div>
                                      <span style={{ fontWeight: 600, fontSize: '11px' }}>{(+s.physical_progress_pct).toFixed(0)}%</span>
                                    </div>
                                  ) : '—'}
                                </td>
                                <td style={miniTdStyle}>
                                  {s.is_delayed && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '10px' }}>DELAYED</span>}
                                  {s.is_cost_overrun && <span style={{ color: '#f97316', fontWeight: 700, fontSize: '10px', marginLeft: s.is_delayed ? 4 : 0 }}>OVERRUN</span>}
                                  {!s.is_delayed && !s.is_cost_overrun && <span style={{ color: '#22c55e', fontSize: '10px' }}>OK</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* ML Predictions History */}
                  {detailPredictions.length > 0 && (
                    <>
                      <div style={sectionHeaderStyle}>
                        <Activity size={13} color="#f97316" /> ML Prediction History
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                        {detailPredictions.slice(0, 5).map(pred => (
                          <div key={pred.id} style={{
                            padding: '10px 12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{
                                  fontSize: '10px', padding: '2px 8px', borderRadius: '12px', fontWeight: 700,
                                  background: RISK_BG[pred.risk_segment || ''] || '#f8fafc',
                                  color: RISK_COLORS[pred.risk_segment || ''] || '#94a3b8',
                                }}>{pred.risk_segment || 'N/A'}</span>
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                  {new Date(pred.predicted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Delay: {pred.delay_probability ? `${(+pred.delay_probability * 100).toFixed(0)}%` : '—'}
                                {' · '}
                                Overrun: {pred.cost_overrun_probability ? `${(+pred.cost_overrun_probability * 100).toFixed(0)}%` : '—'}
                                {pred.expected_slippage_months && +pred.expected_slippage_months > 0 ? ` · ${(+pred.expected_slippage_months).toFixed(1)}m slippage` : ''}
                              </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'monospace', color: RISK_COLORS[pred.risk_segment || ''] || '#64748b' }}>
                              {pred.risk_score ? `${(+pred.risk_score * 100).toFixed(0)}` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {detailSnapshots.length === 0 && detailPredictions.length === 0 && !detailLoading && (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '12.5px' }}>
                      <BarChart3 size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
                      <div>No snapshot or prediction data available for this project yet.</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════
   Project Card Component
   ═══════════════════════════════════════════════════ */
function ProjectCard({ ep, onClick }: { ep: EnrichedProject; onClick: () => void }) {
  const seg = ep.riskSegment
  const riskColor = RISK_COLORS[seg] || '#94a3b8'
  const riskBg = RISK_BG[seg] || '#f8fafc'

  return (
    <div onClick={onClick} style={{
      background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
      overflow: 'hidden', cursor: 'pointer', transition: 'all .2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(249,115,22,0.12)'; e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}>

      {/* Risk strip */}
      <div style={{ height: '3px', background: riskColor }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Top row: badge + code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{
            fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 800,
            background: riskBg, color: riskColor,
          }}>{seg || 'Unrated'}</span>
          <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8', fontWeight: 600 }}>
            #{ep.project.project_code}
          </span>
        </div>

        {/* Project name */}
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ep.project.project_name}
        </h3>

        {/* Ministry + Sector tags */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {ep.project.ministry && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#fff7ed', color: '#c2410c', fontWeight: 600 }}>
              {ep.project.ministry.name.length > 28 ? ep.project.ministry.name.slice(0, 28) + '…' : ep.project.ministry.name}
            </span>
          )}
          {ep.project.category && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#166534', fontWeight: 600 }}>
              {ep.project.category.name}
            </span>
          )}
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
          <MetricMini icon={DollarSign} label="Cost" value={`₹${Number(ep.project.original_cost_cr).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`} color="#f97316" />
          <MetricMini icon={AlertTriangle} label="Risk" value={`${(ep.riskScore * 100).toFixed(0)}%`} color={riskColor} />
          <MetricMini icon={Clock} label="Delay" value={ep.delayProb > 0 ? `${(ep.delayProb * 100).toFixed(0)}%` : '—'} color={ep.delayProb > 0.7 ? '#ef4444' : '#f59e0b'} />
          <MetricMini icon={TrendingUp} label="Overrun" value={ep.costOverrunProb > 0 ? `${(ep.costOverrunProb * 100).toFixed(0)}%` : '—'} color={ep.costOverrunProb > 0.5 ? '#ef4444' : '#22c55e'} />
        </div>

        {/* Physical progress bar (dummy for now — 0%) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Physical Progress</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#f97316' }}>{ep.physicalProgress.toFixed(0)}%</span>
          </div>
          <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px' }}>
            <div style={{ width: `${Math.min(100, ep.physicalProgress)}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #fb923c)', borderRadius: '3px', transition: 'width .3s' }} />
          </div>
        </div>

        {/* Footer: view detail */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
            {ep.project.start_date}
          </span>
          <span style={{ fontSize: '10.5px', color: '#f97316', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
            View Profile <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </div>
  )
}


/* ─── Mini metric inside cards ─── */
function MetricMini({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}>
      <Icon size={11} color={color} />
      <div>
        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px' }}>{label}</div>
        <div style={{ fontSize: '12px', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════
   Inline Styles
   ═══════════════════════════════════════════════════ */

const viewToggleStyle: React.CSSProperties = {
  padding: '7px 10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
  transition: 'all .15s',
}

const refreshBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
  background: 'linear-gradient(135deg, #f97316, #fb923c)', color: 'white',
  border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
}

const kpiCardStyle: React.CSSProperties = {
  padding: '14px 16px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
}

const searchInputStyle: React.CSSProperties = {
  padding: '6px 10px 6px 30px', border: '1px solid #e2e8f0', borderRadius: '7px',
  fontSize: '12px', outline: 'none', width: '180px', background: 'white',
}

function selectStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 10px', border: `1px solid ${active ? '#fed7aa' : '#e2e8f0'}`, borderRadius: '7px',
    fontSize: '12px', background: active ? '#fff7ed' : 'white', cursor: 'pointer',
    color: active ? '#c2410c' : '#64748b', fontWeight: active ? 700 : 500,
  }
}

const clearBtnStyle: React.CSSProperties = {
  padding: '6px 10px', border: '1px solid #fed7aa', borderRadius: '7px', fontSize: '11px',
  background: '#fff7ed', color: '#f97316', fontWeight: 700, cursor: 'pointer',
}

const thStyle: React.CSSProperties = {
  padding: '9px 12px', fontSize: '11px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '.4px', background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '9px 12px', fontSize: '12.5px', color: '#1e293b',
  borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle',
}

function pageBtnStyle(disabled: boolean, active = false): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid #e2e8f0', borderRadius: '5px',
    background: active ? '#f97316' : disabled ? '#f8fafc' : 'white',
    color: active ? 'white' : disabled ? '#cbd5e1' : '#1e293b',
  }
}

function detailTagStyle(bg: string, color: string): React.CSSProperties {
  return {
    fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
    background: bg, color, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px',
  }
}

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '8px',
  display: 'flex', alignItems: 'center', gap: '6px',
}

const timelineBoxStyle: React.CSSProperties = {
  flex: 1, padding: '10px 12px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9',
}

const miniThStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: '10px', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', textAlign: 'left',
}

const miniTdStyle: React.CSSProperties = {
  padding: '6px 8px', fontSize: '11px', color: '#1e293b', borderBottom: '1px solid #f1f5f9',
}
