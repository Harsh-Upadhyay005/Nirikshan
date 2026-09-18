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
  DollarSign,
  PieChart,
  Eye,
  CheckCircle2,
  X,
  ExternalLink,
  Send,
  Download,
  ShieldCheck,
  ChevronDown
} from 'lucide-react'
import {
  INITIAL_PROJECTS,
  RECENT_ALERTS,
  TOP_HIGH_RISK_PROJECTS,
  SECTOR_BREAKDOWN,
  OVERRUN_TRENDS,
  type InfraProject,
  type AnomalyAlert
} from '../data/mockDashboardData'
import { StateDistributionMap } from '../components/StateDistributionMap'
import '../dashboard.css'

export function DashboardPage() {
  // Navigation State
  const [activeNav, setActiveNav] = useState<string>('dashboard')
  
  // Data States
  const [projects, setProjects] = useState<InfraProject[]>(INITIAL_PROJECTS)
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(RECENT_ALERTS)
  const [selectedProject, setSelectedProject] = useState<InfraProject | null>(null)
  const [drawerTab, setDrawerTab] = useState<'details' | 'financials' | 'notes'>('details')
  const [newNoteText, setNewNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // UI Interactive Dropdowns
  const [sectorMetric, setSectorMetric] = useState<'count' | 'outlay'>('count')
  const [overrunRange, setOverrunRange] = useState<'5yr' | '3yr' | 'all'>('5yr')
  const [notificationsOpen, setNotificationsOpen] = useState(false)

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
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.ministry.toLowerCase().includes(q) ||
      p.contractor.toLowerCase().includes(q)
    )
  }, [projects, searchQuery])

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
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
    setNewNoteText('')
    showToast('Audit note logged in project record.')
  }

  return (
    <div className="app-shell">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: '#0f172a',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              borderLeft: '4px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 110
            }}
          >
            <CheckCircle2 size={16} color="#f59e0b" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          ATTRACTIVE OBSIDIAN & SAFFRON SIDEBAR (NO BLUE)
          ==================================================================== */}
      <aside className="attractive-sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-gem">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="brand-naming">
            <div className="brand-main-title">
              Nirikshan
              <span className="brand-devanagari-sub">निरीक्षण</span>
            </div>
            <span className="brand-sub-tagline">AI for Infrastructure Monitoring</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="sidebar-menu-list">
          <div className="sidebar-section-heading">COMMAND CENTER</div>

          <button
            className={`side-nav-btn ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <LayoutDashboard className="side-icon" size={17} />
            <span>Dashboard</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveNav('portfolio')}
          >
            <FolderGit2 className="side-icon" size={17} />
            <span>Project Portfolio</span>
            <span className="side-badge warning">1,981</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveNav('explorer')}
          >
            <Compass className="side-icon" size={17} />
            <span>Project Explorer</span>
          </button>

          <div className="sidebar-section-heading">RISK & INTELLIGENCE</div>

          <button
            className={`side-nav-btn ${activeNav === 'early-warning' ? 'active' : ''}`}
            onClick={() => setActiveNav('early-warning')}
          >
            <AlertTriangle className="side-icon" size={17} />
            <span>Risk & Early Warning</span>
            <span className="side-badge danger">146</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'cost-overrun' ? 'active' : ''}`}
            onClick={() => setActiveNav('cost-overrun')}
          >
            <TrendingUp className="side-icon" size={17} />
            <span>Cost Overrun Analysis</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'time-overrun' ? 'active' : ''}`}
            onClick={() => setActiveNav('time-overrun')}
          >
            <Clock className="side-icon" size={17} />
            <span>Time Overrun Analysis</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveNav('analytics')}
          >
            <BarChart3 className="side-icon" size={17} />
            <span>Analytics & Insights</span>
          </button>

          <div className="sidebar-section-heading">SYSTEM & AUDIT</div>

          <button
            className={`side-nav-btn ${activeNav === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveNav('reports')}
          >
            <FileText className="side-icon" size={17} />
            <span>Reports</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'data-mgmt' ? 'active' : ''}`}
            onClick={() => setActiveNav('data-mgmt')}
          >
            <Database className="side-icon" size={17} />
            <span>Data Management</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'users' ? 'active' : ''}`}
            onClick={() => setActiveNav('users')}
          >
            <Users className="side-icon" size={17} />
            <span>User Management</span>
          </button>

          <button
            className={`side-nav-btn ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <Settings className="side-icon" size={17} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer: Sovereign Insignia */}
        <div className="sidebar-footer-insignia">
          {/* Ashoka Emblem Silhouette in Warm Gold */}
          <svg className="emblem-gold-svg" viewBox="0 0 100 130" fill="none">
            <path
              d="M50 8C38 8 30 18 30 30C30 42 36 50 44 54C42 58 38 64 34 72C28 84 22 96 22 108C22 116 34 122 50 122C66 122 78 116 78 108C78 96 72 84 66 72C62 64 58 58 56 54C64 50 70 42 70 30C70 18 62 8 50 8Z"
              fill="url(#emblemGoldGradient)"
            />
            <defs>
              <linearGradient id="emblemGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>

          <div className="emblem-text-block">
            <span className="emblem-gov-title">Ministry of Statistics and Programme Implementation</span>
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
        {/* Top Command Bar */}
        <header className="top-command-bar">
          <div className="search-command-box">
            <Search className="search-command-icon" size={15} />
            <input
              type="text"
              placeholder="Search projects, ministries, states, sectors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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

            {/* User Profile AS / Admin MoSPI */}
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

            <Link to="/" title="Public Landing Portal" style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <ExternalLink size={16} />
            </Link>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <div className="dashboard-viewport">
          {/* Greeting Header Row */}
          <div className="greeting-header-row">
            <div className="greeting-titles">
              <h1>Welcome, Administrator</h1>
              <p>National Infrastructure. Real-time Insights. Proactive Governance.</p>
            </div>
            <div className="greeting-motto">
              “Better Infrastructure. A Stronger Tomorrow.”
            </div>
          </div>

          {/* ================================================================
              TOP 6 STAT KPI CARDS (IN A SINGLE ROW)
              ================================================================ */}
          <div className="stat-cards-strip">
            {/* Card 1: Total Projects */}
            <div className="stat-box-card">
              <div className="stat-card-head">
                <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
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
                <div className="stat-icon-wrap" style={{ background: '#d1fae5', color: '#047857' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>₹</span>
                </div>
                <span className="stat-label-text">Original Cost</span>
              </div>
              <div className="stat-number-val">₹ 37.13 Lakh Cr</div>
              <div className="stat-sub-note">
                <span>Sanctioned Allocation</span>
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
                <span>Net Escalation</span>
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
                <span>Critical Attention</span>
              </div>
            </div>

            {/* Card 6: Projects Delayed */}
            <div className="stat-box-card">
              <div className="stat-card-head">
                <div className="stat-icon-wrap" style={{ background: '#f1f5f9', color: '#334155' }}>
                  <Clock size={16} />
                </div>
                <span className="stat-label-text">Projects Delayed</span>
              </div>
              <div className="stat-number-val">428</div>
              <div className="stat-sub-note">
                <span className="stat-trend-up">↑ 12%</span>
                <span>Schedule Slippage</span>
              </div>
            </div>
          </div>

          {/* ================================================================
              ROW 2: INDIA MAP (COL 1) + RISK DONUT (COL 2) + SECTORS (COL 3)
              ================================================================ */}
          <div className="dash-row-grid">
            {/* Column 1: Project Distribution Across India Map */}
            <StateDistributionMap onSelectState={(st) => {
              showToast(`Selected ${st.name}: ${st.count} infrastructure projects`)
            }} />

            {/* Column 2: Risk Distribution Donut Chart */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <PieChart size={16} color="#f59e0b" />
                  <span>Risk Distribution</span>
                </div>
              </div>

              <div className="risk-donut-wrap">
                {/* SVG Donut Chart (Total 1,981 Projects) */}
                <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                    
                    {/* Low Risk 56% (Green) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4.5"
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
                      strokeWidth="4.5"
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
                      strokeWidth="4.5"
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
                      strokeWidth="4.5"
                      strokeDasharray="2.6 88"
                      strokeDashoffset="-86.2"
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>1,981</span>
                    <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Projects</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="donut-legend-list">
                  <div className="donut-legend-row">
                    <div className="donut-color-box" style={{ background: '#10b981' }} />
                    <span>Low Risk: <strong>1,102 (56%)</strong></span>
                  </div>
                  <div className="donut-legend-row">
                    <div className="donut-color-box" style={{ background: '#f59e0b' }} />
                    <span>Medium Risk: <strong>587 (30%)</strong></span>
                  </div>
                  <div className="donut-legend-row">
                    <div className="donut-color-box" style={{ background: '#ea580c' }} />
                    <span>High Risk: <strong>233 (12%)</strong></span>
                  </div>
                  <div className="donut-legend-row">
                    <div className="donut-color-box" style={{ background: '#dc2626' }} />
                    <span>Critical Risk: <strong>59 (3%)</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Projects by Sector */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <BarChart3 size={16} color="#f59e0b" />
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
                      <span>{sec.name}</span>
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
          </div>

          {/* ================================================================
              ROW 3: RECENT ALERTS (COL 1) + OVERRUN TRENDS (COL 2) + TOP 5 HIGH RISK (COL 3)
              ================================================================ */}
          <div className="dash-row-grid">
            {/* Column 1: Recent Alerts Table */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <AlertTriangle size={16} color="#dc2626" />
                  <span>Recent Alerts</span>
                </div>
                <button
                  className="widget-view-all-link"
                  onClick={() => setActiveNav('early-warning')}
                >
                  View All
                </button>
              </div>

              <div className="table-data-wrap">
                <table className="mini-data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Project Name</th>
                      <th>Alert</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((al) => (
                      <tr key={al.id}>
                        <td>
                          <span className={`alert-type-badge ${al.severity.toLowerCase()}`}>
                            <AlertTriangle size={12} />
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

            {/* Column 2: Cost & Time Overrun Trends Line Chart */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <TrendingUp size={16} color="#dc2626" />
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
                    <span style={{ width: '12px', height: '3px', background: '#ef4444', borderRadius: '2px' }} />
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>Cost Overrun (%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>Time Overrun (%)</span>
                  </div>
                </div>

                {/* SVG Line Chart (NO BLUE: Crimson & Emerald) */}
                <div style={{ width: '100%', height: '140px' }}>
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
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      points="60,105 140,88 220,77 300,65 380,53 460,44"
                    />
                    {/* Points */}
                    {OVERRUN_TRENDS.map((pt, i) => {
                      const cx = 60 + i * 80
                      const cy = 130 - pt.costOverrun * 2.7
                      return (
                        <g key={`cost-${pt.year}`}>
                          <circle cx={cx} cy={cy} r="3.5" fill="#ef4444" />
                          {i === OVERRUN_TRENDS.length - 1 && (
                            <text x={cx + 6} y={cy + 4} fill="#dc2626" fontWeight="800" fontSize="11">32%</text>
                          )}
                        </g>
                      )
                    })}

                    {/* Time Overrun Line (Emerald Green, Strictly No Blue) */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points="60,113 140,102 220,93 300,87 380,82 460,82"
                    />
                    {/* Points */}
                    {OVERRUN_TRENDS.map((pt, i) => {
                      const cx = 60 + i * 80
                      const cy = 130 - pt.timeOverrun * 2.7
                      return (
                        <g key={`time-${pt.year}`}>
                          <circle cx={cx} cy={cy} r="3.5" fill="#10b981" />
                          {i === OVERRUN_TRENDS.length - 1 && (
                            <text x={cx + 6} y={cy + 4} fill="#059669" fontWeight="800" fontSize="11">18%</text>
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

            {/* Column 3: Top 5 High Risk Projects Table */}
            <div className="dash-widget-panel">
              <div className="widget-header-bar">
                <div className="widget-header-title">
                  <ShieldCheck size={16} color="#dc2626" />
                  <span>Top 5 High Risk Projects</span>
                </div>
                <button
                  className="widget-view-all-link"
                  onClick={() => setActiveNav('portfolio')}
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

        {/* ================================================================
            SOVEREIGN BOTTOM BAR
            ================================================================ */}
        <footer className="sovereign-bottom-bar">
          <div className="bottom-brand-chain">
            <span style={{ fontWeight: 800, color: '#f59e0b' }}>Nirikshan</span>
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
            <svg width="18" height="22" viewBox="0 0 100 130" fill="none">
              <path d="M50 8C38 8 30 18 30 30C30 42 36 50 44 54C42 58 38 64 34 72C28 84 22 96 22 108C22 116 34 122 50 122C66 122 78 116 78 108C78 96 72 84 66 72C62 64 58 58 56 54C64 50 70 42 70 30C70 18 62 8 50 8Z" fill="#f59e0b" />
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
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {selectedProject.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedProject.agency} · {selectedProject.state}
                  </div>
                </div>
                <button className="drawer-close-btn" onClick={() => setSelectedProject(null)}>
                  <X size={16} />
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
                      borderBottom: drawerTab === tab.id ? '2px solid #f59e0b' : '2px solid transparent',
                      fontWeight: drawerTab === tab.id ? 800 : 600,
                      fontSize: '13px',
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Risk Rating</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>
                          {selectedProject.riskScore} / 100
                        </div>
                        <span className="risk-pill critical" style={{ marginTop: '4px' }}>
                          {selectedProject.riskTier} Threat
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Execution Status</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                          {selectedProject.status}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                          Delay: <strong>+{selectedProject.delayMonths} mos</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                        Primary Execution Bottleneck
                      </div>
                      <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: 1.4, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        {selectedProject.primaryBottleneck}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                        Contractor & Surveillance Telemetry
                      </div>
                      <div style={{ fontSize: '13px', color: '#0f172a' }}>
                        Lead EPC Contractor: <strong>{selectedProject.contractor}</strong>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                        IoT Sensor Probes: <strong>{selectedProject.sensorCount} active streams</strong>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        Drone Lidar Surveillance: <strong>{selectedProject.droneTelemetryActive ? 'Enabled' : 'Pending Deployment'}</strong>
                      </div>
                    </div>
                  </>
                )}

                {drawerTab === 'financials' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Original Sanctioned:</span>
                        <span style={{ fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>₹{selectedProject.originalCostCr.toLocaleString()} Cr</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Revised Projected:</span>
                        <span style={{ fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', color: '#dc2626' }}>₹{selectedProject.revisedCostCr.toLocaleString()} Cr</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>Net Escalation Overrun:</span>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                        Add Officer Audit Note:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Log observation, geotechnical finding, or compliance remark..."
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                      />
                      <button
                        type="submit"
                        className="header-btn"
                        style={{ background: '#0f172a', color: '#ffffff', alignSelf: 'flex-end', border: 'none' }}
                      >
                        <Send size={13} />
                        <span>Record Note</span>
                      </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                      {selectedProject.auditNotes.map((note, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                            <strong>{note.author}</strong>
                            <span>{note.date}</span>
                          </div>
                          <p style={{ fontSize: '12.5px', color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
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
