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
