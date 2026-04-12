interface CacheEntry<T> {
  value: T
  fetchedAt: number
}

export function getCached<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.fetchedAt > ttlMs) return null
    return entry.value
  } catch {
    return null
  }
}

export function getCachedStale<T>(key: string): { value: T; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

export function setCached<T>(key: string, value: T): void {
  try {
    const entry: CacheEntry<T> = { value, fetchedAt: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // localStorage might be full or unavailable
  }
}
