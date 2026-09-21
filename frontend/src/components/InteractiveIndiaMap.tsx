import { useState, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Activity } from 'lucide-react'

export type MapFilter = 'all' | 'critical' | 'interventions' | 'corridors'

interface MapNode {
  id: string
  name: string
  region: string
  x: number // 0 to 700 viewBox coordinate
  y: number // 0 to 750 viewBox coordinate
  type: 'critical' | 'intervention' | 'monitoring' | 'healthy'
  metric: string
  metricValue: string
  details: string
  ministry: string
  districts?: number
}

const NODES: MapNode[] = [
  {
    id: 'delhi',
    name: 'New Delhi (NCR)',
    region: 'Central Command',
    x: 320,
    y: 215,
    type: 'monitoring',
    metric: 'National Gateway',
    metricValue: '184 active',
    details: 'Central Command telemetry synchronized. Real-time PAIMANA data ingestion operational.',
    ministry: 'MoSPI / PMO',
  },
  {
    id: 'northeast',
    name: 'Dibrugarh / Guwahati',
    region: 'North East Corridor',
    x: 585,
    y: 235,
    type: 'critical',
    metric: 'Signal cluster',
    metricValue: '+32%',
    details: 'Water level anomaly & flash slope sensors active. 6 border districts under early alert.',
    ministry: 'DoNER & Jal Shakti',
    districts: 6,
  },
  {
    id: 'barmer',
    name: 'Barmer / Jodhpur',
    region: 'Western Border',
    x: 195,
    y: 275,
    type: 'intervention',
    metric: 'Intervention active',
    metricValue: '6 districts',
    details: 'Renewable evacuation transmission line ROW expedited. 18 nodal officers deployed.',
    ministry: 'Power & Petroleum',
    districts: 6,
  },
  {
    id: 'mumbai',
    name: 'Mumbai (JNPT)',
    region: 'Western Maritime Corridor',
    x: 235,
    y: 440,
    type: 'monitoring',
    metric: 'Freight Flow',
    metricValue: '215 projects',
    details: 'Western DFC multimodal logistics terminal running on predictive milestone schedule.',
    ministry: 'Railways & Ports',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Deccan Tech Hub',
    x: 310,
    y: 595,
    type: 'healthy',
    metric: 'AI Telemetry Core',
    metricValue: '99.9% uptime',
    details: 'Primary edge ML prediction inference cluster. Automated Brevo alert dispatch node.',
    ministry: 'MeitY / Infrastructure',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'Coromandel Industrial',
    x: 385,
    y: 585,
    type: 'monitoring',
    metric: 'Coastal Logistics',
    metricValue: '128 projects',
    details: 'Defense industrial corridor and port rail linkage monitored within safe variance threshold.',
    ministry: 'Shipping & Defense',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'Eastern Gateway',
    x: 495,
    y: 350,
    type: 'critical',
    metric: 'Schedule Drift',
    metricValue: '+14%',
    details: 'National Waterway-1 dredging and Eastern DFC terminal integration under proactive review.',
    ministry: 'Inland Waterways',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'Central Logistics',
    x: 340,
    y: 485,
    type: 'healthy',
    metric: 'Multi-Modal Hub',
    metricValue: '130 projects',
    details: 'Outer ring expressway & rail network data verified with zero critical deviations.',
    ministry: 'Road Transport & Highways',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    region: 'Gujarat Industrial Belt',
    x: 215,
    y: 355,
    type: 'healthy',
    metric: 'Expressway Pacing',
    metricValue: '110 projects',
    details: 'Delhi-Mumbai Industrial Corridor package 3 construction physical progress at 84%.',
    ministry: 'MoRTH & DFC',
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    region: 'Ganga Basin',
    x: 430,
    y: 285,
    type: 'monitoring',
    metric: 'Multi-Modal Freight',
    metricValue: '94 projects',
    details: 'Inland water terminal freight container volume pacing ahead of quarterly forecast.',
    ministry: 'Ports & Shipping',
  },
  {
    id: 'srinagar',
    name: 'Srinagar / Jammu',
    region: 'Northern Trans-Himalayan',
    x: 295,
    y: 95,
    type: 'intervention',
    metric: 'Tunneling Corridor',
    metricValue: '58 projects',
    details: 'USBRL tunnel geological sensors reporting normal pressure gradients. 14 teams active.',
    ministry: 'Northern Railways',
  },
  {
    id: 'kochi',
    name: 'Kochi',
    region: 'Southern Deepwater Port',
    x: 285,
    y: 675,
    type: 'healthy',
    metric: 'Maritime Container Hub',
    metricValue: '82 projects',
    details: 'Transshipment terminal phase 2 power connectivity completed ahead of schedule.',
    ministry: 'Ports, Shipping & Waterways',
  },
]

// Geographic polygon approximating India's sovereign territory outline on 700x750 canvas
const INDIA_SVG_PATH = `
  M 295,85
  C 320,80 340,110 335,130
  C 345,145 385,175 390,195
  C 425,190 445,215 470,225
  C 485,215 510,210 520,220
  C 540,210 565,195 595,200
  C 620,210 635,235 620,255
  C 605,275 580,285 570,305
  C 555,325 530,320 515,315
  C 495,335 485,360 480,385
  C 460,410 435,445 420,490
  C 400,530 380,590 365,640
  C 345,675 320,705 300,720
  C 285,710 270,685 275,650
  C 265,615 255,560 250,510
  C 240,480 220,450 215,420
  C 200,400 175,370 170,350
  C 160,335 155,305 175,290
  C 190,275 195,245 220,230
  C 245,210 260,185 265,160
  C 275,135 285,100 295,85
  Z
`

// Infrastructural Corridors connecting key regional centers
const CORRIDOR_LINKS = [
  ['delhi', 'barmer'],
  ['barmer', 'ahmedabad'],
  ['ahmedabad', 'mumbai'],
  ['mumbai', 'hyderabad'],
  ['hyderabad', 'bengaluru'],
  ['bengaluru', 'kochi'],
  ['bengaluru', 'chennai'],
  ['chennai', 'kolkata'],
  ['kolkata', 'northeast'],
  ['kolkata', 'varanasi'],
  ['varanasi', 'delhi'],
  ['delhi', 'srinagar'],
  ['delhi', 'hyderabad'],
  ['mumbai', 'bengaluru'],
]

export function InteractiveIndiaMap() {
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>('all')
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null)
  const [currentTime, setCurrentTime] = useState('11:42:08')
  const uid = useId().replace(/:/g, '')

  // Live real-time clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      const secs = String(now.getSeconds()).padStart(2, '0')
      setCurrentTime(`${hrs}:${mins}:${secs}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Filter nodes based on selected filter
  const filteredNodes = NODES.filter((n) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'critical') return n.type === 'critical'
    if (selectedFilter === 'interventions') return n.type === 'intervention'
    if (selectedFilter === 'corridors') return n.type === 'monitoring' || n.type === 'healthy'
    return true
  })

  const getNodeColor = (type: MapNode['type']) => {
    switch (type) {
      case 'critical':
        return '#ea7564' // coral red
      case 'intervention':
        return '#f3a22f' // saffron gold
      case 'monitoring':
        return '#2b7656' // nirikshan green
      case 'healthy':
        return '#4ec27c' // mint green
    }
  }

  const activeNode = hoveredNode || selectedNode

  return (
    <div className="relative w-full overflow-hidden select-none" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
      {/* Top Telemetry Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderBottom: '1px solid rgba(24,33,48,0.12)',
        background: 'rgba(255,253,247,0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2b7656' }}>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#4ec27c',
            boxShadow: '0 0 0 4px rgba(78,194,124,0.2)'
          }} />
          <span>LIVE NATIONAL SENSOR NETWORK</span>
          <span style={{ color: '#182130', fontFamily: 'monospace', fontSize: '11px', fontWeight: 800, marginLeft: '6px' }}>
            {currentTime}
          </span>
        </div>
        <div style={{ color: '#77828d', fontFamily: 'monospace', fontSize: '9px' }}>
          MO-SPI TELEMETRY · 28 STATES / 8 UTS
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(249,247,241,0.96)',
        borderBottom: '1px solid rgba(24,33,48,0.08)',
        fontSize: '10px',
        zIndex: 25,
        gap: '8px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <button
            onClick={() => setSelectedFilter('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              background: selectedFilter === 'all' ? '#182130' : 'transparent',
              color: selectedFilter === 'all' ? '#fffdf7' : '#596372',
              fontWeight: 700
            }}
          >
            All Signals ({NODES.length})
          </button>
          <button
            onClick={() => setSelectedFilter('critical')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              background: selectedFilter === 'critical' ? '#ea7564' : '#fff0ed',
              color: selectedFilter === 'critical' ? '#ffffff' : '#c94d42',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedFilter === 'critical' ? '#fff' : '#ea7564' }} />
            Critical Clusters
          </button>
          <button
            onClick={() => setSelectedFilter('interventions')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              background: selectedFilter === 'interventions' ? '#f3a22f' : '#fef4e6',
              color: selectedFilter === 'interventions' ? '#182130' : '#b26e10',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedFilter === 'interventions' ? '#182130' : '#f3a22f' }} />
            Interventions Active
          </button>
          <button
            onClick={() => setSelectedFilter('corridors')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              background: selectedFilter === 'corridors' ? '#2b7656' : '#eaf4ef',
              color: selectedFilter === 'corridors' ? '#ffffff' : '#2b7656',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedFilter === 'corridors' ? '#fff' : '#2b7656' }} />
            Transit Corridors
          </button>
        </div>
        <span style={{ color: '#89959a', fontSize: '9px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          {filteredNodes.length} active nodes
        </span>
      </div>

      {/* Main Map Canvas Area */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '470px',
        background: 'linear-gradient(180deg, #f9f7f1 0%, #f7f5ed 50%, #eeeae1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(24,33,48,0.18) 1px, transparent 1px), linear-gradient(rgba(24,33,48,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(24,33,48,0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          }}
        />

        {/* Orbit Rings from original design */}
        <div className="map-orbit orbit-one" style={{ opacity: 0.6 }} />
        <div className="map-orbit orbit-two" style={{ opacity: 0.45 }} />

        {/* SVG Interactive Map */}
        <svg
          viewBox="100 50 550 680"
          className="w-full h-full max-h-[480px] sm:max-h-[510px] z-10 filter drop-shadow-[0_20px_35px_rgba(26,54,71,0.14)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Territory Gradient */}
            <linearGradient id={`mapFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#f4efe4" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#e5dfd0" stopOpacity="0.85" />
            </linearGradient>

            {/* Corridor Pulsing Gradient */}
            <linearGradient id={`corridorGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2b7656" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#f3a22f" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2b7656" stopOpacity="0.7" />
            </linearGradient>

            {/* Glowing Drop Shadows */}
            <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* India Boundary Projection Polygon */}
          <path
            d={INDIA_SVG_PATH}
            fill={`url(#mapFill-${uid})`}
            stroke="#182130"
            strokeWidth="1.8"
            strokeOpacity="0.45"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Topographic Inner Wireframe Contours */}
          <path
            d={INDIA_SVG_PATH}
            fill="none"
            stroke="#2b7656"
            strokeWidth="0.7"
            strokeDasharray="4 6"
            strokeOpacity="0.35"
            transform="scale(0.96) translate(14, 18)"
          />
          <path
            d={INDIA_SVG_PATH}
            fill="none"
            stroke="#f3a22f"
            strokeWidth="0.5"
            strokeDasharray="2 8"
            strokeOpacity="0.25"
            transform="scale(0.92) translate(28, 36)"
          />

          {/* Infrastructural Corridors (Highways, Freight Rail & Waterways) */}
          <g className="corridors" opacity="0.65">
            {CORRIDOR_LINKS.map(([fromId, toId], i) => {
              const from = NODES.find((n) => n.id === fromId)
              const to = NODES.find((n) => n.id === toId)
              if (!from || !to) return null
              return (
                <g key={`corridor-${i}`}>
                  {/* Base Corridor Line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={`url(#corridorGrad-${uid})`}
                    strokeWidth="1.4"
                    strokeDasharray="3 4"
                  />
                </g>
              )
            })}
          </g>

          {/* Telemetry Hub Nodes */}
          {filteredNodes.map((node) => {
            const isHovered = activeNode?.id === node.id
            const color = getNodeColor(node.type)

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node === selectedNode ? null : node)}
              >
                {/* Radar Ripple Waves for active signals */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 20 : node.type === 'critical' ? 15 : 11}
                  fill={color}
                  fillOpacity={isHovered ? 0.25 : 0.14}
                  className="animate-ping"
                  style={{ animationDuration: node.type === 'critical' ? '1.8s' : '3s' }}
                />

                {/* Outer Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 9 : 6.5}
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth={isHovered ? 2.8 : 2}
                  filter={`url(#glow-${uid})`}
                />

                {/* Inner Core */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 4.5 : 3}
                  fill={color}
                />

                {/* City Name Label (always visible on primary hubs, or on hover) */}
                {(isHovered || ['delhi', 'mumbai', 'northeast', 'bengaluru', 'barmer'].includes(node.id)) && (
                  <text
                    x={node.x}
                    y={node.y - (isHovered ? 12 : 9)}
                    textAnchor="middle"
                    fill="#182130"
                    fontSize={isHovered ? "11" : "9"}
                    fontWeight={isHovered ? "800" : "700"}
                    fontFamily="DM Sans, sans-serif"
                    className="pointer-events-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating Node Details Card Overlay (When hovered/clicked) */}
        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="absolute z-30 bottom-14 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 p-3.5 bg-[rgba(255,253,247,0.96)] backdrop-blur-xl border border-[rgba(24,33,48,0.14)] rounded-xl shadow-[0_18px_36px_rgba(24,33,48,0.18)]"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[rgba(24,33,48,0.08)] pb-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getNodeColor(activeNode.type) }}
                    />
                    <strong className="text-[13px] text-[#182130] font-bold">{activeNode.name}</strong>
                  </div>
                  <small className="text-[10px] text-[#77818d] font-semibold">{activeNode.region}</small>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-extrabold"
                  style={{
                    backgroundColor: `${getNodeColor(activeNode.type)}20`,
                    color: getNodeColor(activeNode.type),
                  }}
                >
                  {activeNode.metricValue}
                </span>
              </div>

              <p className="text-[11px] text-[#596372] leading-relaxed mb-2.5">
                {activeNode.details}
              </p>

              <div className="flex items-center justify-between text-[10px] font-bold text-[#77818d] pt-1.5 border-t border-[rgba(24,33,48,0.06)]">
                <span>Ministry: <b className="text-[#182130]">{activeNode.ministry}</b></span>
                <span className="text-[#2b7656] flex items-center gap-1">
                  <Activity size={11} /> Nodal Telemetry Live
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node Card Top (Signal Cluster) - Preserving original zip card aesthetic */}
        {!activeNode && (
          <div className="node-card node-card-top cursor-pointer hover:scale-105 transition-transform"
               onClick={() => setSelectedNode(NODES.find((n) => n.id === 'northeast') || null)}>
            <span className="node-pulse" />
            <div>
              <b>Signal cluster</b>
              <small>North East corridor · Assam</small>
            </div>
            <strong>+32%</strong>
          </div>
        )}

        {/* Node Card Bottom (Intervention Active) - Preserving original zip card aesthetic */}
        {!activeNode && (
          <div className="node-card node-card-bottom cursor-pointer hover:scale-105 transition-transform"
               onClick={() => setSelectedNode(NODES.find((n) => n.id === 'barmer') || null)}>
            <span className="node-icon">
              <Zap size={14} />
            </span>
            <div>
              <b>Intervention active</b>
              <small>6 districts · 18 owners</small>
            </div>
            <span className="node-arrow">↗</span>
          </div>
        )}

        {/* Bottom Coordinates & Geo Caption */}
        <div className="map-caption px-4">
          <span>INDIA / 28 STATES / 8 UTs</span>
          <span>08.04° N — 37.06° N / 68.07° E — 97.25° E</span>
        </div>
      </div>
    </div>
  )
}
