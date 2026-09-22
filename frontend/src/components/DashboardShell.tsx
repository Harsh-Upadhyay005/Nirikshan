import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderGit2, MapPin, AlertTriangle,
  DollarSign, Clock, BarChart3, FileText, Database,
  Users, Settings, Activity, Bell, Search, LogOut, ChevronRight,
} from 'lucide-react'

// ── ALL possible nav items ────────────────────────────────────────────────
const ALL_NAV = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard, path: '/dashboard', roles: ['admin','ministry_officer','auditor'] },
  { id: 'portfolio',  label: 'Project Portfolio',  icon: FolderGit2,      path: '/portfolio', roles: ['admin','ministry_officer','auditor'] },
  { id: 'explorer',   label: 'Project Explorer',   icon: MapPin,          path: '/explorer',  roles: ['admin','ministry_officer','auditor'] },
  { id: 'risk',       label: 'Risk & Warnings',    icon: AlertTriangle,   path: '/risk',      roles: ['admin','ministry_officer','auditor'] },
  { id: 'cost',       label: 'Cost Overrun',        icon: DollarSign,      path: '/cost',      roles: ['admin','ministry_officer','auditor'] },
  { id: 'time',       label: 'Time Overrun',        icon: Clock,           path: '/time',      roles: ['admin','ministry_officer','auditor'] },
  { id: 'analytics',  label: 'Analytics',           icon: BarChart3,       path: '/analytics', roles: ['admin','auditor'] },
  { id: 'reports',    label: 'Reports',             icon: FileText,        path: '/reports',   roles: ['admin','ministry_officer','auditor'] },
  { id: 'data',       label: 'Data Management',     icon: Database,        path: '/data',      roles: ['admin','ministry_officer'] },
  { id: 'users',      label: 'Subscriptions',       icon: Bell,            path: '/users',     roles: ['admin','ministry_officer','auditor'] },
  { id: 'settings',   label: 'Settings',            icon: Settings,        path: '/settings',  roles: ['admin','ministry_officer','auditor'] },
  { id: 'usermgmt',   label: 'User Management',     icon: Users,           path: '/users',     roles: ['admin'] },
]

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}

// ── Role colours ──────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; gradient: string; badge: string }> = {
  admin:            { label: 'MoSPI Admin',       gradient: 'linear-gradient(135deg,#f97316,#fb923c)', badge: '#f97316' },
  ministry_officer: { label: 'Ministry Officer',  gradient: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', badge: '#0ea5e9' },
  auditor:          { label: 'CAG Auditor',        gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', badge: '#8b5cf6' },
}

export function DashboardShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [time, setTime] = useState(new Date())
  const [searchFocused, setFocused] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('nirikshan_token')
    if (!token) { navigate('/login', { replace: true }); return }
    fetch('/api/v1/notifications?unread_only=true&limit=50', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(n => setNotifCount(Array.isArray(n) ? n.length : 0))
      .catch(() => setNotifCount(0))
  }, [navigate])

  const stored = localStorage.getItem('nirikshan_user')
  const user   = stored ? JSON.parse(stored) : null
  if (!user) return null

  const role     = (user.role ?? 'auditor') as string
  const meta     = ROLE_META[role] ?? ROLE_META.auditor
  const initials = user.email.slice(0, 2).toUpperCase()

  // Filter nav items to only those allowed for this role
  // Deduplicate by path (usermgmt and users both go to /users — show only one)
  const navItems = ALL_NAV.filter(n => n.roles.includes(role))
    .filter((item, idx, arr) => arr.findIndex(x => x.path === item.path) === idx)

  const activeId = navItems.find(n => location.pathname === n.path)?.id ?? 'dashboard'

  function handleLogout() {
    localStorage.removeItem('nirikshan_token')
    localStorage.removeItem('nirikshan_user')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '196px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Brand */}
        <div onClick={() => navigate('/dashboard')} style={{ padding: '14px 14px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{ width: '30px', height: '30px', background: meta.gradient, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Activity size={17} color="white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Nirikshan</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>Infrastructure Monitor</div>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.badge, flexShrink: 0 }} />
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {meta.label}
            {role === 'ministry_officer' && user.ministry_name ? ` · ${user.ministry_name.replace('Ministry of ', '')}` : ''}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon   = item.icon
            const active = activeId === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileHover={!active ? { x: 3 } : {}}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', marginBottom: '1px',
                  background: active ? meta.gradient : 'transparent',
                  color: active ? 'white' : '#64748b',
                  border: 'none', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12.5px', fontWeight: 600, textAlign: 'left',
                  boxShadow: active ? `0 2px 10px ${meta.badge}44` : 'none',
                  transition: 'background .15s, color .15s, box-shadow .15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#fff7ed'
                    e.currentTarget.style.color = '#f97316'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }
                }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    style={{ position: 'absolute', inset: 0, background: meta.gradient, borderRadius: '7px', zIndex: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={15} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, position: 'relative', zIndex: 1 }}>
                  {item.label}
                </span>
                {active && <ChevronRight size={12} style={{ opacity: .7, flexShrink: 0, position: 'relative', zIndex: 1 }} />}
              </motion.button>
            )
          })}
        </nav>

        {/* Footer emblem */}
        <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fafafa', textAlign: 'center' }}>
          <img
            src="/emblem-of-india.svg"
            alt="GoI emblem"
            style={{ width: '44px', height: '44px', opacity: .75, display: 'block', margin: '0 auto 6px' }}
            onError={e => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg' }}
          />
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Ministry of Statistics &amp;</div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Programme Implementation</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>Govt. of India</div>
          <div style={{ fontSize: '10px', color: meta.badge, fontWeight: 700, fontStyle: 'italic', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
            सत्यमेव जयते
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: searchFocused ? '420px' : '320px', transition: 'width .25s ease', maxWidth: '420px' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? '#f97316' : '#94a3b8', transition: 'color .2s' }} />
            <input
              type="text"
              placeholder="Search projects, ministries, states…"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1.5px solid ${searchFocused ? '#f97316' : '#e2e8f0'}`, borderRadius: '7px', fontSize: '12.5px', outline: 'none', background: searchFocused ? 'white' : '#f8fafc', color: '#1e293b', transition: 'border .2s, background .2s' }}
            />
          </div>

          <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace', marginLeft: 'auto', letterSpacing: '0.02em', background: '#f8fafc', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}{' '}
            <strong style={{ color: '#1e293b' }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </strong>
          </div>

          <motion.button
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/users')}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <Bell size={18} color="#64748b" />
            {notifCount > 0 && (
              <span style={{ position: 'absolute', top: '1px', right: '0px', minWidth: '14px', height: '14px', padding: '0 3px', background: '#ef4444', color: 'white', borderRadius: '8px', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800 }}>
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 4px 14px rgba(0,0,0,.12)' }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', background: meta.gradient, borderRadius: '7px', color: 'white', cursor: 'default' }}
          >
            <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: meta.badge, fontSize: '11px' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>{user.email.split('@')[0]}</div>
              <div style={{ fontSize: '9.5px', opacity: .9, lineHeight: 1.2 }}>{meta.label}</div>
            </div>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.04, background: '#fee2e2' }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}
          >
            <LogOut size={13} /> Sign out
          </motion.button>
        </header>

        {/* RBAC banners */}
        {role === 'ministry_officer' && user.ministry_name && (
          <div style={{ padding: '8px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0 }}>
            <span>🔒</span>
            <span style={{ color: '#1e40af' }}>
              <strong>Ministry Officer Scope:</strong> You are viewing projects for{' '}
              <strong style={{ color: '#1d4ed8' }}>{user.ministry_name}</strong> only — enforced server-side by the API.
              Other ministries' data is not accessible to this account.
            </span>
          </div>
        )}
        {role === 'auditor' && (
          <div style={{ padding: '8px 20px', background: '#f5f3ff', borderBottom: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0 }}>
            <span>📋</span>
            <span style={{ color: '#5b21b6' }}>
              <strong>CAG Auditor Mode:</strong> Read-only access across all ministries. Prediction and data management tools are disabled for this role.
            </span>
          </div>
        )}

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
