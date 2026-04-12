import { useState, useEffect, useCallback } from 'react'

// GoatCounter natively respects this localStorage key — when set to 't',
// the count.js script skips counting entirely. We use the same key so the
// opt-out works whether or not our hook intercepts first.
const STORAGE_KEY = 'skipgc'
const SKIP_VALUE = 't'

function load(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === SKIP_VALUE
  } catch {
    return false
  }
}

let sharedOptedOut = load()
const subscribers = new Set<(v: boolean) => void>()

function broadcast(next: boolean) {
  sharedOptedOut = next
  try {
    if (next) {
      localStorage.setItem(STORAGE_KEY, SKIP_VALUE)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { /* storage unavailable */ }
  subscribers.forEach((s) => s(next))
}

export function useAnalyticsOptOut() {
  const [optedOut, setOptedOut] = useState<boolean>(sharedOptedOut)

  useEffect(() => {
    const handler = (v: boolean) => setOptedOut(v)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const setOptOut = useCallback((next: boolean) => broadcast(next), [])
  const toggle = useCallback(() => broadcast(!sharedOptedOut), [])

  return { optedOut, setOptOut, toggle }
}

// Synchronous read for use in non-React code (e.g. analytics hook).
export function isOptedOut(): boolean {
  return sharedOptedOut
}
