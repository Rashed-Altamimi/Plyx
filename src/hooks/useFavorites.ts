import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'plex-favorites'

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

// Shared state across all hook instances so a toggle in one place reflects everywhere
let shared: string[] = load()
const subscribers = new Set<(v: string[]) => void>()

function broadcast(next: string[]) {
  shared = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* storage full */ }
  subscribers.forEach((s) => s(next))
}

export function useFavorites() {
  const [list, setList] = useState<string[]>(shared)

  useEffect(() => {
    const handler = (v: string[]) => setList(v)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const toggle = useCallback((path: string) => {
    broadcast(shared.includes(path) ? shared.filter((p) => p !== path) : [...shared, path])
  }, [])

  const isFav = useCallback((path: string) => list.includes(path), [list])

  const clear = useCallback(() => broadcast([]), [])

  return { list, toggle, isFav, clear }
}
