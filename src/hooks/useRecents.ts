import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'plex-recents'
const MAX_RECENTS = 5

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

let shared: string[] = load()
const subscribers = new Set<(v: string[]) => void>()

function broadcast(next: string[]) {
  shared = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
  subscribers.forEach((s) => s(next))
}

export function useRecents() {
  const [list, setList] = useState<string[]>(shared)

  useEffect(() => {
    const handler = (v: string[]) => setList(v)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const push = useCallback((path: string) => {
    if (path === '/') return
    const next = [path, ...shared.filter((p) => p !== path)].slice(0, MAX_RECENTS)
    broadcast(next)
  }, [])

  const clear = useCallback(() => broadcast([]), [])

  return { list, push, clear }
}
