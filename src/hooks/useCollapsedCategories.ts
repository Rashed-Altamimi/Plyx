import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'plex-collapsed-categories'

function load(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

let shared: Record<string, boolean> = load()
const subscribers = new Set<(v: Record<string, boolean>) => void>()

function broadcast(next: Record<string, boolean>) {
  shared = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
  subscribers.forEach((s) => s(next))
}

export function useCollapsedCategories() {
  const [state, setState] = useState<Record<string, boolean>>(shared)

  useEffect(() => {
    const handler = (v: Record<string, boolean>) => setState(v)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const toggle = useCallback((key: string) => {
    broadcast({ ...shared, [key]: !shared[key] })
  }, [])

  const isCollapsed = useCallback((key: string) => !!state[key], [state])

  return { state, toggle, isCollapsed }
}
