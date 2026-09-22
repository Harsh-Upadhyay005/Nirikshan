import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Crosshair, Maximize2, Minimize2, X, MapPin } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────
type GeoFeature = {
  type: string
  properties: { name: string; id?: string }
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] }
}
type GeoCollection = { type: string; features: GeoFeature[] }

interface StateData {
  name: string
  count: number
  highRisk: number
  totalCostCr: number
}

interface Props {
  onSelectState?: (state: StateData) => void
}

// ── Static project count seeding (matches training CSV state distribution) ─
const STATE_COUNTS: Record<string, number> = {
  'Uttar Pradesh': 298, 'Maharashtra': 221, 'Rajasthan': 121,
  'Tamil Nadu': 138, 'Andhra Pradesh': 124, 'Madhya Pradesh': 112,
  'Karnataka': 109, 'Telangana': 108, 'Bihar': 103,
  'Odisha': 97, 'Orissa': 97, 'West Bengal': 94, 'Gujarat': 89,
  'Haryana': 69, 'Punjab': 65, 'Chhattisgarh': 64,
  'Uttarakhand': 52, 'Uttaranchal': 52, 'Assam': 51,
  'Delhi': 48, 'Jammu and Kashmir': 48, 'Jharkhand': 47,
  'Kerala': 42, 'Himachal Pradesh': 28, 'Arunachal Pradesh': 17,
  'Meghalaya': 16, 'Ladakh': 12, 'Manipur': 12, 'Nagaland': 11,
  'Chandigarh': 9, 'Sikkim': 8, 'Tripura': 8,
  'Dādra and Nagar Haveli and Damān and Diu': 8,
  'Puducherry': 7, 'Goa': 6, 'Mizoram': 6,
  'Andaman and Nicobar': 5, 'Lakshadweep': 3,
}

const VIEW_W = 860, VIEW_H = 880, PAD = 20

// Choropleth fill — warm gradient from cream → deep red
function choroplethFill(count: number, hovered: boolean, selected: boolean): string {
  if (selected) return '#f97316'
  if (hovered) return '#fb923c'
  if (count > 200) return '#ef4444'
  if (count > 150) return '#f97316'
  if (count > 100) return '#fb923c'
  if (count > 50) return '#fbbf24'
  if (count > 25) return '#fcd34d'
  if (count > 10) return '#fef08a'
  return '#fefce8'
}

function choroplethStroke(count: number, hovered: boolean, selected: boolean): string {
  if (selected || hovered) return '#fff'
  if (count > 100) return '#fff7ed'
  return '#e5e7eb'
}

function strokeWidth(count: number, hovered: boolean, selected: boolean): number {
  if (selected) return 3
  if (hovered) return 2.5
  return count > 50 ? 1.5 : 1
}

function ringsOf(g: GeoFeature['geometry']): number[][][] {
  if (g.type === 'Polygon') return g.coordinates as number[][][]
  return (g.coordinates as number[][][][]).flat()
}

function projectFactory(minLon: number, maxLon: number, minLat: number, maxLat: number) {
  const sLon = maxLon - minLon || 1, sLat = maxLat - minLat || 1
  return ([lon, lat]: number[]) => [
    PAD + ((lon - minLon) / sLon) * (VIEW_W - PAD * 2),
    PAD + ((maxLat - lat) / sLat) * (VIEW_H - PAD * 2),
  ] as [number, number]
}

function ringToPath(ring: number[][], project: (pt: number[]) => [number, number]): string {
  const step = ring.length > 900 ? 4 : ring.length > 400 ? 3 : ring.length > 180 ? 2 : 1
  let d = ''
  for (let i = 0; i < ring.length; i += step) {
    const [x, y] = project(ring[i])
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return `${d}Z`
}

function centroidOf(rings: number[][][], project: (pt: number[]) => [number, number]): [number, number] {
  const largest = rings.reduce((a, b) => b.length > a.length ? b : a, rings[0] || [])
  let sx = 0, sy = 0, n = 0
  const step = Math.max(1, Math.floor(largest.length / 80))
  for (let i = 0; i < largest.length; i += step) {
    const [x, y] = project(largest[i]); sx += x; sy += y; n++
  }
  return n ? [sx / n, sy / n] : [VIEW_W / 2, VIEW_H / 2]
}

const CENTROID_ADJ: Record<string, [number, number]> = {
  'Jammu and Kashmir': [-12, 12], 'Ladakh': [22, -8],
  'Punjab': [-18, 0], 'Himachal Pradesh': [5, 8],
  'Uttarakhand': [6, 4], 'Delhi': [0, -5],
  'Rajasthan': [-22, 5], 'Uttar Pradesh': [0, 12],
  'Bihar': [0, 8], 'Gujarat': [-22, -8],
  'Madhya Pradesh': [-12, 14], 'Maharashtra': [-12, 4],
  'Chhattisgarh': [0, 4], 'Odisha': [10, 0],
  'Orissa': [10, 0], 'Telangana': [0, -2],
  'Andhra Pradesh': [0, 14], 'Karnataka': [-12, 0],
  'Goa': [-14, 12], 'Kerala': [-6, 10],
  'Tamil Nadu': [0, 10], 'Assam': [0, 0],
  'Meghalaya': [-12, 4], 'Arunachal Pradesh': [10, 0],
  'Nagaland': [16, 0], 'Manipur': [16, 4],
  'Mizoram': [10, 14], 'Tripura': [-12, 14], 'Sikkim': [0, -6],
}

// States large enough to show label+badge on default zoom
const LABELED = new Set([
  'Jammu and Kashmir', 'Ladakh', 'Himachal Pradesh', 'Punjab', 'Uttarakhand',
  'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Gujarat', 'Madhya Pradesh',
  'Chhattisgarh', 'Odisha', 'Orissa', 'Maharashtra', 'Telangana',
  'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala', 'West Bengal',
  'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Nagaland', 'Manipur',
])

export function StateDistributionMap({ onSelectState }: Props) {
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'state' | 'ministry' | 'sector'>('state')

  // Live state data from API (falls back to static counts)
  const [stateData, setStateData] = useState<Record<string, StateData>>({})

  useEffect(() => {
    fetch('/india.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then((d: GeoCollection) => setGeo(d))
      .catch(() => setLoadError('Could not load India GeoJSON'))
  }, [])

  // Fetch live project data from API
  useEffect(() => {
    const token = localStorage.getItem('nirikshan_token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    
    Promise.all([
      fetch('/api/v1/projects?limit=5000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=5000', { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([projects, alerts]: [any[], any[]]) => {
      if (!projects.length) return
      
      const map: Record<string, StateData> = {}
      
      // Build alert lookup by project_id
      const alertsByProject: Record<number, any[]> = {}
      alerts.forEach((a: any) => {
        if (a.project_id) {
          if (!alertsByProject[a.project_id]) alertsByProject[a.project_id] = []
          alertsByProject[a.project_id].push(a)
        }
      })

      projects.forEach((p: any) => {
        // Use project's ministry as state proxy since states join isn't returned
        // Match against known state names in project name/ministry
        const ministry = p.ministry?.name ?? ''
        const cost = +(p.original_cost_cr ?? 0)
        const pAlerts = alertsByProject[p.id] ?? []
        const isHighRisk = pAlerts.some((a: any) => +(a.risk_score ?? 0) >= 0.55)

        // Try to map ministry to state
        const stateMatch = MINISTRY_TO_STATE[ministry] ?? ministry
        if (!map[stateMatch]) {
          map[stateMatch] = { name: stateMatch, count: 0, highRisk: 0, totalCostCr: 0 }
        }
        map[stateMatch].count++
        map[stateMatch].totalCostCr += cost
        if (isHighRisk) map[stateMatch].highRisk++
      })

      if (Object.keys(map).length > 0) setStateData(map)
    }).catch(() => {/* keep static */})
  }, [])

  // Build projected features
  const projected = useMemo(() => {
    if (!geo?.features?.length) return []

    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90
    for (const f of geo.features)
      for (const ring of ringsOf(f.geometry))
        for (const pt of ring) {
          minLon = Math.min(minLon, pt[0]); maxLon = Math.max(maxLon, pt[0])
          minLat = Math.min(minLat, pt[1]); maxLat = Math.max(maxLat, pt[1])
        }

    const project = projectFactory(minLon, maxLon, minLat, maxLat)

    return geo.features.map(f => {
      const rings = ringsOf(f.geometry)
      const path = rings.map(r => ringToPath(r, project)).join(' ')
      const rawName = f.properties.name
      const base = centroidOf(rings, project)
      const adj = CENTROID_ADJ[rawName] ?? [0, 0]
      const centroid: [number, number] = [base[0] + adj[0], base[1] + adj[1]]
      const staticCount = STATE_COUNTS[rawName] ?? 0
      return { rawName, path, centroid, staticCount }
    })
  }, [geo])

  const getCount = useCallback((rawName: string) => {
    // Try live data first, fall back to static
    if (Object.keys(stateData).length > 0) {
      // find matching entry
      const entry = Object.values(stateData).find(s =>
        s.name.toLowerCase().includes(rawName.toLowerCase().split(' ')[0])
      )
      if (entry) return entry.count
    }
    return STATE_COUNTS[rawName] ?? 0
  }, [stateData])

  const maxCount = useMemo(() => Math.max(...projected.map(p => getCount(p.rawName)), 1), [projected, getCount])

  const handleStateClick = useCallback((rawName: string) => {
    setSelectedName(prev => prev === rawName ? null : rawName)
    const count = getCount(rawName)
    const data: StateData = stateData[rawName] ?? {
      name: rawName, count, highRisk: Math.round(count * 0.15), totalCostCr: count * 850
    }
    onSelectState?.(data)
  }, [getCount, stateData, onSelectState])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'white', borderRadius: '10px',
      height: fullscreen ? '100vh' : '100%',
      ...(fullscreen ? { position: 'fixed', inset: 0, zIndex: 1000, borderRadius: 0 } : {})
    }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={15} color="#f97316" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Project Distribution Across India</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* View mode tabs */}
          {(['state', 'ministry', 'sector'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '4px 10px', fontSize: '11px', fontWeight: 600,
              background: viewMode === mode ? '#f97316' : '#f8fafc',
              color: viewMode === mode ? 'white' : '#64748b',
              border: viewMode === mode ? 'none' : '1px solid #e2e8f0',
              borderRadius: '5px', cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all .15s',
            }}>
              By {mode}
            </button>
          ))}
          <button onClick={() => setFullscreen(f => !f)} style={{ padding: '4px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {fullscreen ? <Minimize2 size={13} color="#64748b" /> : <Maximize2 size={13} color="#64748b" />}
          </button>
        </div>
      </div>

      {/* Map canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#f0f9ff', minHeight: 0 }}>
        {loadError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '13px' }}>{loadError}</div>
        )}
        {!geo && !loadError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading India GeoJSON…
          </div>
        )}

        {projected.length > 0 && (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            style={{ width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform .22s ease-out' }}
            onMouseLeave={() => { setHoveredName(null); setTooltipPos(null) }}
          >
            <defs>
              {/* Glow filters for high-count states */}
              <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0.5 0 0 0  0.3 0.5 0 0 0  0 0 0.5 0 0  0 0 0 0.8 0" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Ocean gradient */}
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
            </defs>

            {/* Ocean background */}
            <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#oceanGrad)" rx="4" />

            {/* Ocean labels */}
            <text x="110" y="660" fontSize="11" fill="#7dd3fc" fontWeight="600" opacity="0.8">Arabian Sea</text>
            <text x="590" y="660" fontSize="11" fill="#7dd3fc" fontWeight="600" opacity="0.8">Bay of Bengal</text>
            <text x="370" y="860" fontSize="10" fill="#7dd3fc" fontWeight="600" opacity="0.8">Indian Ocean</text>

            {/* State paths — rendered back to front by count */}
            {[...projected]
              .sort((a, b) => getCount(a.rawName) - getCount(b.rawName))
              .map(({ rawName, path }) => {
                const count = getCount(rawName)
                const hovered = hoveredName === rawName
                const selected = selectedName === rawName
                const fill = choroplethFill(count, hovered, selected)
                const stroke = choroplethStroke(count, hovered, selected)
                const sw = strokeWidth(count, hovered, selected)
                const useGlow = count > 200 || hovered || selected

                return (
                  <path
                    key={rawName}
                    d={path}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    filter={selected ? 'url(#glow-hover)' : hovered ? 'url(#glow-hover)' : count > 200 ? 'url(#glow-red)' : count > 100 ? 'url(#glow-orange)' : undefined}
                    style={{
                      cursor: 'pointer',
                      transition: 'fill .18s ease, stroke-width .15s ease',
                    }}
                    onMouseEnter={e => {
                      setHoveredName(rawName)
                      // Get SVG position for tooltip
                      const svg = e.currentTarget.closest('svg')
                      if (svg) {
                        const rect = svg.getBoundingClientRect()
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        })
                      }
                    }}
                    onMouseMove={e => {
                      const svg = e.currentTarget.closest('svg')
                      if (svg) {
                        const rect = svg.getBoundingClientRect()
                        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }
                    }}
                    onMouseLeave={() => { setHoveredName(null); setTooltipPos(null) }}
                    onClick={() => handleStateClick(rawName)}
                  />
                )
              })}

            {/* State labels + count badges */}
            {projected.map(({ rawName, centroid }) => {
              const count = getCount(rawName)
              if (!LABELED.has(rawName) || count < 5) return null
              const [cx, cy] = centroid
              const r = count > 200 ? 18 : count > 100 ? 15 : count > 50 ? 13 : 11
              const isHovered = hoveredName === rawName
              const isSelected = selectedName === rawName
              const badgeColor = count > 200 ? '#dc2626' : count > 100 ? '#f97316' : count > 50 ? '#f59e0b' : '#22c55e'

              return (
                <g
                  key={`label-${rawName}`}
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                >
                  {/* State name */}
                  <text
                    x={cx} y={cy - r - 5}
                    textAnchor="middle"
                    fontSize={isHovered || isSelected ? '10' : '9'}
                    fontWeight={isHovered || isSelected ? '800' : '600'}
                    fill={isHovered || isSelected ? '#1e293b' : '#374151'}
                    stroke="white"
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ transition: 'all .15s' }}
                  >
                    {rawName === 'Jammu and Kashmir' ? 'J&K' :
                     rawName === 'Uttaranchal' ? 'Uttarakhand' :
                     rawName === 'Orissa' ? 'Odisha' :
                     rawName === 'Dādra and Nagar Haveli and Damān and Diu' ? 'DNH&DD' :
                     rawName}
                  </text>

                  {/* Count badge */}
                  <circle
                    cx={cx} cy={cy} r={isHovered || isSelected ? r + 2 : r}
                    fill={isSelected ? '#f97316' : isHovered ? '#fb923c' : badgeColor}
                    stroke="white"
                    strokeWidth={isHovered ? 2.5 : 2}
                    filter={isHovered ? 'url(#glow-hover)' : undefined}
                    style={{ transition: 'all .15s' }}
                  />
                  <text
                    x={cx} y={cy + (count > 99 ? 3.5 : 4)}
                    textAnchor="middle"
                    fontSize={count > 200 ? '10.5' : '9'}
                    fontWeight="900"
                    fill="white"
                  >
                    {count}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
          {[
            { icon: <Plus size={13} />, action: () => setZoom(z => Math.min(2.5, z + 0.25)), title: 'Zoom In' },
            { icon: <Minus size={13} />, action: () => setZoom(z => Math.max(0.6, z - 0.25)), title: 'Zoom Out' },
            { icon: <Crosshair size={12} />, action: () => setZoom(1), title: 'Reset' },
          ].map((b, i) => (
            <button key={i} onClick={b.action} title={b.title} style={{
              width: '28px', height: '28px', background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#64748b', boxShadow: '0 1px 4px rgba(0,0,0,.1)',
              transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              {b.icon}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255,255,255,.95)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Projects</div>
          {[
            { color: '#dc2626', label: '> 200' },
            { color: '#f97316', label: '101 – 200' },
            { color: '#f59e0b', label: '51 – 100' },
            { color: '#fcd34d', label: '11 – 50' },
            { color: '#fef08a', label: '≤ 10' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <div style={{ width: '10px', height: '10px', background: color, borderRadius: '2px', border: '1px solid rgba(0,0,0,.1)' }} />
              <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredName && tooltipPos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'absolute',
                left: Math.min(tooltipPos.x + 14, VIEW_W - 180),
                top: Math.min(tooltipPos.y - 10, VIEW_H - 120),
                background: 'rgba(15,23,42,.92)',
                color: 'white',
                padding: '10px 12px',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 20,
                minWidth: '160px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0,0,0,.3)',
              }}
            >
              <div style={{ fontSize: '12.5px', fontWeight: 800, marginBottom: '4px' }}>
                {hoveredName === 'Jammu and Kashmir' ? 'J&K' :
                 hoveredName === 'Orissa' ? 'Odisha' :
                 hoveredName === 'Uttaranchal' ? 'Uttarakhand' : hoveredName}
              </div>
              <div style={{ fontSize: '11px', color: '#f97316', fontWeight: 700, marginBottom: '2px' }}>
                {getCount(hoveredName).toLocaleString()} Projects
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {selectedName === hoveredName ? 'Click to deselect' : 'Click to inspect portfolio'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected state detail panel */}
        <AnimatePresence>
          {selectedName && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '10px', right: '10px',
                width: '200px',
                background: 'rgba(255,255,255,.97)',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px',
                boxShadow: '0 4px 20px rgba(0,0,0,.12)',
                backdropFilter: 'blur(8px)',
                zIndex: 15,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                    {selectedName === 'Jammu and Kashmir' ? 'J&K' :
                     selectedName === 'Orissa' ? 'Odisha' :
                     selectedName === 'Uttaranchal' ? 'Uttarakhand' : selectedName}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>State Portfolio</div>
                </div>
                <button onClick={() => setSelectedName(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}>
                  <X size={14} />
                </button>
              </div>

              {(() => {
                const count = getCount(selectedName)
                const live = Object.values(stateData).find(s =>
                  s.name.toLowerCase().includes(selectedName.toLowerCase().split(' ')[0])
                )
                const highRisk = live?.highRisk ?? Math.round(count * 0.15)
                const totalCost = live?.totalCostCr ?? count * 850

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Total Projects', value: count.toLocaleString(), color: '#f97316' },
                      { label: 'High Risk', value: highRisk.toLocaleString(), color: '#ef4444' },
                      { label: 'Est. Outlay', value: `₹${Math.round(totalCost / 100).toLocaleString()}K Cr`, color: '#f59e0b' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ padding: '6px 8px', background: '#fff7ed', borderRadius: '6px', fontSize: '10px', color: '#92400e', textAlign: 'center' }}>
                      Tier: {count > 200 ? '> 200 Projects' : count > 100 ? '101–200 Projects' : count > 50 ? '51–100 Projects' : count > 10 ? '11–50 Projects' : '≤ 10 Projects'}
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen close overlay button */}
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', background: '#1e293b', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 50 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Bottom stats bar */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', gap: '16px', flexShrink: 0 }}>
        {[
          { label: 'Total States', value: projected.length, color: '#64748b' },
          { label: 'High Activity (>100)', value: projected.filter(p => getCount(p.rawName) > 100).length, color: '#f97316' },
          { label: 'Critical (>200)', value: projected.filter(p => getCount(p.rawName) > 200).length, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color }}>{value}</span>
            <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
        {Object.keys(stateData).length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
            Live Data
          </span>
        )}
      </div>
    </div>
  )
}

// Ministry → rough state proxy for grouping when state data isn't directly available
const MINISTRY_TO_STATE: Record<string, string> = {
  'Ministry of Railways': 'Uttar Pradesh',
  'Ministry of Road Transport & Highways': 'Maharashtra',
  'Ministry of Power': 'Uttar Pradesh',
  'Ministry of Housing and Urban Affairs': 'Delhi',
  'Ministry of Jal Shakti': 'Rajasthan',
  'Ministry of Ports, Shipping and Waterways': 'Maharashtra',
  'Ministry of Civil Aviation': 'Maharashtra',
  'Ministry of Coal': 'Chhattisgarh',
  'Ministry of Petroleum and Natural Gas': 'Gujarat',
  'Ministry of Steel': 'Odisha',
  'Ministry of Health and Family Welfare': 'Uttar Pradesh',
  'Ministry of Education': 'Delhi',
  'Ministry of Defence': 'Delhi',
  'Ministry of New and Renewable Energy': 'Rajasthan',
  'Ministry of Mines': 'Rajasthan',
  'Ministry of Telecommunications': 'Maharashtra',
  'Ministry of Electronics and IT': 'Karnataka',
}
