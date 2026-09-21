import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import {
  Building2, Zap, DollarSign, Clock,
  BarChart3, AlertTriangle, TrendingUp, ExternalLink
} from 'lucide-react'
import { StateDistributionMap } from '../components/StateDistributionMap'

const WARM = {
  orange: '#f97316', amber: '#f59e0b', red: '#ef4444',
  coral: '#fb923c', rose: '#f43f5e', teal: '#14b8a6',
  green: '#22c55e', bg: '#f1f5f9', card: '#ffffff',
  border: '#e2e8f0', text: '#1e293b', muted: '#64748b',
}

const MOCK_STATS = {
  totalProjects: 1981, totalProjectsGrowth: 12,
  originalCost: 37130, revisedCost: 42780, revisedCostGrowth: 15,
  cumulativeExpenditure: 20360, expenditurePercent: 48,
  highRiskProjects: 146, highRiskGrowth: 8,
  projectsDelayed: 428, delayedGrowth: 12,
}

const MOCK_RISK = [
  { name: 'Low Risk',      count: 1102, pct: 56, color: '#22c55e' },
  { name: 'Medium Risk',   count: 587,  pct: 30, color: '#f59e0b' },
  { name: 'High Risk',     count: 233,  pct: 12, color: '#f97316' },
  { name: 'Critical Risk', count: 59,   pct:  3, color: '#ef4444' },
]

const MOCK_SECTORS = [
  { name: 'Transport & Logistics', count: 412, color: '#f97316' },
  { name: 'Energy',                count: 298, color: '#f59e0b' },
  { name: 'Water & Sanitation',    count: 214, color: '#14b8a6' },
  { name: 'Communication',         count: 186, color: '#fb923c' },
  { name: 'Social Infrastructure', count: 172, color: '#f43f5e' },
  { name: 'Coal, Steel & Mining',  count: 164, color: '#ef4444' },
  { name: 'Urban Development',     count: 143, color: '#22c55e' },
  { name: 'Others',                count: 392, color: '#94a3b8' },
]

const MOCK_TOP_RISK = [
  { name: 'Delhi–Meerut RRTS',       ministry: 'MoRTH',               score: 92 },
  { name: 'Kudankulam Nuclear Plant', ministry: 'Ministry of Power',   score: 88 },
  { name: 'Mumbai Coastal Road',      ministry: 'MoRTH',               score: 85 },
  { name: 'Parbati Hydroelectric',    ministry: 'Ministry of Power',   score: 83 },
  { name: 'Brahmaputra Bridge',       ministry: 'Ministry of Railways', score: 81 },
]

const MOCK_ALERTS = [
  { type: 'danger',  project: 'Delhi–Meerut RRTS',        msg: 'High risk of time overrun',     time: '2 hr ago' },
  { type: 'warning', project: 'Kudankulam Nuclear Plant',  msg: 'Cost escalation predicted',     time: '4 hr ago' },
  { type: 'warning', project: 'Amaravati Capital Project', msg: 'Milestone delay detected',      time: '6 hr ago' },
  { type: 'info',    project: 'Parbati Hydroelectric',     msg: 'Low expenditure against plan',  time: '9 hr ago' },
  { type: 'warning', project: 'Mumbai Coastal Road',       msg: 'Revised cost increase flagged', time: '12 hr ago' },
]

// ── GSAP animated counter ────────────────────────────────────────────────
function AnimatedNumber({ target, prefix = '', suffix = '', decimals = 0 }: {
  target: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const ref   = useRef<HTMLSpanElement>(null)
  const obj   = useRef({ val: 0 })
  const inView = useInView(ref, { once: true, margin: '-30px' })

  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    gsap.to(obj.current, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        const v = decimals > 0 ? obj.current.val.toFixed(decimals) : Math.round(obj.current.val).toLocaleString()
        node.textContent = `${prefix}${v}${suffix}`
      },
    })
  }, [inView, target])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

// ── Stat card with hover lift ─────────────────────────────────────────────
function StatCard({ label, rawValue, sub, icon: Icon, iconBg, iconColor, badgeColor, prefix = '', suffix = '' }: {
  label: string; rawValue: number; sub: string; icon: any
  iconBg: string; iconColor: string; badgeColor?: string
  prefix?: string; suffix?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(249,115,22,.14)', borderColor: '#fed7aa' }}
      style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '14px', cursor: 'default', transition: 'border .2s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: WARM.muted, lineHeight: 1.3 }}>{label}</span>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 400 }}
          style={{ padding: '5px', background: iconBg, borderRadius: '6px', flexShrink: 0 }}
        >
          <Icon size={13} color={iconColor} />
        </motion.div>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 900, color: badgeColor ?? WARM.text, marginBottom: '5px', lineHeight: 1 }}>
        <AnimatedNumber target={rawValue} prefix={prefix} suffix={suffix} decimals={prefix === '₹' ? 0 : 0} />
      </div>
      <div style={{ fontSize: '11px', color: WARM.muted }}>{sub}</div>
    </motion.div>
  )
}

// ── Animated donut chart ──────────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { pct: number; color: string }[]; total: number }) {
  const r = 44, cx = 50, cy = 50, stroke = 11
  const circ = 2 * Math.PI * r
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (inView) setTimeout(() => setDrawn(true), 80)
  }, [inView])

  let offset = 0
  return (
    <svg ref={ref} viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {/* background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * circ
        const dashLen = drawn ? len : 0
        const el = (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={-offset}
            style={{
              transform: 'rotate(-90deg)', transformOrigin: '50% 50%',
              transition: `stroke-dasharray 0.9s ease ${i * 0.12}s`,
            }}
          />
        )
        offset += len
        return el
      })}
      <text x="50" y="47" textAnchor="middle" style={{ fontSize: '11px', fontWeight: 900, fill: WARM.text }}>{total.toLocaleString()}</text>
      <text x="50" y="57" textAnchor="middle" style={{ fontSize: '5px', fontWeight: 600, fill: WARM.muted }}>Projects</text>
    </svg>
  )
}

// ── Animated progress bar ─────────────────────────────────────────────────
function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  return (
    <div ref={ref} style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView ? `${pct}%` : 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{ height: '100%', background: color, borderRadius: '3px' }}
      />
    </div>
  )
}

// ── Animated line chart polyline ──────────────────────────────────────────
function AnimatedPolyline({ points, color, dashed }: { points: string; color: string; dashed?: boolean }) {
  const pathRef = useRef<SVGPolylineElement>(null)
  const inView = useInView(pathRef as any, { once: true })
  const [length, setLength] = useState(0)

  useEffect(() => {
    if (pathRef.current) {
      // approximated length for polyline
      setLength((pathRef.current as any).getTotalLength?.() ?? 500)
    }
  }, [])

  return (
    <polyline
      ref={pathRef}
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeDasharray={dashed ? '5 3' : undefined}
      style={{
        strokeDashoffset: inView ? 0 : length,
        strokeDasharray: dashed ? '5 3' : `${length} ${length}`,
        transition: inView ? 'stroke-dashoffset 1.4s ease 0.2s' : 'none',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────
export function NewDashboard() {
  const [stats,     setStats]     = useState(MOCK_STATS)
  const [risk,      setRisk]      = useState(MOCK_RISK)
  const [sectors,   setSectors]   = useState(MOCK_SECTORS)
  const [topRisk,   setTopRisk]   = useState(MOCK_TOP_RISK)
  const [alerts,    setAlerts]    = useState(MOCK_ALERTS)
  const [liveData,  setLiveData]  = useState(false)

  const stored      = localStorage.getItem('nirikshan_user')
  const currentUser = stored ? JSON.parse(stored) : { email: 'admin@mospi.gov.in', role: 'admin' }
  const greetName   = currentUser.role === 'admin'
    ? 'Administrator'
    : currentUser.role === 'ministry_officer'
    ? `${currentUser.ministry_name ?? 'Ministry'} Officer`
    : 'Auditor'

  useEffect(() => {
    const token = localStorage.getItem('nirikshan_token')
    if (!token) return
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    Promise.all([
      fetch('/api/v1/projects?limit=1000', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/v1/alerts?limit=100',    { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([projects, alertsData]: [any[], any[]]) => {
      if (!projects.length && !alertsData.length) return
      const totalOriginal = projects.reduce((s: number, p: any) => s + (+p.original_cost_cr || 0), 0)
      const delayed = projects.filter((p: any) => p.snapshots?.[p.snapshots.length - 1]?.is_delayed).length
      const riskBuckets = { low: 0, medium: 0, high: 0, critical: 0 }
      alertsData.forEach((a: any) => {
        const sc = +(a.risk_score ?? 0)
        if (sc < 0.35) riskBuckets.low++
        else if (sc < 0.55) riskBuckets.medium++
        else if (sc < 0.75) riskBuckets.high++
        else riskBuckets.critical++
      })
      const totalR = Object.values(riskBuckets).reduce((a, b) => a + b, 0) || 1
      setStats(s => ({
        ...s,
        totalProjects: projects.length || s.totalProjects,
        originalCost: Math.round(totalOriginal / 100) || s.originalCost,
        highRiskProjects: riskBuckets.high + riskBuckets.critical || s.highRiskProjects,
        projectsDelayed: delayed || s.projectsDelayed,
      }))
      setRisk([
        { name: 'Low Risk',      count: riskBuckets.low,      pct: Math.round(riskBuckets.low / totalR * 100),      color: '#22c55e' },
        { name: 'Medium Risk',   count: riskBuckets.medium,   pct: Math.round(riskBuckets.medium / totalR * 100),   color: '#f59e0b' },
        { name: 'High Risk',     count: riskBuckets.high,     pct: Math.round(riskBuckets.high / totalR * 100),     color: '#f97316' },
        { name: 'Critical Risk', count: riskBuckets.critical, pct: Math.round(riskBuckets.critical / totalR * 100), color: '#ef4444' },
      ])
      const catMap: Record<string, number> = {}
      projects.forEach((p: any) => { const c = p.category?.name ?? 'Others'; catMap[c] = (catMap[c] ?? 0) + 1 })
      const sectorColors = [WARM.orange, WARM.amber, WARM.teal, WARM.coral, WARM.rose, WARM.red, WARM.green, '#94a3b8']
      setSectors(Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, c], i) => ({ name: n, count: c, color: sectorColors[i] })))
      const top5 = [...alertsData].sort((a: any, b: any) => (+b.risk_score || 0) - (+a.risk_score || 0)).slice(0, 5)
      if (top5.length) setTopRisk(top5.map((a: any) => ({ name: a.project?.project_name ?? 'Unknown', ministry: a.project?.ministry?.name ?? 'N/A', score: Math.round(+(a.risk_score ?? 0) * 100) })))
      const sorted5 = [...alertsData].sort((a: any, b: any) => new Date(b.predicted_at).getTime() - new Date(a.predicted_at).getTime()).slice(0, 5)
      if (sorted5.length) setAlerts(sorted5.map((a: any) => {
        const hrs = Math.floor((Date.now() - new Date(a.predicted_at).getTime()) / 3600000)
        return {
          type: +a.risk_score > 0.75 ? 'danger' : +a.risk_score > 0.5 ? 'warning' : 'info',
          project: a.project?.project_name ?? 'Unknown',
          msg: +a.delay_probability > 0.7 ? 'High risk of time overrun' : 'Cost escalation predicted',
          time: hrs < 1 ? 'Just now' : `${hrs} hr ago`,
        }
      }))
      setLiveData(true)
    }).catch(() => {})
  }, [])

  const totalRisk  = risk.reduce((s, r) => s + r.count, 0)
  const maxSector  = Math.max(...sectors.map(s => s.count))

  // stagger container
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.07 } },
  }

  const trendPoints = {
    cost: '40,138 130,126 220,117 310,106 400,94 490,82',
    time: '40,145 130,140 220,133 310,125 400,116 490,111',
  }

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* ── Welcome row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: WARM.text, marginBottom: '2px' }}>
            Welcome, {greetName}
          </h1>
          <p style={{ fontSize: '12px', color: WARM.muted, display: 'flex', alignItems: 'center', gap: '8px' }}>
            National Infrastructure · Real-time ML Insights · Proactive Governance
            {currentUser.role === 'ministry_officer' && currentUser.ministry_name && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: '2px 8px', background: '#fff7ed', color: '#c2410c', borderRadius: '10px', fontWeight: 700, fontSize: '11px' }}
              >
                Scoped: {currentUser.ministry_name}
              </motion.span>
            )}
          </p>
        </div>
        <AnimatePresence>
          {liveData && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ fontSize: '11px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '3px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >●</motion.span>
              Live Data
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── KPI cards ── */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '14px' }}
      >
        <StatCard label="Total Projects"    rawValue={stats.totalProjects}
          sub={`▲ ${stats.totalProjectsGrowth}% · 17 Ministries`}
          icon={Building2} iconBg="#fef3c7" iconColor={WARM.amber} />
        <StatCard label="Original Cost"     rawValue={stats.originalCost / 100}
          sub="Sanctioned value" prefix="₹" suffix="K Cr"
          icon={DollarSign} iconBg="#f0fdf4" iconColor="#22c55e" />
        <StatCard label="Revised Cost"      rawValue={stats.revisedCost / 100}
          sub={`▲ ${stats.revisedCostGrowth}% escalation`} prefix="₹" suffix="K Cr"
          icon={Zap} iconBg="#fff7ed" iconColor={WARM.orange} />
        <StatCard label="Cumulative Exp."   rawValue={stats.cumulativeExpenditure / 100}
          sub={`${stats.expenditurePercent}% of revised`} prefix="₹" suffix="K Cr"
          icon={BarChart3} iconBg="#fdf4ff" iconColor="#a855f7" />
        <StatCard label="High Risk Projects" rawValue={stats.highRiskProjects}
          sub={`▲ ${stats.highRiskGrowth}% increase`}
          icon={AlertTriangle} iconBg="#fee2e2" iconColor={WARM.red} badgeColor={WARM.red} />
        <StatCard label="Projects Delayed"  rawValue={stats.projectsDelayed}
          sub={`▲ ${stats.delayedGrowth}% increase`}
          icon={Clock} iconBg="#ffedd5" iconColor={WARM.orange} />
      </motion.div>

      {/* ── Main 3-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr 0.9fr', gap: '12px', marginBottom: '12px' }}>

        {/* India map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          whileHover={{ boxShadow: '0 8px 32px rgba(249,115,22,.12)' }}
          style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', overflow: 'hidden', transition: 'box-shadow .25s' }}
        >
          <StateDistributionMap />
        </motion.div>

        {/* Risk donut */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}
          style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '16px', transition: 'box-shadow .25s' }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Risk Distribution</div>
          <div style={{ width: '140px', height: '140px', margin: '0 auto 14px' }}>
            <DonutChart segments={risk.map(r => ({ pct: r.pct, color: r.color }))} total={totalRisk} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {risk.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                whileHover={{ x: 3, background: '#f0f9ff' }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#f8fafc', borderRadius: '6px', cursor: 'default', transition: 'background .2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <motion.div
                    whileHover={{ scale: 1.3 }}
                    style={{ width: '9px', height: '9px', background: r.color, borderRadius: '2px' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: WARM.text }}>{r.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: WARM.muted }}>{r.count.toLocaleString()} ({r.pct}%)</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sectors bar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}
          style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '16px', transition: 'box-shadow .25s' }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: WARM.text, marginBottom: '12px' }}>Projects by Sector</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sectors.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{s.name}</span>
                  <span style={{ color: WARM.muted }}>{s.count}</span>
                </div>
                <AnimatedBar pct={(s.count / maxSector) * 100} color={s.color} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '12px' }}>

        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,.07)' }}
          style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '16px', transition: 'box-shadow .25s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Cost &amp; Time Overrun Trends</span>
            <span style={{ fontSize: '11px', color: WARM.muted, background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>Last 5 Years</span>
          </div>
          <svg viewBox="0 0 500 160" style={{ width: '100%', overflow: 'visible' }}>
            {[0, 10, 20, 30, 40].map((v, i) => (
              <g key={i}>
                <line x1={40} x2={490} y1={150 - v * 3} y2={150 - v * 3} stroke="#f1f5f9" strokeWidth={1} />
                <text x={32} y={154 - v * 3} fontSize={9} fill="#94a3b8" textAnchor="end">{v}%</text>
              </g>
            ))}
            {['2021','2022','2023','2024','2025','2026'].map((yr, i) => (
              <text key={yr} x={40 + i * 90} y={165} fontSize={9} fill="#94a3b8" textAnchor="middle">{yr}</text>
            ))}
            <AnimatedPolyline points={trendPoints.cost} color={WARM.orange} />
            {[138,126,117,106,94,82].map((y, i) => (
              <motion.circle
                key={i} cx={40 + i * 90} cy={y} r={3.5} fill={WARM.orange}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.08, type: 'spring', stiffness: 400 }}
              />
            ))}
            <text x={494} y={82} fontSize={9} fontWeight="800" fill={WARM.orange}>32%</text>
            <AnimatedPolyline points={trendPoints.time} color={WARM.amber} dashed />
            {[145,140,133,125,116,111].map((y, i) => (
              <motion.circle
                key={i} cx={40 + i * 90} cy={y} r={3.5} fill={WARM.amber}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 1.0 + i * 0.08, type: 'spring', stiffness: 400 }}
              />
            ))}
            <text x={494} y={111} fontSize={9} fontWeight="800" fill={WARM.amber}>18%</text>
          </svg>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
            {[{ color: WARM.orange, label: 'Cost Overrun (%)', dashed: false }, { color: WARM.amber, label: 'Time Overrun (%)', dashed: true }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: WARM.muted }}>
                <div style={{ width: '20px', height: '3px', background: l.color, borderRadius: '2px', borderBottom: l.dashed ? `2px dashed ${l.color}` : undefined }} />
                {l.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top 5 risk */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38 }}
          whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,.07)' }}
          style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '16px', transition: 'box-shadow .25s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Top 5 High Risk Projects</span>
            <motion.a
              href="/risk"
              whileHover={{ x: 3 }}
              style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.orange, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              View All <ExternalLink size={11} />
            </motion.a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRisk.map((p, i) => {
              const col = p.score >= 90 ? WARM.red : p.score >= 85 ? WARM.orange : WARM.amber
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  whileHover={{ x: 4, boxShadow: `0 4px 16px ${col}30` }}
                  style={{ padding: '10px 12px', background: '#fafafa', borderRadius: '8px', borderLeft: `3px solid ${col}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'default', transition: 'box-shadow .2s' }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: WARM.text }}>{p.name}</div>
                    <div style={{ fontSize: '10.5px', color: WARM.muted, marginTop: '1px' }}>{p.ministry}</div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    style={{ padding: '3px 9px', background: col, color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: 900 }}
                  >
                    {p.score}
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Alerts table ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.44 }}
        whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,.07)' }}
        style={{ background: WARM.card, border: `1px solid ${WARM.border}`, borderRadius: '12px', padding: '16px', transition: 'box-shadow .25s' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: WARM.text }}>Recent Alerts</span>
          <motion.a
            href="/risk"
            whileHover={{ x: 3 }}
            style={{ fontSize: '11.5px', fontWeight: 700, color: WARM.orange, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            View All <TrendingUp size={12} />
          </motion.a>
        </div>
        <div style={{ borderRadius: '8px', overflow: 'hidden', border: `1px solid ${WARM.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1.8fr 2.4fr 90px', padding: '8px 14px', background: '#f8fafc', fontSize: '10.5px', fontWeight: 700, color: WARM.muted, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            <span />
            <span>Project</span>
            <span>Alert</span>
            <span>Time</span>
          </div>
          {alerts.map((a, i) => {
            const alertColor = a.type === 'danger' ? WARM.red : a.type === 'warning' ? WARM.amber : WARM.teal
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                whileHover={{ background: '#fffbf5', x: 2 }}
                style={{ display: 'grid', gridTemplateColumns: '44px 1.8fr 2.4fr 90px', padding: '10px 14px', background: i % 2 === 0 ? 'white' : '#fafafa', alignItems: 'center', borderTop: `1px solid ${WARM.border}`, cursor: 'default', transition: 'background .15s' }}
              >
                <motion.div whileHover={{ rotate: 10, scale: 1.15 }}>
                  <AlertTriangle size={16} color={alertColor} />
                </motion.div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: WARM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{a.project}</span>
                <span style={{ fontSize: '12px', color: WARM.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{a.msg}</span>
                <span style={{ fontSize: '11px', color: WARM.muted }}>{a.time}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
