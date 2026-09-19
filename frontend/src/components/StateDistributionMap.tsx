import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Crosshair, Maximize2, Minimize2 } from 'lucide-react'
import { STATE_DISTRIBUTIONS, type StateDistribution } from '../data/mockDashboardData'

interface Props {
  onSelectState?: (state: StateDistribution) => void
}

type GeoFeature = {
  type: string
  properties: { name: string; id?: string }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

type GeoCollection = {
  type: string
  features: GeoFeature[]
}

type ProjectedState = {
  name: string
  displayName: string
  path: string
  centroid: [number, number]
  stats: StateDistribution
}

const VIEW_W = 860
const VIEW_H = 880
const PAD = 24

const STATE_MAPPING: Record<string, { displayName: string; count: number; tier: StateDistribution['tier']; color: string }> = {
  'Uttar Pradesh': { displayName: 'Uttar Pradesh', count: 298, tier: '> 200', color: '#dc2626' },
  'Maharashtra': { displayName: 'Maharashtra', count: 221, tier: '> 200', color: '#dc2626' },
  'Rajasthan': { displayName: 'Rajasthan', count: 121, tier: '101 - 200', color: '#dc2626' },
  'Tamil Nadu': { displayName: 'Tamil Nadu', count: 138, tier: '101 - 200', color: '#ea580c' },
  'Andhra Pradesh': { displayName: 'Andhra Pradesh', count: 124, tier: '101 - 200', color: '#ea580c' },
  'Madhya Pradesh': { displayName: 'Madhya Pradesh', count: 112, tier: '101 - 200', color: '#ea580c' },
  'Karnataka': { displayName: 'Karnataka', count: 109, tier: '101 - 200', color: '#ea580c' },
  'Telangana': { displayName: 'Telangana', count: 108, tier: '101 - 200', color: '#ea580c' },
  'Bihar': { displayName: 'Bihar', count: 103, tier: '101 - 200', color: '#ea580c' },
  'Odisha': { displayName: 'Odisha', count: 97, tier: '51 - 100', color: '#f59e0b' },
  'Orissa': { displayName: 'Odisha', count: 97, tier: '51 - 100', color: '#f59e0b' },
  'West Bengal': { displayName: 'West Bengal', count: 94, tier: '51 - 100', color: '#f59e0b' },
  'Gujarat': { displayName: 'Gujarat', count: 89, tier: '51 - 100', color: '#f59e0b' },
  'Haryana': { displayName: 'Haryana', count: 69, tier: '51 - 100', color: '#f59e0b' },
  'Punjab': { displayName: 'Punjab', count: 65, tier: '51 - 100', color: '#f59e0b' },
  'Chhattisgarh': { displayName: 'Chhattisgarh', count: 64, tier: '51 - 100', color: '#f59e0b' },
  'Uttarakhand': { displayName: 'Uttarakhand', count: 52, tier: '51 - 100', color: '#f59e0b' },
  'Uttaranchal': { displayName: 'Uttarakhand', count: 52, tier: '51 - 100', color: '#f59e0b' },
  'Assam': { displayName: 'Assam', count: 51, tier: '51 - 100', color: '#f59e0b' },
  'Delhi': { displayName: 'Delhi', count: 48, tier: '11 - 50', color: '#eab308' },
  'Jammu and Kashmir': { displayName: 'J&K', count: 48, tier: '11 - 50', color: '#eab308' },
  'Jharkhand': { displayName: 'Jharkhand', count: 47, tier: '11 - 50', color: '#eab308' },
  'Kerala': { displayName: 'Kerala', count: 42, tier: '11 - 50', color: '#10b981' },
  'Himachal Pradesh': { displayName: 'Himachal Pradesh', count: 28, tier: '11 - 50', color: '#10b981' },
  'Arunachal Pradesh': { displayName: 'Arunachal Pradesh', count: 17, tier: '11 - 50', color: '#10b981' },
  'Meghalaya': { displayName: 'Meghalaya', count: 16, tier: '11 - 50', color: '#10b981' },
  'Ladakh': { displayName: 'Ladakh', count: 12, tier: '11 - 50', color: '#10b981' },
  'Manipur': { displayName: 'Manipur', count: 12, tier: '11 - 50', color: '#10b981' },
  'Nagaland': { displayName: 'Nagaland', count: 11, tier: '11 - 50', color: '#10b981' },
  'Chandigarh': { displayName: 'Chandigarh', count: 9, tier: '≤ 10', color: '#059669' },
  'Sikkim': { displayName: 'Sikkim', count: 8, tier: '≤ 10', color: '#059669' },
  'Tripura': { displayName: 'Tripura', count: 8, tier: '≤ 10', color: '#059669' },
  'Dādra and Nagar Haveli and Damān and Diu': { displayName: 'DNH & DD', count: 8, tier: '≤ 10', color: '#059669' },
  'Puducherry': { displayName: 'Puducherry', count: 7, tier: '≤ 10', color: '#059669' },
  'Goa': { displayName: 'Goa', count: 6, tier: '≤ 10', color: '#10b981' },
  'Mizoram': { displayName: 'Mizoram', count: 6, tier: '≤ 10', color: '#10b981' },
  'Andaman and Nicobar': { displayName: 'A&N Islands', count: 5, tier: '≤ 10', color: '#059669' },
  'Lakshadweep': { displayName: 'Lakshadweep', count: 3, tier: '≤ 10', color: '#059669' }
}

// Manual centroid fine-tuning to ensure labels never overlap and match image geometry
const CENTROID_ADJUSTMENTS: Record<string, [number, number]> = {
  'Jammu and Kashmir': [-10, 10],
  'Ladakh': [20, -5],
  'Punjab': [-15, 0],
  'Himachal Pradesh': [5, 10],
  'Uttarakhand': [5, 5],
  'Uttaranchal': [5, 5],
  'Delhi': [0, -4],
  'Rajasthan': [-20, 5],
  'Uttar Pradesh': [0, 15],
  'Bihar': [0, 10],
  'Gujarat': [-20, -10],
  'Madhya Pradesh': [-10, 15],
  'Maharashtra': [-10, 5],
  'Chhattisgarh': [0, 5],
  'Odisha': [10, 0],
  'Orissa': [10, 0],
  'Telangana': [0, 0],
  'Andhra Pradesh': [0, 15],
  'Karnataka': [-10, 0],
  'Goa': [-12, 10],
  'Kerala': [-5, 10],
  'Tamil Nadu': [0, 10],
  'Assam': [0, 0],
  'Meghalaya': [-10, 5],
  'Arunachal Pradesh': [10, 0],
  'Nagaland': [15, 0],
  'Manipur': [15, 5],
  'Mizoram': [10, 15],
  'Tripura': [-10, 15],
  'Sikkim': [0, -5]
}

function fillForCount(count: number) {
  if (count > 200) return '#fde2e4'
  if (count > 100) return '#fef3c7'
  if (count > 50) return '#fef9c3'
  if (count > 10) return '#e8f5e9'
  return '#f1f8f5'
}

function ringsOf(geometry: GeoFeature['geometry']): number[][][] {
  if (geometry.type === 'Polygon') return geometry.coordinates as number[][][]
  return (geometry.coordinates as number[][][][]).flat()
}

function projectFactory(minLon: number, maxLon: number, minLat: number, maxLat: number) {
  const spanLon = maxLon - minLon || 1
  const spanLat = maxLat - minLat || 1
  return ([lon, lat]: number[]) => {
    const x = PAD + ((lon - minLon) / spanLon) * (VIEW_W - PAD * 2)
    const y = PAD + ((maxLat - lat) / spanLat) * (VIEW_H - PAD * 2)
    return [x, y] as [number, number]
  }
}

function ringToPath(ring: number[][], project: (pt: number[]) => [number, number]) {
  const step = ring.length > 900 ? 4 : ring.length > 400 ? 3 : ring.length > 180 ? 2 : 1
  let d = ''
  for (let i = 0; i < ring.length; i += step) {
    const [x, y] = project(ring[i])
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return `${d}Z`
}

function centroidOf(rings: number[][][], project: (pt: number[]) => [number, number]): [number, number] {
  let largestRing = rings[0] || []
  for (const r of rings) {
    if (r.length > largestRing.length) largestRing = r
  }
  let sx = 0
  let sy = 0
  let n = 0
  const step = Math.max(1, Math.floor(largestRing.length / 80))
  for (let i = 0; i < largestRing.length; i += step) {
    const [x, y] = project(largestRing[i])
    sx += x
    sy += y
    n += 1
  }
  return n ? [sx / n, sy / n] : [VIEW_W / 2, VIEW_H / 2]
}

export function StateDistributionMap({ onSelectState }: Props) {
  const [viewMode, setViewMode] = useState<'state' | 'ministry' | 'sector'>('state')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [hoveredState, setHoveredState] = useState<StateDistribution | null>(null)
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/india.json')
      .then(res => {
        if (!res.ok) throw new Error('Could not load India map')
        return res.json()
      })
      .then((data: GeoCollection) => {
        if (!cancelled) setGeo(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Map data could not be loaded')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const projected = useMemo(() => {
    if (!geo?.features?.length) return [] as ProjectedState[]

    let minLon = 180
    let maxLon = -180
    let minLat = 90
    let maxLat = -90
    for (const feature of geo.features) {
      for (const ring of ringsOf(feature.geometry)) {
        for (const pt of ring) {
          minLon = Math.min(minLon, pt[0])
          maxLon = Math.max(maxLon, pt[0])
          minLat = Math.min(minLat, pt[1])
          maxLat = Math.max(maxLat, pt[1])
        }
      }
    }

    const project = projectFactory(minLon, maxLon, minLat, maxLat)

    return geo.features.map(feature => {
      const rings = ringsOf(feature.geometry)
      const path = rings.map(ring => ringToPath(ring, project)).join(' ')
      const rawName = feature.properties.name
      const mapping = STATE_MAPPING[rawName] || {
        displayName: rawName,
        count: 10,
        tier: '≤ 10' as StateDistribution['tier'],
        color: '#10b981'
      }
      
      const baseCentroid = centroidOf(rings, project)
      const adj = CENTROID_ADJUSTMENTS[rawName] || [0, 0]
      const centroid: [number, number] = [baseCentroid[0] + adj[0], baseCentroid[1] + adj[1]]

      const known = STATE_DISTRIBUTIONS.find(s => s.name === mapping.displayName)
      const stats: StateDistribution = known
        ? { ...known, count: mapping.count, tier: mapping.tier, color: mapping.color, x: centroid[0], y: centroid[1] }
        : {
            name: mapping.displayName,
            shortCode: feature.properties.id?.slice(-2) || 'IN',
            count: mapping.count,
            x: centroid[0],
            y: centroid[1],
            tier: mapping.tier,
            color: mapping.color
          }

      return {
        name: rawName,
        displayName: mapping.displayName,
        path,
        centroid,
        stats
      }
    })
  }, [geo])

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.0, prev + 0.25))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.75, prev - 0.25))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Major states to display labels and pins on map
  const visiblePinNames = useMemo(() => new Set([
    'Jammu and Kashmir', 'Ladakh', 'Himachal Pradesh', 'Punjab', 'Uttarakhand', 'Uttaranchal',
    'Rajasthan', 'Uttar Pradesh', 'Bihar', 'Sikkim', 'Arunachal Pradesh', 'Assam', 'Nagaland',
    'Meghalaya', 'Manipur', 'Tripura', 'Mizoram', 'Gujarat', 'Madhya Pradesh', 'Chhattisgarh',
    'Odisha', 'Orissa', 'Maharashtra', 'Telangana', 'Andhra Pradesh', 'Goa', 'Karnataka',
    'Tamil Nadu', 'Kerala'
  ]), [])

  return (
    <div className={`map-container-card ${isFullscreen ? 'map-fullscreen-active' : ''}`}>
      {/* Map Card Header */}
      <div className="map-top-bar">
        <div className="map-title-left">
          <h3>Project Distribution Across India</h3>
        </div>

        <div className="map-controls-right">
          <div className="map-filter-group">
            <button
              className={`map-tab-btn ${viewMode === 'state' ? 'active' : ''}`}
              onClick={() => setViewMode('state')}
            >
              By State
            </button>
            <button
              className={`map-tab-btn ${viewMode === 'ministry' ? 'active' : ''}`}
              onClick={() => setViewMode('ministry')}
            >
              By Ministry
            </button>
            <button
              className={`map-tab-btn ${viewMode === 'sector' ? 'active' : ''}`}
              onClick={() => setViewMode('sector')}
            >
              By Sector
            </button>
          </div>

          <button
            className="map-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="map-canvas-wrap">
        {/* Floating Zoom & Center Tools (Top Left) */}
        <div className="map-zoom-tools">
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            <Plus size={14} />
          </button>
          <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            <Minus size={14} />
          </button>
          <button className="zoom-btn" onClick={handleResetZoom} title="Reset Center">
            <Crosshair size={13} />
          </button>
        </div>

        {loadError && <div className="map-load-error">{loadError}</div>}
        {!geo && !loadError && <div className="map-load-error">Loading India Geospatial Data…</div>}

        {projected.length > 0 && (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="india-svg-surface"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.22s ease-out'
            }}
          >
            <defs>
              {/* Radial heat glow aura for high concentration states (Maharashtra, UP, Rajasthan) */}
              <radialGradient id="heatGlowRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.48" />
                <stop offset="45%" stopColor="#ef4444" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatGlowOrange" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.40" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ocean Watermark Labels */}
            <text x="140" y="650" className="water-label">Arabian Sea</text>
            <text x="610" y="650" className="water-label">Bay of Bengal</text>

            {/* Heat Halos (Rendered behind boundaries to create the subtle aura seen in the screenshot) */}
            {projected.map(state => {
              if (state.stats.count >= 120) {
                const [cx, cy] = state.centroid
                const haloRadius = state.stats.count > 200 ? 70 : 50
                return (
                  <circle
                    key={`halo-${state.name}`}
                    cx={cx}
                    cy={cy}
                    r={haloRadius}
                    fill={state.stats.count > 200 ? 'url(#heatGlowRed)' : 'url(#heatGlowOrange)'}
                    pointerEvents="none"
                  />
                )
              }
              return null
            })}

            {/* State Boundaries */}
            {projected.map(state => {
              const isHovered = hoveredState?.name === state.stats.name
              return (
                <path
                  key={`path-${state.name}`}
                  className={`india-state-shape ${isHovered ? 'hovered' : ''}`}
                  d={state.path}
                  fill={fillForCount(state.stats.count)}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  onMouseEnter={() => setHoveredState(state.stats)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onSelectState?.(state.stats)}
                />
              )
            })}

            {/* State Pins and Count Badges */}
            {projected.map(state => {
              if (!visiblePinNames.has(state.name)) return null

              const [cx, cy] = state.centroid
              const isHovered = hoveredState?.name === state.stats.name
              const count = state.stats.count
              const isTop = count > 200
              const r = isTop ? 17 : count > 100 ? 15 : count > 50 ? 13 : 11

              return (
                <g
                  key={`${state.name}-pin`}
                  className="state-pin-group"
                  onMouseEnter={() => setHoveredState(state.stats)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onSelectState?.(state.stats)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* State Name Text above pin */}
                  <text
                    x={cx}
                    y={cy - r - 6}
                    textAnchor="middle"
                    className={`map-state-text ${isHovered ? 'hovered' : ''}`}
                  >
                    {state.displayName}
                  </text>

                  {/* Pin Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={state.stats.color}
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    className="state-bubble"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.18))"
                  />

                  {/* Project Count inside pin */}
                  <text
                    x={cx}
                    y={cy + (isTop ? 4.5 : 4)}
                    textAnchor="middle"
                    fill="#ffffff"
                    className="state-count-text"
                    style={{ fontSize: isTop ? '11px' : '9.5px' }}
                  >
                    {count}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {/* Legend Box (Bottom Right) */}
        <div className="map-legend-box">
          <div className="legend-title">Project Count</div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#dc2626' }} />
            <span>&gt; 200</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ea580c' }} />
            <span>101 – 200</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>51 – 100</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#eab308' }} />
            <span>11 – 50</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>≤ 10</span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="map-hover-tooltip"
          >
            <strong>{hoveredState.name}</strong>
            <div>Total Projects: <span>{hoveredState.count}</span></div>
            <div className="tooltip-sub">Click to inspect state portfolio</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
