const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'
let csrf = ''

async function getCsrf() {
  try {
    const r = await fetch(`${BASE}/csrf-token`, { credentials: 'include' })
    if (r.ok) {
      const j = await r.json()
      csrf = j?.token || ''
    }
  } catch {}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token') || ''
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(init.headers as any),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (init.method && init.method !== 'GET') headers['X-CSRF-Token'] = csrf

  let res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
  if (res.status === 403) {
    await getCsrf()
    headers['X-CSRF-Token'] = csrf
    res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

export const API = {
  health: () => request('/health'),
  monitoring: () => request('/monitoring'),
  systemStats: () => request('/system-stats'),
  models: () => request('/models'),
  datasets: () => request('/datasets'),
  startTraining: (id: number, body: any) => request(`/models/${id}/start`, { method: 'POST', body: JSON.stringify(body) }),
  pauseTraining: (id: number) => request(`/models/${id}/pause`, { method: 'POST' }),
  stopTraining: (id: number) => request(`/models/${id}/stop`, { method: 'POST' }),
}

export async function bootstrapClient() {
  await getCsrf()
}