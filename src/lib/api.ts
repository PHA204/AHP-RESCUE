const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export async function fetchCases(activePresetId?: string): Promise<any[]> {
  const q = activePresetId ? `?activePresetId=${encodeURIComponent(activePresetId)}` : ''
  return apiFetch(`/cases${q}`)
}

export async function fetchDashboard(activePresetId?: string): Promise<any> {
  const q = activePresetId ? `?activePresetId=${encodeURIComponent(activePresetId)}` : ''
  return apiFetch(`/dashboard${q}`)
}

export async function fetchPosts(): Promise<any[]> {
  return apiFetch('/posts')
}

export async function fetchPresets(): Promise<any[]> {
  return apiFetch('/presets')
}

export async function fetchDispatchTeams(): Promise<any[]> {
  return apiFetch('/dispatch-teams')
}

export async function fetchPipelineStatus(): Promise<any> {
  return apiFetch('/pipeline/status/latest').catch(() => ({
    scraper: 'healthy',
    aiInference: 'healthy',
    geocoding: 'offline',
    realtime: 'degraded',
  }))
}

export async function updateCaseStatus(caseId: string, rescueStatus: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rescueStatus }),
  })
  if (!res.ok) throw new Error(`PATCH error ${res.status}`)
  return res.json()
}