import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderGit2, MapPin, AlertTriangle,
  DollarSign, Clock, BarChart3, FileText, Database,
  Users, Settings, Activity, Bell, Search, LogOut
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
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTime] = useState(new Date())

  const activeId = NAV_ITEMS.find(n => location.pathname === n.path)?.id ?? 'dashboard'
  const stored = localStorage.getItem('nirikshan_user')
  const user = stored ? JSON.parse(stored) : { email: 'admin@mospi.gov.in', role: 'admin' }
  const initials = user.email.slice(0, 2).toUpperCase()
  const roleLabel = user.role === 'admin' ? 'MoSPI Admin' : user.role === 'ministry_officer' ? 'Ministry Officer' : 'Auditor'

  function handleLogout() {
    localStorage.removeItem('nirikshan_token')
    localStorage.removeItem('nirikshan_user')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: '196px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity size={17} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Nirikshan</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3 }}>Infrastructure Monitor</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeId === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', marginBottom: '1px',
                  background: active ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'transparent',
                  color: active ? 'white' : '#64748b',
                  border: 'none', borderRadius: '7px', cursor: 'pointer',
                  fontSize: '12.5px', fontWeight: 600, textAlign: 'left',
                  boxShadow: active ? '0 2px 6px rgba(249,115,22,.28)' : 'none',
                  transition: 'background .15s, color .15s'
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.color = '#f97316' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer emblem */}
        <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', background: '#fafafa', textAlign: 'center' }}>
          <img
            src="/emblem-of-india.svg"
            alt="GoI emblem"
            style={{ width: '44px', height: '44px', opacity: .8, marginBottom: '6px' }}
            onError={e => { e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg' }}
          />
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Ministry of Statistics &amp;</div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', lineHeight: 1.35 }}>Programme Implementation</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>Govt. of India</div>
          <div style={{ fontSize: '10px', color: '#f97316', fontWeight: 700, fontStyle: 'italic', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>सत्यमेव जयते</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search projects, ministries, states…"
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
              style={{ width: '100%', padding: '7px 12px 7px 32px', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '12.5px', outline: 'none', background: '#f8fafc', color: '#1e293b' }}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}&nbsp;
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>

          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
            <Bell size={18} color="#64748b" />
            <span style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', border: '1.5px solid white' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', background: 'linear-gradient(135deg,#f97316,#fb923c)', borderRadius: '7px', color: 'white' }}>
            <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#f97316', fontSize: '11px' }}>{initials}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>{user.email.split('@')[0]}</div>
              <div style={{ fontSize: '9.5px', opacity: .9, lineHeight: 1.2 }}>{roleLabel}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            <LogOut size={13} /> Sign out
          </button>
        </header>

        {/* RBAC scope banner — shown for ministry officers */}
        {user.role === 'ministry_officer' && user.ministry_name && (
          <div style={{ padding: '8px 20px', background: '#fffbeb', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0 }}>
            <span style={{ fontSize: '14px' }}>🔒</span>
            <span style={{ color: '#92400e' }}>
              <strong>Ministry Officer Scope:</strong> You are viewing projects filtered to{' '}
              <strong style={{ color: '#c2410c' }}>{user.ministry_name}</strong> only.
              This is enforced server-side by the API.
            </span>
          </div>
        )}
        {user.role === 'auditor' && (
          <div style={{ padding: '8px 20px', background: '#f0fdfa', borderBottom: '1px solid #99f6e4', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', flexShrink: 0 }}>
            <span style={{ fontSize: '14px' }}>📋</span>
            <span style={{ color: '#134e4a' }}>
              <strong>CAG Auditor Mode:</strong> Read-only access. You can view all project data and risk assessments but cannot issue directives or modify records.
            </span>
          </div>
        )}

        {/* Scrollable body */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0 }}>
          {children}
        </main>

        
      </div>
    </div>
  )
}
