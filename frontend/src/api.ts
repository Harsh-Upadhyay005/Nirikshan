import type { AuthResponse, HealthCheck, LookupItem, PlatformStats } from './types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

export async function fetchHealth(): Promise<HealthCheck> {
  return request<HealthCheck>('/health')
}

export async function fetchLookups(path: string): Promise<LookupItem[]> {
  return request<LookupItem[]>(path)
}

export async function loadPlatformStats(): Promise<PlatformStats> {
  try {
    const [health, ministries, categories, agencies, states] = await Promise.all([
      fetchHealth(),
      fetchLookups('/api/v1/ministries'),
      fetchLookups('/api/v1/categories'),
      fetchLookups('/api/v1/agencies'),
      fetchLookups('/api/v1/states'),
    ])

    return {
      health,
      ministries: ministries.length,
      categories: categories.length,
      agencies: agencies.length,
      states: states.length,
      live: true,
    }
  } catch {
    return {
      health: null,
      ministries: 50,
      categories: 12,
      agencies: 80,
      states: 36,
      live: false,
    }
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(payload: {
  email: string
  password: string
  role: string
  ministry_name?: string
}): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getGoogleAuthUrl(): Promise<{ authorization_url: string }> {
  return request<{ authorization_url: string }>('/auth/google/url')
}

export function storeSession(auth: AuthResponse) {
  localStorage.setItem('nirikshan_token', auth.token)
  localStorage.setItem('nirikshan_user', JSON.stringify(auth.user))
}


// Dashboard Statistics API
export interface DashboardStats {
  totalProjects: number
  totalProjectsGrowth: number
  originalCost: number
  revisedCost: number
  revisedCostGrowth: number
  cumulativeExpenditure: number
  expenditurePercent: number
  highRiskProjects: number
  highRiskGrowth: number
  projectsDelayed: number
  delayedGrowth: number
}

export interface ProjectDistribution {
  state: string
  projects: number
  totalCost: number
}

export interface RiskDistribution {
  name: string
  count: number
  percent: number
  color: string
}

export interface SectorData {
  name: string
  count: number
  color: string
}

export interface AlertItem {
  type: 'danger' | 'warning' | 'info'
  project: string
  alert: string
  time: string
}

export interface TopRiskProject {
  name: string
  ministry: string
  riskScore: number
}

export interface DashboardData {
  stats: DashboardStats
  projectDistribution: ProjectDistribution[]
  riskDistribution: RiskDistribution[]
  sectorData: SectorData[]
  alerts: AlertItem[]
  topRiskProjects: TopRiskProject[]
}

export async function fetchDashboardData(token?: string): Promise<DashboardData> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    // Fetch projects
    const projectsResponse = await fetch(`${API_BASE}/api/v1/projects?limit=1000`, {
      headers
    })
    const projects = projectsResponse.ok ? await projectsResponse.json() : []

    // Fetch alerts
    const alertsResponse = await fetch(`${API_BASE}/api/v1/alerts?limit=100`, {
      headers
    })
    const alertsData = alertsResponse.ok ? await alertsResponse.json() : []

    // Calculate statistics from real data
    const totalProjects = projects.length
    const totalOriginalCost = projects.reduce((sum: number, p: any) => 
      sum + (parseFloat(p.original_cost_cr) || 0), 0
    )
    
    // Get projects with snapshots to calculate revised costs
    const projectsWithSnapshots = projects.filter((p: any) => 
      p.snapshots && p.snapshots.length > 0
    )
    
    const totalRevisedCost = projectsWithSnapshots.reduce((sum: number, p: any) => {
      const latestSnapshot = p.snapshots[p.snapshots.length - 1]
      return sum + (parseFloat(latestSnapshot?.revised_cost_cr) || parseFloat(p.original_cost_cr) || 0)
    }, 0)

    const totalExpenditure = projectsWithSnapshots.reduce((sum: number, p: any) => {
      const latestSnapshot = p.snapshots[p.snapshots.length - 1]
      return sum + (parseFloat(latestSnapshot?.cumulative_expenditure_cr) || 0)
    }, 0)

    // Count high risk and delayed projects
    const highRiskProjects = alertsData.filter((a: any) => 
      a.risk_score > 0.75 || a.risk_segment === 'high' || a.risk_segment === 'critical'
    ).length

    const delayedProjects = projectsWithSnapshots.filter((p: any) => {
      const latestSnapshot = p.snapshots[p.snapshots.length - 1]
      return latestSnapshot?.is_delayed === true || (latestSnapshot?.schedule_slippage_months || 0) > 0
    }).length

    // Group projects by state
    const stateDistribution = projects.reduce((acc: Record<string, number>, p: any) => {
      if (p.states && p.states.length > 0) {
        p.states.forEach((state: any) => {
          const stateName = state.name || 'Unknown'
          acc[stateName] = (acc[stateName] || 0) + 1
        })
      }
      return acc
    }, {})

    const projectDistribution: ProjectDistribution[] = Object.entries(stateDistribution)
      .map(([state, count]) => ({
        state,
        projects: count as number,
        totalCost: 0
      }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 15)

    // Calculate risk distribution
    const riskCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }

    alertsData.forEach((alert: any) => {
      const score = alert.risk_score || 0
      if (score < 0.35) riskCounts.low++
      else if (score < 0.55) riskCounts.medium++
      else if (score < 0.75) riskCounts.high++
      else riskCounts.critical++
    })

    const totalRiskProjects = riskCounts.low + riskCounts.medium + riskCounts.high + riskCounts.critical
    
    const riskDistribution: RiskDistribution[] = [
      { 
        name: 'Low Risk', 
        count: riskCounts.low, 
        percent: totalRiskProjects > 0 ? Math.round((riskCounts.low / totalRiskProjects) * 100) : 0, 
        color: '#059669' 
      },
      { 
        name: 'Medium Risk', 
        count: riskCounts.medium, 
        percent: totalRiskProjects > 0 ? Math.round((riskCounts.medium / totalRiskProjects) * 100) : 0, 
        color: '#f59e0b' 
      },
      { 
        name: 'High Risk', 
        count: riskCounts.high, 
        percent: totalRiskProjects > 0 ? Math.round((riskCounts.high / totalRiskProjects) * 100) : 0, 
        color: '#ef4444' 
      },
      { 
        name: 'Critical Risk', 
        count: riskCounts.critical, 
        percent: totalRiskProjects > 0 ? Math.round((riskCounts.critical / totalRiskProjects) * 100) : 0, 
        color: '#dc2626' 
      }
    ]

    // Group by sector/category
    const categoryDistribution = projects.reduce((acc: Record<string, number>, p: any) => {
      const category = p.category?.name || 'Others'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    const sectorColors = ['#4D3AAD', '#BE5CA9', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#94a3b8']
    const sectorData: SectorData[] = Object.entries(categoryDistribution)
      .map(([name, count], idx) => ({
        name,
        count: count as number,
        color: sectorColors[idx % sectorColors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Format alerts
    const alerts: AlertItem[] = alertsData
      .sort((a: any, b: any) => 
        new Date(b.predicted_at).getTime() - new Date(a.predicted_at).getTime()
      )
      .slice(0, 5)
      .map((alert: any) => {
        const hoursAgo = Math.floor(
          (Date.now() - new Date(alert.predicted_at).getTime()) / (1000 * 60 * 60)
        )
        
        return {
          type: alert.risk_score > 0.8 ? 'danger' : alert.risk_score > 0.5 ? 'warning' : 'info',
          project: alert.project?.project_name || 'Unknown Project',
          alert: alert.risk_segment === 'critical' 
            ? 'Critical risk detected' 
            : alert.delay_probability > 0.7 
              ? 'High risk of time overrun' 
              : 'Cost escalation predicted',
          time: hoursAgo === 0 ? 'Just now' : `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
        }
      })

    // Top risk projects
    const topRiskProjects: TopRiskProject[] = alertsData
      .sort((a: any, b: any) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, 5)
      .map((alert: any) => ({
        name: alert.project?.project_name || 'Unknown',
        ministry: alert.project?.ministry?.name || 'N/A',
        riskScore: Math.round((alert.risk_score || 0) * 100)
      }))

    return {
      stats: {
        totalProjects,
        totalProjectsGrowth: 12, // TODO: Calculate from historical data
        originalCost: totalOriginalCost / 100000, // Convert to Lakh Cr
        revisedCost: totalRevisedCost / 100000,
        revisedCostGrowth: totalOriginalCost > 0 
          ? Math.round(((totalRevisedCost - totalOriginalCost) / totalOriginalCost) * 100) 
          : 0,
        cumulativeExpenditure: totalExpenditure / 100000,
        expenditurePercent: totalRevisedCost > 0 
          ? Math.round((totalExpenditure / totalRevisedCost) * 100) 
          : 0,
        highRiskProjects,
        highRiskGrowth: 8, // TODO: Calculate from historical data
        projectsDelayed: delayedProjects,
        delayedGrowth: 12 // TODO: Calculate from historical data
      },
      projectDistribution,
      riskDistribution,
      sectorData,
      alerts,
      topRiskProjects
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    // Return empty data structure on error
    return {
      stats: {
        totalProjects: 0,
        totalProjectsGrowth: 0,
        originalCost: 0,
        revisedCost: 0,
        revisedCostGrowth: 0,
        cumulativeExpenditure: 0,
        expenditurePercent: 0,
        highRiskProjects: 0,
        highRiskGrowth: 0,
        projectsDelayed: 0,
        delayedGrowth: 0
      },
      projectDistribution: [],
      riskDistribution: [],
      sectorData: [],
      alerts: [],
      topRiskProjects: []
    }
  }
}
