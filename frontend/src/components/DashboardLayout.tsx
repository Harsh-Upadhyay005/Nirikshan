import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderGit2, MapPin, AlertTriangle,
  DollarSign, Clock, BarChart3, FileText, Database,
  Users, Settings, Activity, Bell, Search, LogOut, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard, path: '/dashboard' },
  { id: 'portfolio',  label: 'Project Portfolio',  icon: FolderGit2,      path: '/portfolio' },
  { id: 'explorer',   label: 'Project Explorer',   icon: MapPin,          path: '/explorer'  },
  { id: 'risk',       label: 'Risk & Warnings',    icon: AlertTriangle,   path: '/risk'      },
  { id: 'cost',       label: 'Cost Overrun',       icon: DollarSign,      path: '/cost'      },
  { id: 'time',       label: 'Time Overrun',       icon: Clock,           path: '/time'      },
  { id: 'analytics',  label: 'Analytics',          icon: BarChart3,       path: '/analytics' },
  { id: 'reports',    label: 'Reports',            icon: FileText,        path: '/reports'   },
  { id: 'data',       label: 'Data Management',    icon: Database,        path: '/data'      },
  { id: 'users',      label: 'User Management',    icon: Users,           path: '/users'     },
  { id: 'settings',   label: 'Settings',           icon: Settings,        path: '/settings'  },
]

interface Props {
  children: React.ReactNode
  searchValue?: string
  onSearchChange?: (v: string) => void
}

export function DashboardLayout({ children, searchValue = '', onSearchChange }: Props) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [time, setTime]               = useState(new Date())
  const [notifOpen, setNotifOpen]     = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)

  // Live clock — ticks every second
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const activeId  = NAV_ITEMS.find(n => location.pathname === n.path)?.id ?? 'dashboard'
  const stored    = localStorage.getItem('nirikshan_user')
  const user      = stored ? JSON.parse(stored) : { email: 'admin@mospi.gov.in', role: 'admin' }
  const initials  = user.email.slice(0, 2).toUpperCase()
  const roleLabel = user.role === 'admin' ? 'MoSPI Admin' : user.role === 'ministry_officer' ? 'Ministry Officer' : 'Auditor'

  function handleLogout() {
    localStorage.removeItem('nirikshan_token')
    localStorage.removeItem('nirikshan_user')
    navigate('/login')
  }

  // sidebar variants
  const sidebarVariants = {
    initial: { x: -40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  }

  // stagger each nav item
  const navContainerVariants = {
    animate: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } },
  }
  const navItemVariants = {
    initial: { x: -16, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  }

  // page content fade-slide
  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <motion.aside
        variants={sidebarVariants}
        initial="initial"
        animate="animate"
        style={{ width: '196px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative', zIndex: 10 }}
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.3 } }}
          style={{ padding: '14px 14px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Activity size={17} color="white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Nirikshan</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>Infrastructure Monitor</div>
          </div>
        </motion.div>

        {/* Nav */}
        <motion.nav
          variants={navContainerVariants}
          initial="initial"
          animate="animate"
          style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}
        >
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeId === item.id
            return (
              <motion.button
                key={item.id}
                variants={navItemVariants}
                onClick={() => navigate(item.path)}
                whileHover={!active ? { x: 3, backgroundColor: '#fff7ed' } : {}}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', marginBottom: '1px',
                  background: active ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'transparent',
                  color: active ? 'white' : '#64748b',
                  border: 'none', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12.5px', fontWeight: 600, textAlign: 'left',
                  boxShadow: active ? '0 2px 10px rgba(249,115,22,.30)' : 'none',
                  transition: 'background .15s, color .15s, box-shadow .15s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* animated active indicator */}
                {active && (
                  <motion.span
                    layoutId="activeNav"
                    style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '7px', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={15} style={{ flexShrink: 0, color: active ? 'white' : '#64748b', transition: 'color .15s' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={12} style={{ opacity: .7, flexShrink: 0 }} />}
              </motion.button>
            )
          })}
        </motion.nav>

        {/* Footer emblem */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.3 } }}
          style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fafafa', textAlign: 'center' }}
        >
          <motion.img
            src="/emblem-of-india.svg"
            alt="GoI emblem"
            whileHover={{ scale: 1.08, opacity: 1 }}
            style={{ width: '44px', height: '44px', opacity: .75, marginBottom: '6px', display: 'block', margin: '0 auto 6px' }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg'
            }}
          />
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Ministry of Statistics &amp;</div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Programme Implementation</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>Govt. of India</div>
          <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, fontStyle: 'italic', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>सत्यमेव जयते</div>
        </motion.div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
          style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}
        >
          {/* Search */}
          <motion.div
            animate={{ width: searchFocused ? '440px' : '340px' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ position: 'relative', maxWidth: '440px', overflow: 'hidden' }}
          >
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: searchFocused ? '#f97316' : '#94a3b8', transition: 'color .2s' }} />
            <input
              type="text"
              placeholder="Search projects, ministries, states…"
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '7px 12px 7px 32px',
                border: `1.5px solid ${searchFocused ? '#f97316' : '#e2e8f0'}`,
                borderRadius: '7px', fontSize: '12.5px', outline: 'none',
                background: searchFocused ? 'white' : '#f8fafc', color: '#1e293b',
                transition: 'border .2s, background .2s',
              }}
            />
          </motion.div>

          {/* Live clock */}
          <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace', marginLeft: 'auto', letterSpacing: '0.02em', background: '#f8fafc', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}{' '}
            <strong style={{ color: '#1e293b' }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </strong>
          </div>

          {/* Bell */}
          <motion.button
            ref={bellRef}
            onClick={() => setNotifOpen(v => !v)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <motion.div
              animate={notifOpen ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Bell size={18} color={notifOpen ? '#f97316' : '#64748b'} />
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.8 }}
              style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', border: '1.5px solid white', display: 'block' }}
            />
          </motion.button>

          {/* User badge */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(249,115,22,.3)' }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '7px', color: 'white', cursor: 'default' }}
          >
            <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '11px' }}>{initials}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>{user.email.split('@')[0]}</div>
              <div style={{ fontSize: '9.5px', opacity: .9, lineHeight: 1.2 }}>{roleLabel}</div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.04, background: '#fee2e2' }}
            whileTap={{ scale: 0.95 }}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}
          >
            <LogOut size={13} /> Sign out
          </motion.button>
        </motion.header>

        {/* RBAC banners */}
        <AnimatePresence>
          {user.role === 'ministry_officer' && user.ministry_name && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ padding: '8px 20px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0, overflow: 'hidden' }}
            >
              <span style={{ fontSize: '14px' }}>🔒</span>
              <span style={{ color: '#92400e' }}>
                <strong>Ministry Officer Scope:</strong> Viewing projects filtered to{' '}
                <strong style={{ color: '#c2410c' }}>{user.ministry_name}</strong> — enforced server-side by the API.
              </span>
            </motion.div>
          )}
          {user.role === 'auditor' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ padding: '8px 20px', background: '#f0fdfa', borderBottom: '1px solid #99f6e4', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0, overflow: 'hidden' }}
            >
              <span style={{ fontSize: '14px' }}>📋</span>
              <span style={{ color: '#134e4a' }}>
                <strong>CAG Auditor Mode:</strong> Read-only. You can view all data but cannot modify records.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated page content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
