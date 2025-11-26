import { mockFetch } from './mock'

const isMock = String(import.meta.env.VITE_MOCK_API).toLowerCase() === 'true'

export async function apiFetch(path: string, init?: RequestInit) {
  if (isMock) return mockFetch(path, init)
  return fetch(path, init)
}