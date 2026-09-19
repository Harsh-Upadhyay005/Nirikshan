import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  AlertTriangle,
  FileText,
  BarChart3,
  Database,
  Users,
  Settings,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  MapPin,
  Building2,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react'

// Mock data for the dashboard
const mockStats = {
  totalProjects: 1981,
  totalProjectsGrowth: 12,
  originalCost: 3113,
  revisedCost: 4278,
  revisedCostGrowth: 15,
  cumulativeExpenditure: 2036,
  expenditurePercent: 48,
  highRiskProjects: 146,
  highRiskGrowth: 8,
  projectsDelayed: 428,
  delayedGrowth: 12
}

const mockSectorData = [
  { name: 'Transport & Logistics', count: 376, color: '#4D3AAD' },
  { name: 'Energy', count: 298, color: '#BE5CA9' },
  { name: 'Water & Sanitation', count: 214, color: '#059669' },
  { name: 'Communication', count: 186, color: '#f59e0b' },
  { name: 'Social Infrastructure', count: 172, color: '#ef4444' },
  { name: 'Coal, Steel & Mining', count: 164, color: '#8b5cf6' },
  { name: 'Urban Development', count: 143, color: '#ec4899' },
  { name: 'Others', count: 392, color: '#94a3b8' }
]

const riskDistribution = [
  { name: 'Low Risk', count: 1102, percent: 56, color: '#059669' },
  { name: 'Medium Risk', count: 587, percent: 30, color: '#f59e0b' },
  { name: 'High Risk', count: 233, percent: 12, color: '#ef4444' },
  { name: 'Critical Risk', count: 59, percent: 3, color: '#dc2626' }
]

const mockAlerts = [
  { type: 'danger', project: 'Delhi-Meerut RRTS', alert: 'High risk of time overrun', time: '2 hours ago' },
  { type: 'warning', project: 'Kudankulam Nuclear Plant', alert: 'Cost escalation predicted', time: '4 hours ago' },
  { type: 'warning', project: 'Amaravati Capital Project', alert: 'Milestone delay detected', time: '6 hours ago' },
  { type: 'info', project: 'Purvanchal Hydroelectric Project', alert: 'Low expenditure against plan', time: '9 hours ago' },
  { type: 'warning', project: 'Mumbai Coastal Road', alert: 'Revised cost increase flagged', time: '12 hours ago' }
]

const mockTopRiskProjects = [
  { name: 'Delhi-Meerut RRTS', ministry: 'MoRTH', riskScore: 92 },
  { name: 'Kudankulam Nuclear Plant', ministry: 'Ministry of Power', riskScore: 88 },
  { name: 'Mumbai Coastal Road', ministry: 'MoRTH', riskScore: 85 },
  { name: 'Parlali Hydroelectric', ministry: 'Ministry of Power', riskScore: 83 },
  { name: 'Brahmaputra Bridge', ministry: 'Ministry of Railways', riskScore: 81 }
]

const stateMarkers = [
  { name: 'Delhi', coordinates: [77.2090, 28.6139], projects: 48, color: '#f59e0b' },
  { name: 'Maharashtra', coordinates: [75.7139, 19.7515], projects: 231, color: '#dc2626' },
  { name: 'Karnataka', coordinates: [76.6413, 15.3173], projects: 108, color: '#ea580c' },
  { name: 'Tamil Nadu', coordinates: [78.6569, 11.1271], projects: 138, color: '#ea580c' },
  { name: 'Uttar Pradesh', coordinates: [80.9462, 26.8467], projects: 221, color: '#dc2626' },
  { name: 'Gujarat', coordinates: [71.1924, 22.2587], projects: 124, color: '#ea580c' },
  { name: 'Rajasthan', coordinates: [74.2179, 27.0238], projects: 86, color: '#f59e0b' },
  { name: 'Madhya Pradesh', coordinates: [78.6569, 22.9734], projects: 124, color: '#ea580c' },
  { name: 'West Bengal', coordinates: [87.8550, 22.9868], projects: 97, color: '#f59e0b' },
  { name: 'Bihar', coordinates: [85.3131, 25.0961], projects: 68, color: '#f59e0b' },
  { name: 'Andhra Pradesh', coordinates: [79.7399, 15.9129], projects: 124, color: '#ea580c' }
]

export function NewDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mapFilter, setMapFilter] = useState('state')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data on mount
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  })

  useState(() => {
    async function loadData() {
      try {
        setLoading(true)
        const token = localStorage.getItem('nirikshan_token') || undefined
        
        // Import the fetch function
        const { fetchDashboardData } = await import('../api')
        const data = await fetchDashboardData(token)
        
        setDashboardData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data. Using demo data.')
        
        // Fallback to mock data
        setDashboardData({
          stats: mockStats,
          projectDistribution: stateMarkers,
          riskDistribution,
          sectorData: mockSectorData,
          alerts: mockAlerts,
          topRiskProjects: mockTopRiskProjects
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  })

  // Use either real data or mock data
  const stats = dashboardData?.stats || mockStats
  const riskDist = dashboardData?.riskDistribution || riskDistribution
  const sectors = dashboardData?.sectorData || mockSectorData
  const alerts = dashboardData?.alerts || mockAlerts
  const topRisk = dashboardData?.topRiskProjects || mockTopRiskProjects
  const stateData = dashboardData?.projectDistribution || stateMarkers

  const totalRiskProjects = riskDist.reduce((acc: number, curr: any) => acc + curr.count, 0)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8f9fa',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} color="#4D3AAD" style={{ animation: 'spin 2s linear infinite' }} />
          <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 600, color: '#64748b' }}>
            Loading Dashboard Data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#f8f9fa',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Sidebar - Light Theme, Compact */}
      <aside style={{
        width: '200px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={20} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>
                Nirikshan
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, marginTop: '1px' }}>
                Infrastructure Monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'portfolio', label: 'Project Portfolio', icon: FolderGit2 },
            { id: 'explorer', label: 'Project Explorer', icon: MapPin },
            { id: 'risk', label: 'Risk & Early Warning', icon: AlertTriangle },
            { id: 'cost', label: 'Cost Overrun', icon: DollarSign },
            { id: 'time', label: 'Time Overrun', icon: Clock },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  marginBottom: '2px',
                  background: isActive ? 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' : 'transparent',
                  color: isActive ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  boxShadow: isActive ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#fff7ed'
                    e.currentTarget.style.color = '#f97316'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }
                }}
              >
                <Icon size={16} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Footer with Government Emblem */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/emblem-of-india.svg"
              alt="Government of India Emblem"
              style={{ width: '60px', height: '60px', opacity: 0.85 }}
              onError={(e) => {
                // Fallback to CDN if local file fails
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg'
              }}
            />
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', lineHeight: 1.3 }}>
            Ministry of Statistics and
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', lineHeight: 1.3 }}>
            Programme Implementation
          </div>
          <div style={{ marginTop: '6px', fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
            Government of India
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '8px', 
            fontStyle: 'italic', 
            color: '#f97316',
            fontWeight: 700,
            borderTop: '1px solid #e2e8f0',
            paddingTop: '8px'
          }}>
            सत्यमेव जयते
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={18} style={{ 
                position: 'absolute',
                left: '14px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Search projects, ministries, states, sectors..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })} {currentTime.toLocaleTimeString('en-IN', { 
                hour: '2-digit',
                minute: '2-digit',
                hour12: true 
              })}
            </div>

            <button style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}>
              <Bell size={20} color="#64748b" />
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#f97316',
                fontSize: '14px'
              }}>
                AS
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Admin</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>MoSPI</div>
              </div>
            </div>

            <div style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 700
            }}>
              From Data to Developments
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          background: '#f8f9fa'
        }}>
          {/* Welcome Section */}
          <div style={{ marginBottom: '24px' }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: '#f59e0b',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {!error && dashboardData && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                color: '#10b981',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Activity size={16} />
                <span>Connected to live database - Showing real project data from ML model training dataset</span>
              </div>
            )}
            
            <h1 style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              Welcome, Administrator
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#64748b'
            }}>
              National Infrastructure. Real-time Insights. Proactive Governance.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Total Projects */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Total Projects
                </div>
                <div style={{
                  padding: '6px',
                  background: '#fef3c7',
                  borderRadius: '6px'
                }}>
                  <Building2 size={16} color="#f59e0b" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                {stats.totalProjects.toLocaleString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <TrendingUp size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.totalProjectsGrowth}%
                </span>
                <span style={{ color: '#94a3b8' }}>Across 17 Ministries</span>
              </div>
            </div>

            {/* Original Cost */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Original Cost
                </div>
                <div style={{
                  padding: '6px',
                  background: '#f0fdf4',
                  borderRadius: '6px'
                }}>
                  <DollarSign size={16} color="#10b981" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                ₹ {stats.originalCost.toFixed(1)} Lakh Cr
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Sanctioned value
              </div>
            </div>

            {/* Revised Cost */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Revised Cost
                </div>
                <div style={{
                  padding: '6px',
                  background: '#fef3c7',
                  borderRadius: '6px'
                }}>
                  <Zap size={16} color="#f59e0b" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                ₹ {stats.revisedCost.toFixed(1)} Lakh Cr
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <TrendingUp size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.revisedCostGrowth}%
                </span>
                <span style={{ color: '#94a3b8' }}>escalation</span>
              </div>
            </div>

            {/* Cumulative Expenditure */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Cumulative Expenditure
                </div>
                <div style={{
                  padding: '6px',
                  background: '#fae8ff',
                  borderRadius: '6px'
                }}>
                  <BarChart3 size={16} color="#a855f7" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                ₹ {stats.cumulativeExpenditure.toFixed(1)} Lakh Cr
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {stats.expenditurePercent}% of revised cost
              </div>
            </div>

            {/* High Risk Projects */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  High Risk Projects
                </div>
                <div style={{
                  padding: '6px',
                  background: '#fee2e2',
                  borderRadius: '6px'
                }}>
                  <AlertTriangle size={16} color="#ef4444" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
                {stats.highRiskProjects}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <TrendingUp size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.highRiskGrowth}%
                </span>
                <span style={{ color: '#94a3b8' }}>increase</span>
              </div>
            </div>

            {/* Projects Delayed */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Projects Delayed
                </div>
                <div style={{
                  padding: '6px',
                  background: '#ffedd5',
                  borderRadius: '6px'
                }}>
                  <Clock size={16} color="#f97316" />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>
                {stats.projectsDelayed}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <TrendingUp size={14} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 700 }}>
                  {stats.delayedGrowth}%
                </span>
                <span style={{ color: '#94a3b8' }}>increase</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid - 3 Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Left Column - India Map */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Project Distribution Across India
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['state', 'ministry', 'sector'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setMapFilter(filter)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: mapFilter === filter ? '#4D3AAD' : '#f1f5f9',
                        color: mapFilter === filter ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      By {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative', height: '400px', background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                {/* Simple India Map Placeholder with Markers */}
                <svg viewBox="0 0 400 500" style={{ width: '100%', height: '100%' }}>
                  {/* India outline (simplified) */}
                  <path
                    d="M200,50 L220,70 L240,90 L250,120 L260,150 L270,180 L280,210 L285,240 L285,270 L280,300 L270,330 L260,360 L250,390 L240,410 L220,430 L200,440 L180,430 L160,410 L150,390 L140,360 L130,330 L120,300 L115,270 L115,240 L120,210 L130,180 L140,150 L150,120 L160,90 L180,70 Z"
                    fill="#e0e7ff"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  
                  {/* State markers */}
                  {stateMarkers.map((marker, idx) => {
                    // Simplified positioning
                    const positions = [
                      { x: 200, y: 140 }, // Delhi
                      { x: 120, y: 240 }, // Maharashtra
                      { x: 160, y: 350 }, // Karnataka
                      { x: 200, y: 400 }, // Tamil Nadu
                      { x: 220, y: 180 }, // Uttar Pradesh
                      { x: 100, y: 200 }, // Gujarat
                      { x: 140, y: 140 }, // Rajasthan
                      { x: 190, y: 220 }, // Madhya Pradesh
                      { x: 280, y: 210 }, // West Bengal
                      { x: 260, y: 180 }, // Bihar
                      { x: 230, y: 300 }  // Andhra Pradesh
                    ]
                    const pos = positions[idx] || { x: 200, y: 250 }
                    const size = Math.sqrt(marker.projects) * 2.5
                    
                    return (
                      <g key={idx}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={size}
                          fill={marker.color}
                          opacity={0.7}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          style={{ 
                            fontSize: '11px',
                            fontWeight: 900,
                            fill: 'white',
                            pointerEvents: 'none'
                          }}
                        >
                          {marker.projects}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  Project Count Legend
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '50%' }} />
                    <span style={{ color: '#64748b' }}>{'< 50'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} />
                    <span style={{ color: '#64748b' }}>51 - 100</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ea580c', borderRadius: '50%' }} />
                    <span style={{ color: '#64748b' }}>101 - 200</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '50%' }} />
                    <span style={{ color: '#64748b' }}>{'>200'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Risk Distribution */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginBottom: '24px' }}>
                Risk Distribution
              </h3>

              {/* Donut Chart */}
              <div style={{ 
                position: 'relative',
                width: '280px',
                height: '280px',
                margin: '0 auto 32px'
              }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  {(() => {
                    let cumulativePercent = 0
                    return riskDistribution.map((risk, idx) => {
                      const startPercent = cumulativePercent
                      cumulativePercent += risk.percent
                      const start = startPercent * 2.83
                      const length = risk.percent * 2.83
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={risk.color}
                          strokeWidth="10"
                          strokeDasharray={`${length} ${283 - length}`}
                          strokeDashoffset={-start}
                          opacity={0.9}
                        />
                      )
                    })
                  })()}
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b' }}>
                    {totalRiskProjects.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    Projects
                  </div>
                </div>
              </div>

              {/* Risk Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {riskDist.map((risk: any, idx: number) => (
                  <div key={idx} style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: risk.color,
                        borderRadius: '3px'
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {risk.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                        {risk.count.toLocaleString()} ({risk.percent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Projects by Sector */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Projects by Sector
                </h3>
                <select style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  <option>No. of Projects</option>
                  <option>By Investment</option>
                  <option>By Risk</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sectors.map((sector: any, idx: number) => {
                  const maxCount = Math.max(...sectors.map((s: any) => s.count))
                  const widthPercent = (sector.count / maxCount) * 100
                  
                  return (
                    <div key={idx}>
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            background: sector.color,
                            borderRadius: '50%'
                          }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {sector.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>
                          {sector.count}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          background: sector.color,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section - 2 Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Cost & Time Overrun Trends */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Cost & Time Overrun Trends
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  <span style={{ color: '#ef4444' }}>Last 5 Years</span>
                </div>
              </div>

              {/* Simple Line Chart Representation */}
              <div style={{ height: '200px', position: 'relative' }}>
                <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  {[0, 10, 20, 30, 40].map((val, idx) => (
                    <g key={idx}>
                      <line
                        x1="0"
                        y1={200 - (val / 40) * 200}
                        x2="100%"
                        y2={200 - (val / 40) * 200}
                        stroke="#e2e8f0"
                        strokeWidth="1"
                      />
                      <text
                        x="-10"
                        y={200 - (val / 40) * 200 + 4}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  ))}

                  {/* Cost Overrun Line (Red) */}
                  <polyline
                    points="50,180 150,160 250,150 350,140 450,130 550,115"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />

                  {/* Time Overrun Line (Blue) */}
                  <polyline
                    points="50,190 150,185 250,175 350,165 450,150 550,145"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />

                  {/* Data points */}
                  {[[50,180], [150,160], [250,150], [350,140], [450,130], [550,115]].map((point, idx) => (
                    <circle key={`cost-${idx}`} cx={point[0]} cy={point[1]} r="4" fill="#ef4444" />
                  ))}
                  {[[50,190], [150,185], [250,175], [350,165], [450,150], [550,145]].map((point, idx) => (
                    <circle key={`time-${idx}`} cx={point[0]} cy={point[1]} r="4" fill="#3b82f6" />
                  ))}
                </svg>

                {/* X-axis labels */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: 600
                }}>
                  {['2021', '2022', '2023', '2024', '2025', '2026'].map(year => (
                    <span key={year}>{year}</span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                gap: '24px',
                marginTop: '20px',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '3px', background: '#ef4444', borderRadius: '2px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                    Cost Overrun (%) <span style={{ color: '#ef4444' }}>32%</span>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '3px', background: '#3b82f6', borderRadius: '2px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                    Time Overrun (%) <span style={{ color: '#3b82f6' }}>18%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top 5 High Risk Projects */}
            <div style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                  Top 5 High Risk Projects
                </h3>
                <Link 
                  to="/risk"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#4D3AAD',
                    textDecoration: 'none'
                  }}
                >
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topRisk.map((project: any, idx: number) => (
                  <div key={idx} style={{
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    borderLeft: '4px solid ' + (
                      project.riskScore >= 90 ? '#dc2626' :
                      project.riskScore >= 85 ? '#ea580c' :
                      '#f59e0b'
                    )
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '6px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                          {project.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {project.ministry}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        background: project.riskScore >= 90 ? '#dc2626' :
                                   project.riskScore >= 85 ? '#ea580c' : '#f59e0b',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 900,
                        minWidth: '45px',
                        textAlign: 'center'
                      }}>
                        {project.riskScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Alerts Section */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                Recent Alerts
              </h3>
              <Link 
                to="/alerts"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#f97316',
                  textDecoration: 'none'
                }}
              >
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 2fr 3fr 120px',
                padding: '12px 20px',
                background: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Type</div>
                <div>Project Name</div>
                <div>Alert</div>
                <div>Time</div>
              </div>

              {/* Table Rows */}
              {alerts.map((alert: any, idx: number) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 2fr 3fr 120px',
                  padding: '16px 20px',
                  background: 'white',
                  fontSize: '13px',
                  alignItems: 'center'
                }}>
                  <div>
                    <AlertTriangle 
                      size={20} 
                      color={
                        alert.type === 'danger' ? '#ef4444' :
                        alert.type === 'warning' ? '#f59e0b' :
                        '#3b82f6'
                      }
                    />
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {alert.project}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    {alert.alert}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {alert.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#1e293b',
          color: 'white',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Nirikshan</span>
            <span style={{ color: '#94a3b8' }}>Predictive Insights</span>
            <span style={{ color: '#94a3b8' }}>Proactive Governance</span>
            <span style={{ color: '#94a3b8' }}>Efficient Infrastructure</span>
            <span style={{ color: '#94a3b8' }}>Developed India</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white'/%3E%3C/svg%3E"
              alt="Gov"
              style={{ width: '24px', height: '24px', opacity: 0.8 }}
            />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700 }}>
                Ministry of Statistics and Programme Implementation
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Government of India
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
