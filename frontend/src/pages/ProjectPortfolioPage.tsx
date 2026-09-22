import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

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

const TD: React.CSSProperties = { padding: '9px 12px', fontSize: '12.5px', color: '#1e293b', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }
const TH: React.CSSProperties = { padding: '9px 12px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.4px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }

export function ProjectPortfolioPage() {
  const [projects, setProjects]       = useState<Project[]>([])
  const [ministries, setMinistries]   = useState<{ id: number; name: string }[]>([])
  const [categories, setCategories]   = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterMin, setFilterMin]     = useState('')
  const [filterCat, setFilterCat]     = useState('')
  const [sortKey, setSortKey]         = useState<keyof Project>('project_code')
  const [sortAsc, setSortAsc]         = useState(true)
  const [page, setPage]               = useState(1)
  const PAGE_SIZE = 20

  const token = localStorage.getItem('nirikshan_token') ?? ''
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  function load() {
    setLoading(true)
    Promise.all([
      fetch('/api/v1/projects?limit=5000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/ministries',           { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/categories',           { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([p, m, c]) => {
      setProjects(p)
      setMinistries(m)
      setCategories(c)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = [...projects]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.project_name.toLowerCase().includes(q) ||
        String(p.project_code).includes(q) ||
        (p.ministry?.name ?? '').toLowerCase().includes(q) ||
        (p.agency?.name  ?? '').toLowerCase().includes(q)
      )
    }
    if (filterMin) list = list.filter(p => p.ministry?.name === filterMin)
    if (filterCat) list = list.filter(p => p.category?.name === filterCat)

    list.sort((a, b) => {
      const va = (a as any)[sortKey] ?? ''
      const vb = (b as any)[sortKey] ?? ''
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ?  1 : -1
      return 0
    })
    return list
  }, [projects, search, filterMin, filterCat, sortKey, sortAsc])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  function toggleSort(key: keyof Project) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
    setPage(1)
  }

  function SortIcon({ k }: { k: keyof Project }) {
    if (sortKey !== k) return <span style={{ color: '#cbd5e1', marginLeft: 3 }}>↕</span>
    return sortAsc ? <ChevronUp size={12} style={{ marginLeft: 3 }} /> : <ChevronDown size={12} style={{ marginLeft: 3 }} />
  }

  const totalCost = filtered.reduce((s, p) => s + (+p.original_cost_cr || 0), 0)

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginBottom: '2px' }}>Project Portfolio</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            {loading ? 'Loading…' : `${filtered.length} projects · ₹${(totalCost / 100).toFixed(0)}K Cr total outlay`}
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg,#f97316,#fb923c)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search name, code, ministry…"
            style={{ padding: '7px 12px 7px 30px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', outline: 'none', width: '240px', background: 'white' }}
            onFocus={e => e.target.style.borderColor = '#f97316'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
        </div>

        <select value={filterMin} onChange={e => { setFilterMin(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', background: 'white', cursor: 'pointer', color: filterMin ? '#1e293b' : '#94a3b8' }}>
          <option value="">All Ministries</option>
          {ministries.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>

        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}
          style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', background: 'white', cursor: 'pointer', color: filterCat ? '#1e293b' : '#94a3b8' }}>
          <option value="">All Sectors</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        {(filterMin || filterCat || search) && (
          <button onClick={() => { setFilterMin(''); setFilterCat(''); setSearch(''); setPage(1) }}
            style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12px', background: '#fff7ed', color: '#f97316', fontWeight: 700, cursor: 'pointer' }}>
            Clear Filters ×
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH} onClick={() => toggleSort('project_code')}>Code <SortIcon k="project_code" /></th>
                <th style={{ ...TH, width: '26%' }} onClick={() => toggleSort('project_name')}>Project Name <SortIcon k="project_name" /></th>
                <th style={TH} onClick={() => toggleSort('ministry' as any)}>Ministry</th>
                <th style={TH}>Sector</th>
                <th style={TH} onClick={() => toggleSort('original_cost_cr' as any)}>Cost (Cr) <SortIcon k="original_cost_cr" /></th>
                <th style={TH} onClick={() => toggleSort('start_date')}>Start Date <SortIcon k="start_date" /></th>
                <th style={TH} onClick={() => toggleSort('target_doc' as any)}>Target DOC <SortIcon k="target_doc" /></th>
                <th style={TH}>Multi-State</th>
                <th style={TH}>Agency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ ...TD, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading projects…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} style={{ ...TD, textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No projects match your filters.</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} style={{ transition: 'background .1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fffbf5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: '11.5px', color: '#f97316', fontWeight: 700 }}>{p.project_code}</td>
                  <td style={{ ...TD, fontWeight: 600, maxWidth: '240px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.project_name}>{p.project_name}</div>
                  </td>
                  <td style={{ ...TD, fontSize: '11.5px', maxWidth: '140px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.ministry?.name}>{p.ministry?.name ?? '—'}</div>
                  </td>
                  <td style={{ ...TD, fontSize: '11.5px' }}>{p.category?.name ?? '—'}</td>
                  <td style={{ ...TD, fontWeight: 700, color: '#f97316', textAlign: 'right', fontFamily: 'monospace' }}>
                    {Number(p.original_cost_cr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ ...TD, fontSize: '11.5px', fontFamily: 'monospace' }}>{p.start_date}</td>
                  <td style={{ ...TD, fontSize: '11.5px', fontFamily: 'monospace', color: p.target_doc ? '#1e293b' : '#94a3b8' }}>{p.target_doc ?? '—'}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, background: p.is_multi_state ? '#fff7ed' : '#f8fafc', color: p.is_multi_state ? '#f97316' : '#94a3b8' }}>
                      {p.is_multi_state ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ ...TD, fontSize: '11px', maxWidth: '120px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.agency?.name}>{p.agency?.name ?? '—'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Page {page} of {totalPages} · Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={pageBtnStyle(page === 1)}>«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={pageBtnStyle(page === 1)}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <button key={pg} onClick={() => setPage(pg)} style={pageBtnStyle(false, pg === page)}>{pg}</button>
                )
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={pageBtnStyle(page === totalPages)}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function pageBtnStyle(disabled: boolean, active = false): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid #e2e8f0', borderRadius: '5px',
    background: active ? '#f97316' : disabled ? '#f8fafc' : 'white',
    color: active ? 'white' : disabled ? '#cbd5e1' : '#1e293b',
  }
}
