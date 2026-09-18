import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'
import { STATE_DISTRIBUTIONS, type StateDistribution } from '../data/mockDashboardData'

interface Props {
  onSelectState?: (state: StateDistribution) => void
}

export function StateDistributionMap({ onSelectState }: Props) {
  const [viewMode, setViewMode] = useState<'state' | 'ministry' | 'sector'>('state')
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [hoveredState, setHoveredState] = useState<StateDistribution | null>(null)

  const handleZoomIn = () => setZoomLevel(prev => Math.min(1.8, prev + 0.2))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.7, prev - 0.2))
  const handleResetZoom = () => setZoomLevel(1)

  return (
    <div className={`map-container-card ${isFullscreen ? 'map-fullscreen-active' : ''}`}>
      {/* Top Header of the Map Card */}
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

      {/* SVG Canvas Area */}
      <div className="map-canvas-wrap">
        {/* Floating Zoom Controls (Top Left) */}
        <div className="map-zoom-tools">
          <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
            <Plus size={14} />
          </button>
          <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
            <Minus size={14} />
          </button>
          <button className="zoom-btn" onClick={handleResetZoom} title="Reset View">
            <RotateCcw size={13} />
          </button>
        </div>

        {/* The SVG Map */}
        <svg
          viewBox="0 0 950 920"
          className="india-svg-surface"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.25s ease-out'
          }}
        >
          {/* Background Gradients & Filters */}
          <defs>
            <radialGradient id="redHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orangeHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Water Body Accents */}
          <text x="170" y="650" className="water-label">Arabian Sea</text>
          <text x="490" y="650" className="water-label">Bay of Bengal</text>

          {/* India Boundary Path (Faithfully stylized geometry matching the reference layout) */}
          <path
            className="india-landmass"
            d="
              M 290 85 
              C 330 65, 370 70, 395 105
              C 435 145, 410 180, 425 210
              C 455 240, 520 230, 560 250
              C 590 265, 620 270, 640 280
              C 670 290, 715 270, 780 260
              C 845 250, 875 285, 870 320
              C 860 360, 810 375, 790 410
              C 775 440, 770 480, 730 460
              C 710 450, 680 435, 660 410
              C 645 380, 600 395, 570 415
              C 540 435, 545 470, 575 510
              C 605 550, 580 580, 555 605
              C 515 645, 470 690, 435 735
              C 410 770, 395 830, 375 870
              C 365 890, 355 895, 345 870
              C 330 830, 305 770, 275 730
              C 250 695, 215 680, 230 635
              C 240 600, 255 570, 240 535
              C 220 500, 160 500, 130 475
              C 105 450, 125 420, 150 395
              C 180 365, 210 340, 225 300
              C 240 260, 255 220, 265 170
              Z
            "
          />

          {/* Internal State Guide Lines */}
          <path
            className="india-state-border"
            d="
              M 270 210 Q 320 220 370 225
              M 255 285 Q 310 295 380 305
              M 380 305 L 530 315
              M 225 365 Q 310 380 430 385
              M 430 385 Q 520 390 600 370
              M 170 435 Q 260 450 360 465
              M 360 465 Q 460 480 560 495
              M 230 535 Q 340 550 450 565
              M 450 565 Q 520 580 560 600
              M 250 635 Q 330 655 420 670
              M 275 730 Q 340 750 395 770
              M 660 300 Q 720 315 790 320
              M 670 370 Q 730 385 790 390
            "
          />

          {/* Halos for Mega Clusters (>200 projects) */}
          <circle cx="265" cy="590" r="48" fill="url(#redHalo)" />
          <circle cx="420" cy="365" r="44" fill="url(#redHalo)" />
          <circle cx="285" cy="310" r="36" fill="url(#redHalo)" />

          {/* State Project Bubbles */}
          {STATE_DISTRIBUTIONS.map((st) => {
            const isHovered = hoveredState?.name === st.name
            const circleRadius = st.count > 200 ? 20 : st.count > 100 ? 17 : st.count > 50 ? 15 : 13

            return (
              <g
                key={st.name}
                className="state-pin-group"
                onMouseEnter={() => setHoveredState(st)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => onSelectState?.(st)}
                style={{ cursor: 'pointer' }}
              >
                {/* State Label */}
                <text
                  x={st.x}
                  y={st.y - circleRadius - 4}
                  textAnchor="middle"
                  className={`map-state-text ${isHovered ? 'hovered' : ''}`}
                >
                  {st.name}
                </text>

                {/* Outer Ring on Hover */}
                {isHovered && (
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={circleRadius + 5}
                    fill="none"
                    stroke={st.color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Circle Bubble */}
                <circle
                  cx={st.x}
                  cy={st.y}
                  r={circleRadius}
                  fill={st.color}
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  className="state-bubble"
                />

                {/* Count Number inside circle */}
                <text
                  x={st.x}
                  y={st.y + 4.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="state-count-text"
                >
                  {st.count}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend Panel (Bottom Right) */}
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
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>11 – 50</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#059669' }} />
            <span>≤ 10</span>
          </div>
        </div>

        {/* Active State Hover Tooltip */}
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
