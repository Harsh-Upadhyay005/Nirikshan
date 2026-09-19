import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderGit2,
  Compass,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  FileText,
  Database,
  Users,
  Settings,
  Search,
  Bell,
  Coins,
  CheckCircle2,
  X,
  ExternalLink,
  Send,
  ShieldCheck,
  ChevronDown,
  Truck,
  Zap,
  Droplets,
  Radio,
  HeartPulse,
  Factory,
  Building2,
  Layers,
  Filter,
  Download,
  ArrowUpRight,
  Cpu,
  Eye,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react'
import {
  INITIAL_PROJECTS,
  RECENT_ALERTS,
  TOP_HIGH_RISK_PROJECTS,
  SECTOR_BREAKDOWN,
  OVERRUN_TRENDS,
  type InfraProject,
  type AnomalyAlert,
  type StateDistribution
} from '../data/mockDashboardData'
import { StateDistributionMap } from '../components/StateDistributionMap'
import '../dashboard.css'

export function DashboardPage() {
  // Active Navigation State
  const [activeNav, setActiveNav] = useState<string>('dashboard')

  // Data States
  const [projects, setProjects] = useState<InfraProject[]>(INITIAL_PROJECTS)
  const [alerts] = useState<AnomalyAlert[]>(RECENT_ALERTS)
  const [selectedProject, setSelectedProject] = useState<InfraProject | null>(null)
  const [selectedStateName, setSelectedStateName] = useState<string>('Maharashtra')
  const [drawerTab, setDrawerTab] = useState<'details' | 'financials' | 'notes'>('details')
  const [newNoteText, setNewNoteText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Interactive Filter States (Below the Fold)
  const [globalSearch, setGlobalSearch] = useState('')
  const [explorerMinistry, setExplorerMinistry] = useState<string>('all')
  const [explorerRisk, setExplorerRisk] = useState<string>('all')
  const [explorerStatus, setExplorerStatus] = useState<string>('all')

  // UI Interactive Dropdowns
  const [sectorMetric, setSectorMetric] = useState<'count' | 'outlay'>('count')
  const [overrunRange, setOverrunRange] = useState<'5yr' | '3yr' | 'all'>('5yr')

  // Real-time IST Date & Time
  const [formattedDate, setFormattedDate] = useState('Tue, 16 Sep 2026 11:45 AM')
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const dayName = days[now.getDay()]
      const dateNum = now.getDate()
      const monthName = months[now.getMonth()]
      const year = now.getFullYear()
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      setFormattedDate(`${dayName}, ${dateNum} ${monthName} ${year} ${timeStr}`)
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 10000)
    return () => clearInterval(interval)
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3600)
  }

  // Smooth scroll helper for navigation
  const scrollToSection = (id: string, navKey: string) => {
    setActiveNav(navKey)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const container = document.querySelector('.main-workspace')
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Handle map state selection
  const handleMapSelectState = (state: StateDistribution) => {
    setSelectedStateName(state.name)
    showToast(`Inspecting ${state.name} infrastructure (${state.count} projects)`)
    // Optionally scroll down to state breakdown
    const el = document.getElementById('dash-state-breakdown')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Filtered projects for the below-the-fold Project Explorer table
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch =
        !globalSearch.trim() ||
        p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.state.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.contractor.toLowerCase().includes(globalSearch.toLowerCase())

      const matchesMinistry = explorerMinistry === 'all' || p.ministry.toLowerCase().includes(explorerMinistry.toLowerCase())
      const matchesRisk = explorerRisk === 'all' || p.riskTier.toLowerCase() === explorerRisk.toLowerCase()
      const matchesStatus =
        explorerStatus === 'all' ||
        (explorerStatus === 'delayed' && (p.status === 'Delayed' || p.status === 'Critical Bottleneck' || p.status === 'At Risk')) ||
        (explorerStatus === 'ontrack' && p.status === 'On Track')

      return matchesSearch && matchesMinistry && matchesRisk && matchesStatus
    })
  }, [projects, globalSearch, explorerMinistry, explorerRisk, explorerStatus])

  // Projects belonging to selected state
  const stateProjects = useMemo(() => {
    return projects.filter(p => p.state.toLowerCase().includes(selectedStateName.toLowerCase()))
  }, [projects, selectedStateName])

  // Handle adding an audit note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !newNoteText.trim()) return
    const updated = {
      ...selectedProject,
      auditNotes: [
        { author: 'Administrator (MoSPI)', date: new Date().toISOString().slice(0, 10), note: newNoteText.trim() },
        ...selectedProject.auditNotes
      ]
    }
    setSelectedProject(updated)
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    setNewNoteText('')
    showToast('Audit remark recorded in official project log.')
  }

  const sectorIcon = (icon: string, color: string) => {
    const props = { size: 13, color }
    switch (icon) {
      case 'truck': return <Truck {...props} />
      case 'zap': return <Zap {...props} />
      case 'droplets': return <Droplets {...props} />
      case 'radio': return <Radio {...props} />
      case 'heart': return <HeartPulse {...props} />
      case 'factory': return <Factory {...props} />
      case 'building': return <Building2 {...props} />
      default: return <Layers {...props} />
    }
  }

  return (
    <div className="app-shell">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#0c1527',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              borderLeft: '4px solid #2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 110
            }}
          >
            <CheckCircle2 size={16} color="#3b82f6" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          SIDEBAR: EXACT MATCH WITH REFERENCE IMAGE
          Dark Slate Navy (#0c1527), Royal Blue Active Pill (#2563eb)
          ==================================================================== */}
      <aside className="attractive-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-gem">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 19h16M7 16V11M12 16V6M17 16V10" stroke="#3b82f6" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="17" cy="6.5" r="2.2" fill="#60a5fa" />
            </svg>
          </div>
          <div className="brand-naming">
            <div className="brand-main-title">Nirikshan</div>
            <span className="brand-sub-tagline">AI for Infrastructure Monitoring</span>
          </div>
        </div>

        {/* Navigation Menu List with Divided Categories */}
        <nav className="sidebar-menu-list">
          {/* Section 1: Core Command */}
          <div className="sidebar-category-divider">
            <span className="sidebar-category-label">Core Command</span>
            <span className="sidebar-category-line" />
          </div>

          <button
            className={`side-nav-btn ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('dashboard')
              document.querySelector('.main-workspace')?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <LayoutDashboard className="side-icon" size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'portfolio' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-project-explorer', 'portfolio')}
          >
            <FolderGit2 className="side-icon" size={16} />
            <span>Project Portfolio</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'explorer' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-project-explorer', 'explorer')}
          >
            <Compass className="side-icon" size={16} />
            <span>Project Explorer</span>
          </button>

          {/* Section 2: Analytics & Risk */}
          <div className="sidebar-category-divider">
            <span className="sidebar-category-label">Analytics & Risk</span>
            <span className="sidebar-category-line" />
          </div>

          <button
            className={`side-nav-btn ${activeNav === 'early-warning' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-early-warning', 'early-warning')}
          >
            <AlertTriangle className="side-icon" size={16} />
            <span>Risk & Early Warning</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'cost-overrun' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-cost-overrun', 'cost-overrun')}
          >
            <TrendingUp className="side-icon" size={16} />
            <span>Cost Overrun Analysis</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'time-overrun' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-time-overrun', 'time-overrun')}
          >
            <Clock className="side-icon" size={16} />
            <span>Time Overrun Analysis</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-state-breakdown', 'analytics')}
          >
            <BarChart3 className="side-icon" size={16} />
            <span>Analytics & Insights</span>
          </button>

          {/* Section 3: Governance & Administration */}
          <div className="sidebar-category-divider">
            <span className="sidebar-category-label">Governance & Admin</span>
            <span className="sidebar-category-line" />
          </div>

          <button
            className={`side-nav-btn ${activeNav === 'reports' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-reports', 'reports')}
          >
            <FileText className="side-icon" size={16} />
            <span>Reports & Briefs</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'data-mgmt' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-project-explorer', 'data-mgmt')}
          >
            <Database className="side-icon" size={16} />
            <span>Data Management</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'users' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-reports', 'users')}
          >
            <Users className="side-icon" size={16} />
            <span>User Management</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => scrollToSection('dash-reports', 'settings')}
          >
            <Settings className="side-icon" size={16} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer: Sovereign Emblem of India */}
        <div className="sidebar-footer-insignia">
          {/* Ashoka Lion Capital Silhouette */}
          <svg className="emblem-gold-svg" viewBox="0 0 64 80" fill="none">
            <circle cx="32" cy="18" r="8" fill="#e2e8f0" />
            <path d="M18 32c4-6 10-9 14-9s10 3 14 9" stroke="#e2e8f0" strokeWidth="2.4" fill="none" />
            <rect x="14" y="42" width="36" height="22" rx="3" fill="#e2e8f0" />
            <path d="M20 50h24M20 56h16" stroke="#0c1527" strokeWidth="2" />
          </svg>

          <div className="emblem-text-block">
            <span className="emblem-gov-title">Ministry of Statistics and</span>
            <span className="emblem-gov-title">Programme Implementation</span>
            <span className="emblem-gov-sub">Government of India</span>
          </div>

          <div className="tricolor-strip-bar">
            <div className="tricolor-saffron" />
            <div className="tricolor-white" />
            <div className="tricolor-green" />
          </div>

          <span className="developed-india-tag">Data for a Developed India</span>
        </div>
      </aside>

      {/* ====================================================================
          MAIN WORKSPACE
          ==================================================================== */}
      <main className="main-workspace">
        {/* Top Header Command Bar */}
        <header className="top-command-bar">
          <div className="search-command-box">
            <Search className="search-command-icon" size={15} />
            <input
              type="text"
              placeholder="Search projects, ministries, states, sectors..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
            />
          </div>

          <div className="top-bar-right-cluster">
            {/* Real-time Date and Time */}
            <div className="datetime-pill" title="Indian Standard Time (IST)">
              <span>{formattedDate}</span>
              <ChevronDown size={13} />
            </div>

            {/* Notification Bell */}
            <button
              className="bell-notify-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              title="3 Unread Anomaly Alerts"
            >
              <Bell size={16} />
              <span className="bell-counter-badge">3</span>
            </button>

            {/* Notifications Dropdown Modal */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    top: '55px',
                    right: '180px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    width: '320px',
                    padding: '14px',
                    zIndex: 60
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>Unread Alerts (3)</strong>
                    <button onClick={() => setNotificationsOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alerts.slice(0, 3).map(a => (
                      <div key={a.id} style={{ fontSize: '11.5px', padding: '6px 8px', background: '#f8fafc', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 700, color: '#dc2626' }}>{a.projectName}</div>
                        <div style={{ color: '#64748b' }}>{a.title}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Profile Avatar: AS / Admin MoSPI */}
            <div className="user-profile-widget">
              <div className="user-round-avatar">AS</div>
              <div className="user-meta-lines">
                <span className="user-title-name">Admin</span>
                <span className="user-title-dept">MoSPI</span>
              </div>
            </div>

            {/* Tricolor Tagline Banner */}
            <div className="from-data-banner">
              <span className="from-data-text">From Data to Developments</span>
              <div className="from-data-bar">
                <div className="tricolor-saffron" />
                <div className="tricolor-white" />
                <div className="tricolor-green" />
              </div>
            </div>

            <Link to="/" title="Public Landing Portal" style={{ color: '#64748b', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>
              <ExternalLink size={16} />
            </Link>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <div className="dashboard-viewport">
          {/* ================================================================
              ABOVE-THE-FOLD: EXACT MATCH WITH REFERENCE SCREENSHOT
              ================================================================ */}
          <div className="dash-above-fold" id="dash-top">
            {/* Welcome Greeting Row */}
            <div className="greeting-header-row">
              <div className="greeting-titles">
                <h1>Welcome, Administrator</h1>
                <p>National Infrastructure. Real-time Insights. Proactive Governance.</p>
              </div>
              <div className="greeting-motto">
                “Better Infrastructure. A Stronger Tomorrow.”
              </div>
            </div>

            {/* TOP 6 STAT KPI CARDS */}
            <div className="stat-cards-strip">
              {/* Card 1: Total Projects */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    <FolderGit2 size={16} />
                  </div>
                  <span className="stat-label-text">Total Projects</span>
                </div>
                <div className="stat-number-val">1,981</div>
                <div className="stat-sub-note">
                  <span className="stat-trend-green">↑ 12%</span>
                  <span>Across 17 Ministries</span>
                </div>
              </div>

              {/* Card 2: Original Cost */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>₹</span>
                  </div>
                  <span className="stat-label-text">Original Cost</span>
                </div>
                <div className="stat-number-val">₹ 37.13 Lakh Cr</div>
                <div className="stat-sub-note">
                  <span style={{ color: '#64748b' }}>Sanctioned Baseline</span>
                </div>
              </div>

              {/* Card 3: Revised Cost */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#ffedd5', color: '#c2410c' }}>
                    <Coins size={16} />
                  </div>
                  <span className="stat-label-text">Revised Cost</span>
                </div>
                <div className="stat-number-val">₹ 42.78 Lakh Cr</div>
                <div className="stat-sub-note">
                  <span className="stat-trend-up">↑ 15%</span>
                </div>
              </div>

              {/* Card 4: Cumulative Expenditure */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                    <TrendingUp size={16} />
                  </div>
                  <span className="stat-label-text">Cumulative Expenditure</span>
                </div>
                <div className="stat-number-val">₹ 20.36 Lakh Cr</div>
                <div className="stat-sub-note">
                  <span>48% of revised cost</span>
                </div>
              </div>

              {/* Card 5: High Risk Projects */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <span className="stat-label-text">High Risk Projects</span>
                </div>
                <div className="stat-number-val" style={{ color: '#dc2626' }}>146</div>
                <div className="stat-sub-note">
                  <span className="stat-trend-up">↑ 8%</span>
                </div>
              </div>

              {/* Card 6: Projects Delayed */}
              <div className="stat-box-card">
                <div className="stat-card-head">
                  <div className="stat-icon-wrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                    <Clock size={16} />
                  </div>
                  <span className="stat-label-text">Projects Delayed</span>
                </div>
                <div className="stat-number-val">428</div>
                <div className="stat-sub-note">
                  <span className="stat-trend-up">↑ 12%</span>
                </div>
              </div>
            </div>

            {/* ================================================================
                MAIN OVERVIEW: INDIA MAP (LEFT) + 2x2 WIDGETS (RIGHT)
                Exact layout as shown in the screenshot
                ================================================================ */}
            <div className="dash-overview-layout">
              {/* Left Column: Project Distribution Across India Map */}
              <div className="dash-overview-left">
                <StateDistributionMap onSelectState={handleMapSelectState} />
              </div>

              {/* Right Column: 2x2 Grid */}
              <div className="dash-overview-right">
                {/* 1. Risk Distribution Donut Chart */}
                <div className="dash-widget-panel">
                  <div className="widget-header-bar">
                    <div className="widget-header-title">
                      <span>Risk Distribution</span>
                    </div>
                  </div>

                  <div className="risk-donut-wrap">
                    {/* SVG Donut Chart */}
                    <div style={{ position: 'relative', width: '135px', height: '135px', flexShrink: 0 }}>
                      <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.8" />
                        
                        {/* Low Risk 56% (Green) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="4.8"
                          strokeDasharray="49.3 88"
                          strokeDashoffset="0"
                        />
                        
                        {/* Medium Risk 30% (Amber) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="4.8"
                          strokeDasharray="26.4 88"
                          strokeDashoffset="-49.3"
                        />

                        {/* High Risk 12% (Orange) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth="4.8"
                          strokeDasharray="10.5 88"
                          strokeDashoffset="-75.7"
                        />

                        {/* Critical Risk 3% (Red) */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="4.8"
                          strokeDasharray="2.6 88"
                          strokeDashoffset="-86.2"
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>1,981</span>
                        <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Projects</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="donut-legend-list">
                      <div className="donut-legend-row">
                        <div className="donut-color-box" style={{ background: '#10b981' }} />
                        <span>Low Risk <strong style={{ marginLeft: '4px' }}>1,102 (56%)</strong></span>
                      </div>
                      <div className="donut-legend-row">
                        <div className="donut-color-box" style={{ background: '#f59e0b' }} />
                        <span>Medium Risk <strong style={{ marginLeft: '4px' }}>587 (30%)</strong></span>
                      </div>
                      <div className="donut-legend-row">
                        <div className="donut-color-box" style={{ background: '#ea580c' }} />
                        <span>High Risk <strong style={{ marginLeft: '4px' }}>233 (12%)</strong></span>
                      </div>
                      <div className="donut-legend-row">
                        <div className="donut-color-box" style={{ background: '#dc2626' }} />
                        <span>Critical Risk <strong style={{ marginLeft: '4px' }}>59 (3%)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Projects by Sector */}
                <div className="dash-widget-panel">
                  <div className="widget-header-bar">
                    <div className="widget-header-title">
                      <span>Projects by Sector</span>
                    </div>
                    <select
                      className="widget-dropdown-select"
                      value={sectorMetric}
                      onChange={e => setSectorMetric(e.target.value as any)}
                    >
                      <option value="count">No. of Projects</option>
                      <option value="outlay">Budget Outlay</option>
                    </select>
                  </div>

                  <div className="sector-list-box">
                    {SECTOR_BREAKDOWN.map((sec) => (
                      <div key={sec.name} className="sector-row">
                        <div className="sector-label-bar">
                          <span className="sector-name-with-icon">
                            {sectorIcon(sec.icon, sec.color)}
                            <span>{sec.name}</span>
                          </span>
                          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>
                            {sec.count}
                          </span>
                        </div>
                        <div className="sector-bar-track">
                          <div
                            className="sector-bar-fill"
                            style={{
                              width: `${(sec.count / 412) * 100}%`,
                              background: sec.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Cost & Time Overrun Trends */}
                <div className="dash-widget-panel">
                  <div className="widget-header-bar">
                    <div className="widget-header-title">
                      <span>Cost & Time Overrun Trends</span>
                    </div>
                    <select
                      className="widget-dropdown-select"
                      value={overrunRange}
                      onChange={e => setOverrunRange(e.target.value as any)}
                    >
                      <option value="5yr">Last 5 Years</option>
                      <option value="3yr">Last 3 Years</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>

                  <div className="trend-chart-box">
                    <div className="trend-legend-pills">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '3px', background: '#dc2626', borderRadius: '2px' }} />
                        <span style={{ fontSize: '11px', color: '#475569' }}>Cost Overrun (%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '3px', background: '#2563eb', borderRadius: '2px' }} />
                        <span style={{ fontSize: '11px', color: '#475569' }}>Time Overrun (%)</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '135px' }}>
                      <svg viewBox="0 0 500 130" style={{ width: '100%', height: '100%' }}>
                        {/* Grid Lines */}
                        <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <text x="10" y="24" fill="#94a3b8" fontSize="10">40%</text>

                        <line x1="40" y1="50" x2="490" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                        <text x="10" y="54" fill="#94a3b8" fontSize="10">30%</text>

                        <line x1="40" y1="80" x2="490" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                        <text x="10" y="84" fill="#94a3b8" fontSize="10">20%</text>

                        <line x1="40" y1="110" x2="490" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                        <text x="10" y="114" fill="#94a3b8" fontSize="10">10%</text>

                        {/* Cost Overrun Line (Red) */}
                        <polyline
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="2.4"
                          points="60,105 140,88 220,77 300,65 380,53 460,44"
                        />
                        {/* Cost Points */}
                        {OVERRUN_TRENDS.map((pt, i) => {
                          const cx = 60 + i * 80
                          const cy = 130 - pt.costOverrun * 2.7
                          return (
                            <g key={`cost-${pt.year}`}>
                              <circle cx={cx} cy={cy} r="3.5" fill="#dc2626" />
                              {i === OVERRUN_TRENDS.length - 1 && (
                                <text x={cx + 6} y={cy + 4} fill="#dc2626" fontWeight="800" fontSize="11">32%</text>
                              )}
                            </g>
                          )
                        })}

                        {/* Time Overrun Line (Blue) */}
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.4"
                          points="60,113 140,102 220,93 300,87 380,82 460,82"
                        />
                        {/* Time Points */}
                        {OVERRUN_TRENDS.map((pt, i) => {
                          const cx = 60 + i * 80
                          const cy = 130 - pt.timeOverrun * 2.7
                          return (
                            <g key={`time-${pt.year}`}>
                              <circle cx={cx} cy={cy} r="3.5" fill="#2563eb" />
                              {i === OVERRUN_TRENDS.length - 1 && (
                                <text x={cx + 6} y={cy + 4} fill="#1d4ed8" fontWeight="800" fontSize="11">18%</text>
                              )}
                            </g>
                          )
                        })}

                        {/* Year Axis Labels */}
                        {OVERRUN_TRENDS.map((pt, i) => (
                          <text key={`lbl-${pt.year}`} x={60 + i * 80} y="128" textAnchor="middle" fill="#64748b" fontSize="10">
                            {pt.year}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 4. Top 5 High Risk Projects */}
                <div className="dash-widget-panel">
                  <div className="widget-header-bar">
                    <div className="widget-header-title">
                      <span>Top 5 High Risk Projects</span>
                    </div>
                    <button
                      className="widget-view-all-link"
                      onClick={() => scrollToSection('dash-project-explorer', 'portfolio')}
                    >
                      View All
                    </button>
                  </div>

                  <div className="table-data-wrap">
                    <table className="mini-data-table">
                      <thead>
                        <tr>
                          <th>Project Name</th>
                          <th>Ministry</th>
                          <th style={{ textAlign: 'right' }}>Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TOP_HIGH_RISK_PROJECTS.map((hp) => (
                          <tr
                            key={hp.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedProject(hp)
                              setDrawerTab('details')
                            }}
                          >
                            <td style={{ fontWeight: 700 }}>{hp.name}</td>
                            <td style={{ color: '#475569' }}>{hp.ministry}</td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="risk-score-num">{hp.riskScore}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* FULL-WIDTH ROW: RECENT ALERTS */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <span>Recent Alerts</span>
                </div>
                <button
                  className="widget-view-all-link"
                  onClick={() => scrollToSection('dash-early-warning', 'early-warning')}
                >
                  View All
                </button>
              </div>

              <div className="table-data-wrap">
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Type</th>
                      <th>Project Name</th>
                      <th>Alert</th>
                      <th style={{ width: '130px' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((al) => (
                      <tr key={al.id}>
                        <td>
                          <span className={`alert-type-badge ${al.severity.toLowerCase()}`}>
                            {al.severity === 'Critical' ? (
                              <AlertTriangle size={12} color="#dc2626" />
                            ) : al.severity === 'Warning' ? (
                              <AlertTriangle size={12} color="#d97706" />
                            ) : (
                              <AlertCircle size={12} color="#2563eb" />
                            )}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{al.projectName}</td>
                        <td style={{ color: '#475569' }}>{al.title}</td>
                        <td style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {al.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ================================================================
              SCROLL DIVIDER & INVITATION (USER REQUIREMENT)
              "it should be scrollable don't add all features at the front
              make others features look after scrolling the dashboard"
              ================================================================ */}
          <div className="scroll-divider-banner">
            <div className="scroll-divider-left">
              <ChevronDown size={18} color="#2563eb" />
              <div>
                <div className="scroll-divider-title">National Infrastructure Command Modules & Deep Dive</div>
                <div className="scroll-divider-sub">Scroll below to inspect full portfolio explorer, state analytics, AI early warning sensors, and ministry escalation records.</div>
              </div>
            </div>
            <button
              className="inspect-btn"
              onClick={() => scrollToSection('dash-project-explorer', 'explorer')}
            >
              Explore All Modules ↓
            </button>
          </div>

          {/* ================================================================
              EXTENDED MODULES BELOW THE FOLD (REVEALED AFTER SCROLLING)
              ================================================================ */}
          <div className="dash-below-fold">
            {/* MODULE 1: NATIONAL PROJECT EXPLORER & MULTI-FILTER MATRIX */}
            <section id="dash-project-explorer" style={{ scrollMarginTop: '65px' }}>
              <div className="extended-section-header">
                <div>
                  <div className="extended-section-title">
                    <Compass size={18} color="#2563eb" />
                    <span>National Project Portfolio Explorer</span>
                  </div>
                  <div className="extended-section-sub">
                    Multi-criteria filtering across 1,981 central sector infrastructure projects monitored by MoSPI.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="inspect-btn" onClick={() => showToast('Exporting 1,981 projects to MoSPI Excel template...')}>
                    <Download size={12} style={{ marginRight: '4px' }} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Multi-Filter Bar */}
              <div className="filter-matrix-bar" style={{ marginTop: '12px', marginBottom: '12px' }}>
                <div className="filter-input-wrap">
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Filter by project name, contractor, code..."
                    value={globalSearch}
                    onChange={e => setGlobalSearch(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select"
                  value={explorerMinistry}
                  onChange={e => setExplorerMinistry(e.target.value)}
                >
                  <option value="all">All Ministries (17)</option>
                  <option value="road">Road Transport & Highways (MoRTH)</option>
                  <option value="power">Power & Energy</option>
                  <option value="rail">Railways</option>
                  <option value="jal">Jal Shakti</option>
                  <option value="urban">Housing & Urban Affairs</option>
                </select>

                <select
                  className="filter-select"
                  value={explorerRisk}
                  onChange={e => setExplorerRisk(e.target.value)}
                >
                  <option value="all">All Risk Tiers</option>
                  <option value="critical">Critical Risk</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>

                <select
                  className="filter-select"
                  value={explorerStatus}
                  onChange={e => setExplorerStatus(e.target.value)}
                >
                  <option value="all">All Execution Statuses</option>
                  <option value="delayed">Delayed / Slipped Completion</option>
                  <option value="ontrack">On Track</option>
                </select>
              </div>

              {/* Interactive Table */}
              <div className="dash-widget-panel">
                <div className="table-data-wrap">
                  <table className="full-project-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Project Name</th>
                        <th>Ministry</th>
                        <th>State</th>
                        <th>Sanctioned (₹ Cr)</th>
                        <th>Revised (₹ Cr)</th>
                        <th>Overrun</th>
                        <th>Physical Progress</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((proj) => {
                        const costDiff = proj.revisedCostCr - proj.originalCostCr
                        return (
                          <tr key={proj.id}>
                            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#64748b' }}>
                              {proj.code}
                            </td>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>
                              {proj.name}
                            </td>
                            <td style={{ color: '#475569' }}>{proj.ministry}</td>
                            <td style={{ color: '#475569' }}>{proj.state}</td>
                            <td style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                              ₹{proj.originalCostCr.toLocaleString()}
                            </td>
                            <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700 }}>
                              ₹{proj.revisedCostCr.toLocaleString()}
                            </td>
                            <td>
                              {costDiff > 0 ? (
                                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '11.5px' }}>
                                  +{proj.costOverrunPercent}%
                                </span>
                              ) : (
                                <span style={{ color: '#059669', fontSize: '11.5px' }}>0%</span>
                              )}
                            </td>
                            <td style={{ minWidth: '120px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-bar-wrap" style={{ flex: 1 }}>
                                  <div
                                    className="progress-bar-fill"
                                    style={{
                                      width: `${proj.physicalProgressPercent}%`,
                                      background: proj.physicalProgressPercent > 80 ? '#10b981' : '#f59e0b'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                                  {proj.physicalProgressPercent}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge-pill ${proj.riskTier === 'Critical' ? 'critical' : proj.delayMonths > 0 ? 'delayed' : 'ontrack'}`}>
                                {proj.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="inspect-btn"
                                onClick={() => {
                                  setSelectedProject(proj)
                                  setDrawerTab('details')
                                }}
                              >
                                <Eye size={12} style={{ marginRight: '3px' }} /> Inspect
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* MODULE 2: STATE INFRASTRUCTURE DEEP DIVE */}
            <section id="dash-state-breakdown" style={{ scrollMarginTop: '65px' }}>
              <div className="extended-section-header">
                <div>
                  <div className="extended-section-title">
                    <BarChart3 size={18} color="#2563eb" />
                    <span>State-wise Infrastructure Deep Dive ({selectedStateName})</span>
                  </div>
                  <div className="extended-section-sub">
                    Synced with the national map above. Click any state on the map to switch telemetry.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Select State:</span>
                  <select
                    className="filter-select"
                    value={selectedStateName}
                    onChange={e => setSelectedStateName(e.target.value)}
                  >
                    {['Maharashtra', 'Uttar Pradesh', 'Gujarat', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Bihar', 'Rajasthan', 'West Bengal', 'Assam', 'Odisha'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dash-feature-grid-3" style={{ marginTop: '12px' }}>
                <div className="feature-insight-card">
                  <h3><Building2 size={16} color="#2563eb" /> State Portfolio Scale</h3>
                  <p>Comprehensive monitoring of ongoing mega capital works under central sector oversight in {selectedStateName}.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>{selectedStateName === 'Uttar Pradesh' ? '298' : selectedStateName === 'Maharashtra' ? '221' : '100+'}</strong>
                      <span>Total Projects</span>
                    </div>
                    <div>
                      <strong>₹2.45 Lakh Cr</strong>
                      <span>Sanctioned Capital</span>
                    </div>
                  </div>
                </div>

                <div className="feature-insight-card">
                  <h3><Clock size={16} color="#ea580c" /> Execution Slippage Rate</h3>
                  <p>Milestone slippage and Right-of-Way (ROW) clearance status flagged for high priority nodal intervention.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>18.4%</strong>
                      <span>Avg Schedule Slip</span>
                    </div>
                    <div>
                      <strong>{selectedStateName === 'Maharashtra' ? '42' : '38'}</strong>
                      <span>Need Intervention</span>
                    </div>
                  </div>
                </div>

                <div className="feature-insight-card">
                  <h3><Cpu size={16} color="#059669" /> Telemetry Probes Active</h3>
                  <p>IoT geotechnical sensors and drone LiDAR surveys validating actual field progress against contractor billing.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>98.4%</strong>
                      <span>Sensor Uptime</span>
                    </div>
                    <div>
                      <strong>24/7</strong>
                      <span>Real-time Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MODULE 3: PREDICTIVE AI RISK & EARLY WARNING INTELLIGENCE */}
            <section id="dash-early-warning" style={{ scrollMarginTop: '65px' }}>
              <div className="extended-section-header">
                <div>
                  <div className="extended-section-title">
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>Predictive AI Risk & Geotechnical Early Warning Center</span>
                  </div>
                  <div className="extended-section-sub">
                    Multi-modal ML models forecasting cost overrun probability, rainfall/monsoon delays, and supply chain bottlenecks.
                  </div>
                </div>
                <button
                  className="inspect-btn"
                  style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
                  onClick={() => showToast('Dispatched automated MoSPI Nodal Notice to Project Directors.')}
                >
                  <Send size={12} style={{ marginRight: '4px' }} /> Dispatch Nodal Escalation Notice
                </button>
              </div>

              <div className="dash-feature-grid-3" style={{ marginTop: '12px' }}>
                <div className="feature-insight-card" style={{ borderLeft: '3px solid #dc2626' }}>
                  <h3><Cpu size={16} color="#dc2626" /> Geotechnical Anomaly Probes</h3>
                  <p>Slope instability & tunnel seepage sensors triggered in Himalayan rail tunnels and Western Ghats highways.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>14</strong>
                      <span>Active Warnings</span>
                    </div>
                    <div>
                      <strong>High</strong>
                      <span>Severity Rating</span>
                    </div>
                  </div>
                </div>

                <div className="feature-insight-card" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <h3><Droplets size={16} color="#f59e0b" /> Weather & Monsoon Radar</h3>
                  <p>Early warning for intense precipitation affecting bridge piers and earthwork excavation phases.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>6 Districts</strong>
                      <span>Under Rain Watch</span>
                    </div>
                    <div>
                      <strong>DoNER</strong>
                      <span>Lead Taskforce</span>
                    </div>
                  </div>
                </div>

                <div className="feature-insight-card" style={{ borderLeft: '3px solid #2563eb' }}>
                  <h3><Factory size={16} color="#2563eb" /> Supply Chain Inflation Index</h3>
                  <p>Cement and structural steel price escalations monitored against original tender price variation clauses.</p>
                  <div className="feature-metric-row">
                    <div>
                      <strong>+7.2%</strong>
                      <span>Steel Input Cost</span>
                    </div>
                    <div>
                      <strong>MoRTH</strong>
                      <span>Highest Outlay Impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* MODULE 4 & 5: COST & TIME OVERRUN ANALYTICS */}
            <section id="dash-cost-overrun" style={{ scrollMarginTop: '65px' }}>
              <div className="extended-section-header">
                <div>
                  <div className="extended-section-title">
                    <TrendingUp size={18} color="#2563eb" />
                    <span>Cost & Time Overrun Analysis by Ministry</span>
                  </div>
                  <div className="extended-section-sub">
                    Cumulative financial escalation vs sanctioned budget across central infrastructure ministries.
                  </div>
                </div>
              </div>

              <div className="dash-widget-panel" style={{ marginTop: '12px', padding: '18px 22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Sanctioned</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>₹37.13 Lakh Cr</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Revised Estimated</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>₹42.78 Lakh Cr</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Net Escalation</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>+₹5.65 Lakh Cr</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Average Slipped Months</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>+22 Months</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                    Ministry Cost Outlay Comparison (Sanctioned vs Revised)
                  </div>
                  {[
                    { ministry: 'Road Transport & Highways (MoRTH)', orig: 14.2, rev: 16.5, color: '#2563eb' },
                    { ministry: 'Railways (Ministry of Railways)', orig: 11.4, rev: 13.8, color: '#06b6d4' },
                    { ministry: 'Power & Renewable Energy', orig: 6.2, rev: 7.1, color: '#10b981' },
                    { ministry: 'Jal Shakti & River Development', orig: 2.8, rev: 3.2, color: '#f59e0b' }
                  ].map((item) => (
                    <div key={item.ministry} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{item.ministry}</span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#64748b' }}>
                          ₹{item.orig}L Cr → <strong style={{ color: '#dc2626' }}>₹{item.rev}L Cr</strong>
                        </span>
                      </div>
                      <div className="progress-bar-wrap" style={{ height: '7px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${(item.rev / 18) * 100}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* MODULE 6: MOSPI EXECUTIVE OPERATIONS & REPORTS */}
            <section id="dash-reports" style={{ scrollMarginTop: '65px', marginBottom: '20px' }}>
              <div className="extended-section-header">
                <div>
                  <div className="extended-section-title">
                    <FileText size={18} color="#2563eb" />
                    <span>Executive Operations & MoSPI Reports Console</span>
                  </div>
                  <div className="extended-section-sub">
                    Generate official bulletins, export sanitized telemetry, and configure autonomous project surveillance agents.
                  </div>
                </div>
              </div>

              <div className="reports-action-strip" style={{ marginTop: '12px' }}>
                <button
                  className="report-action-btn"
                  onClick={() => showToast('Compiling MoSPI Monthly Infrastructure Bulletin (PDF)...')}
                >
                  <FileText size={15} color="#2563eb" />
                  <span>Download Monthly Bulletin (PDF)</span>
                </button>

                <button
                  className="report-action-btn"
                  onClick={() => showToast('Exporting sanitized telemetry dataset (CSV)...')}
                >
                  <FileSpreadsheet size={15} color="#059669" />
                  <span>Export National Telemetry (CSV)</span>
                </button>

                <button
                  className="report-action-btn"
                  onClick={() => showToast('Autonomous Drone LiDAR survey request dispatched to survey contractor.')}
                >
                  <Cpu size={15} color="#ea580c" />
                  <span>Schedule Drone Telemetry Survey</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* ================================================================
            SOVEREIGN BOTTOM BAR (MATCHING FOOTER IN SCREENSHOT)
            ================================================================ */}
        <footer className="sovereign-bottom-bar">
          <div className="bottom-brand-chain">
            <span className="bold-nirikshan">Nirikshan</span>
            <span>|</span>
            <span>Predictive Insights</span>
            <span>|</span>
            <span>Proactive Governance</span>
            <span>|</span>
            <span>Efficient Infrastructure</span>
            <span>|</span>
            <span>Developed India</span>
          </div>

          <div className="bottom-gov-sig">
            <svg width="16" height="20" viewBox="0 0 100 130" fill="none">
              <path d="M50 8C38 8 30 18 30 30C30 42 36 50 44 54C42 58 38 64 34 72C28 84 22 96 22 108C22 116 34 122 50 122C66 122 78 116 78 108C78 96 72 84 66 72C62 64 58 58 56 54C64 50 70 42 70 30C70 18 62 8 50 8Z" fill="#38bdf8" />
            </svg>
            <span>Ministry of Statistics and Programme Implementation, Government of India</span>
          </div>
        </footer>
      </main>

      {/* ====================================================================
          PROJECT INSPECTION SLIDEOUT DRAWER
          ==================================================================== */}
      <AnimatePresence>
        {selectedProject && (
          <div className="drawer-backdrop" onClick={() => setSelectedProject(null)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="drawer-panel"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="drawer-header">
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px' }}>
                    {selectedProject.code}
                  </span>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {selectedProject.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedProject.agency} · {selectedProject.state}
                  </div>
                </div>
                <button className="drawer-close-btn" onClick={() => setSelectedProject(null)}>
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Tab Switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 20px' }}>
                {[
                  { id: 'details', label: 'Overview & Status' },
                  { id: 'financials', label: 'Financial Health' },
                  { id: 'notes', label: `Audit Log (${selectedProject.auditNotes.length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id as any)}
                    style={{
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: drawerTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                      fontWeight: drawerTab === tab.id ? 800 : 600,
                      fontSize: '12.5px',
                      color: drawerTab === tab.id ? '#0f172a' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Body */}
              <div className="drawer-body">
                {drawerTab === 'details' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Risk Rating</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>
                          {selectedProject.riskScore} / 100
                        </div>
                        <span className="status-badge-pill critical" style={{ display: 'inline-block', marginTop: '4px' }}>
                          {selectedProject.riskTier} Severity
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Execution Status</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                          {selectedProject.status}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                          Delay: <strong>+{selectedProject.delayMonths} mos</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                        Primary Execution Bottleneck
                      </div>
                      <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '12.5px', lineHeight: 1.4, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        {selectedProject.primaryBottleneck}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                        Contractor & Surveillance Telemetry
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#0f172a' }}>
                        Lead EPC Contractor: <strong>{selectedProject.contractor}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        IoT Sensor Probes: <strong>{selectedProject.sensorCount} active streams</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Drone LiDAR Surveillance: <strong>{selectedProject.droneTelemetryActive ? 'Operational' : 'Scheduled'}</strong>
                      </div>
                    </div>
                  </>
                )}

                {drawerTab === 'financials' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748b' }}>Original Sanctioned:</span>
                        <span style={{ fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>₹{selectedProject.originalCostCr.toLocaleString()} Cr</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748b' }}>Revised Projected:</span>
                        <span style={{ fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', color: '#dc2626' }}>₹{selectedProject.revisedCostCr.toLocaleString()} Cr</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 800 }}>Net Escalation Overrun:</span>
                        <span style={{ fontWeight: 900, fontFamily: 'IBM Plex Mono, monospace', color: '#dc2626' }}>
                          +₹{(selectedProject.revisedCostCr - selectedProject.originalCostCr).toLocaleString()} Cr (+{selectedProject.costOverrunPercent}%)
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Financial Progress (Disbursed Outlay):</span>
                        <span>{selectedProject.financialProgressPercent}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${selectedProject.financialProgressPercent}%`, background: '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                        <span>Physical Work Completion:</span>
                        <span>{selectedProject.physicalProgressPercent}%</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${selectedProject.physicalProgressPercent}%`, background: '#f59e0b' }} />
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'notes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                        Add Officer Audit Remark:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Record field observation, geotechnical delay, or contractor penalty remark..."
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', resize: 'vertical' }}
                      />
                      <button
                        type="submit"
                        className="inspect-btn"
                        style={{ background: '#0c1527', color: '#ffffff', alignSelf: 'flex-end', border: 'none', padding: '8px 14px' }}
                      >
                        <Send size={12} style={{ marginRight: '4px' }} /> Record Remark
                      </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                      {selectedProject.auditNotes.map((note, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', marginBottom: '3px' }}>
                            <strong>{note.author}</strong>
                            <span>{note.date}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                            {note.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
