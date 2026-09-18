export type HealthCheck = {
  status: string
  database: string
  ml_models: string
}

export type LookupItem = {
  id: number
  name: string
}

export type UserRole = 'admin' | 'ministry_officer' | 'auditor'

export type AuthUser = {
  id: number
  email: string
  role: UserRole
  ministry_name: string | null
}

export type AuthResponse = {
  user: AuthUser
  token: string
}

export type PlatformStats = {
  health: HealthCheck | null
  ministries: number
  categories: number
  agencies: number
  states: number
  live: boolean
}
