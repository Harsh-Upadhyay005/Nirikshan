import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderGit2, MapPin, AlertTriangle,
  DollarSign, Clock, BarChart3, FileText, Database,
  Users, Settings, Activity, Bell, Search, LogOut, ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard' },
  { id: 'portfolio',  label: 'Project Portfolio', icon: FolderGit2,      path: '/portfolio' },
  { id: 'explorer',   label: 'Project Explorer',  icon: MapPin,          path: '/explorer'  },
  { id: 'risk',       label: 'Risk & Warnings',   icon: AlertTriangle,   path: '/risk'      },
  { id: 'cost',       label: 'Cost Overrun',      icon: DollarSign,      path: '/cost'      },
  { id: 'time',       label: 'Time Overrun',      icon: Clock,           path: '/time'      },
  { id: 'analytics',  label: 'Analytics',         icon: BarChart3,       path: '/analytics' },
  { id: 'reports',    label: 'Reports',           icon: FileText,        path: '/reports'   },
  { id: 'data',       label: 'Data Management',   icon: Database,        path: '/data'      },
  { id: 'users',      label: 'User Management',   icon: Users,           path: '/users'     },
  { id: 'settings',   label: 'Settings',          icon: Settings,        path: '/settings'  },
]

// Page-content animation — only the content area fades/slides, never the shell
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}

export function DashboardShell() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [time, setTime]           = useState(new Date())
  const [searchVal, setSearchVal] = useState('')
  const [searchFocused, setFocused] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  // Live clock — ticks every second, shell never remounts so this runs once
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('nirikshan_token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    fetch('/api/v1/notifications?unread_only=true&limit=50', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => response.ok ? response.json() : [])
      .then(notifications => setNotificationCount(Array.isArray(notifications) ? notifications.length : 0))
      .catch(() => setNotificationCount(0))
  }, [navigate])

  const activeId = NAV_ITEMS.find(n => location.pathname === n.path)?.id ?? 'dashboard'
  const stored   = localStorage.getItem('nirikshan_user')
  const user     = stored ? JSON.parse(stored) : null
  if (!user) return null
  const initials = user.email.slice(0, 2).toUpperCase()
  const roleLabel = user.role === 'admin'
    ? 'MoSPI Admin'
    : user.role === 'ministry_officer'
    ? 'Ministry Officer'
    : 'Auditor'

  function handleLogout() {
    localStorage.removeItem('nirikshan_token')
    localStorage.removeItem('nirikshan_user')
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden',
    }}>

      {/* ══════════════════════════════
          SIDEBAR  — renders ONCE, never remounts
          ══════════════════════════════ */}
      <aside style={{
        width: '196px', background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '14px 14px 12px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '9px',
            cursor: 'pointer',
          }}
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              width: '30px', height: '30px',
              background: 'linear-gradient(135deg,#f97316,#fb923c)',
              borderRadius: '7px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Activity size={17} color="white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              Nirikshan
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>
              Infrastructure Monitor
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const Icon  = item.icon
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
                  background: active ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'transparent',
                  color: active ? 'white' : '#64748b',
                  border: 'none', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12.5px', fontWeight: 600, textAlign: 'left',
                  boxShadow: active ? '0 2px 10px rgba(249,115,22,.28)' : 'none',
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
                {/* Shared-layout active pill — animates between items */}
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg,#f97316,#fb923c)',
                      borderRadius: '7px', zIndex: 0,
                    }}
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
        <div style={{
          padding: '12px', borderTop: '1px solid #f1f5f9',
          background: '#fafafa', textAlign: 'center',
        }}>
          <img
            src="/emblem-of-india.svg"
            alt="GoI emblem"
            style={{ width: '44px', height: '44px', opacity: .75, display: 'block', margin: '0 auto 6px' }}
            onError={e => {
              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg'
            }}
          />
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>
            Ministry of Statistics &amp;
          </div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>
            Programme Implementation
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>Govt. of India</div>
          <div style={{
            fontSize: '10px', color: '#f97316', fontWeight: 700, fontStyle: 'italic',
            marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px',
          }}>
            सत्यमेव जयते
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════
          MAIN COLUMN  — header + scrollable content
          ══════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header — also renders once */}
        <header style={{
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          gap: '16px', flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: searchFocused ? '420px' : '320px', transition: 'width .25s ease', maxWidth: '420px' }}>
            <Search size={14} style={{
              position: 'absolute', left: '11px', top: '50%',
              transform: 'translateY(-50%)',
              color: searchFocused ? '#f97316' : '#94a3b8',
              transition: 'color .2s',
            }} />
            <input
              type="text"
              placeholder="Search projects, ministries, states…"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%', padding: '7px 12px 7px 32px',
                border: `1.5px solid ${searchFocused ? '#f97316' : '#e2e8f0'}`,
                borderRadius: '7px', fontSize: '12.5px', outline: 'none',
                background: searchFocused ? 'white' : '#f8fafc', color: '#1e293b',
                transition: 'border .2s, background .2s',
              }}
            />
          </div>

          {/* Live clock */}
          <div style={{
            fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace',
            marginLeft: 'auto', letterSpacing: '0.02em',
            background: '#f8fafc', padding: '5px 10px',
            borderRadius: '6px', border: '1px solid #e2e8f0',
          }}>
            {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}{' '}
            <strong style={{ color: '#1e293b' }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </strong>
          </div>

          {/* Bell */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/users')}
            aria-label="Open notifications"
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <Bell size={18} color="#64748b" />
            {notificationCount > 0 && <span style={{
              position: 'absolute', top: '1px', right: '0px', minWidth: '14px', height: '14px',
              padding: '0 3px', background: '#ef4444', color: 'white', borderRadius: '8px',
              border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', fontWeight: 800,
            }}>{notificationCount > 99 ? '99+' : notificationCount}</span>}
          </motion.button>

          {/* User badge */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 4px 14px rgba(249,115,22,.28)' }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px',
              background: 'linear-gradient(135deg,#f97316,#fb923c)',
              borderRadius: '7px', color: 'white', cursor: 'default',
            }}
          >
            <div style={{
              width: '28px', height: '28px', background: 'white', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, color: '#f97316', fontSize: '11px',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>
                {user.email.split('@')[0]}
              </div>
              <div style={{ fontSize: '9.5px', opacity: .9, lineHeight: 1.2 }}>{roleLabel}</div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.04, background: '#fee2e2' }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: '7px',
              cursor: 'pointer', color: '#dc2626',
              fontSize: '12px', fontWeight: 600, flexShrink: 0,
            }}
          >
            <LogOut size={13} /> Sign out
          </motion.button>
        </header>

        {/* RBAC banners */}
        {user.role === 'ministry_officer' && user.ministry_name && (
          <div style={{
            padding: '8px 20px', background: '#fffbeb',
            borderBottom: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '12.5px', flexShrink: 0,
          }}>
            <span>🔒</span>
            <span style={{ color: '#92400e' }}>
              <strong>Ministry Officer Scope:</strong> Viewing projects filtered to{' '}
              <strong style={{ color: '#c2410c' }}>{user.ministry_name}</strong> — enforced server-side.
            </span>
          </div>
        )}
        {user.role === 'auditor' && (
          <div style={{
            padding: '8px 20px', background: '#f0fdfa',
            borderBottom: '1px solid #99f6e4',
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '12.5px', flexShrink: 0,
          }}>
            <span>📋</span>
            <span style={{ color: '#134e4a' }}>
              <strong>CAG Auditor Mode:</strong> Read-only access across all ministries.
            </span>
          </div>
        )}

        {/* ── PAGE CONTENT — only this area swaps on navigation ── */}
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
