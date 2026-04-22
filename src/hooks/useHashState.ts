import { useEffect, useRef, useState } from 'react'

/**
 * Sync a small piece of state to the URL hash so tool settings become shareable.
 *
 * The hash is written as `#key=value&key2=value2`, URL-encoded. State is lazily
 * read from the hash on mount and written back on change. Only string, number,
 * and boolean values are supported — anything else is coerced.
 */
type Primitive = string | number | boolean
type Shape = Record<string, Primitive>

function readHash<T extends Shape>(defaults: T): T {
  if (typeof window === 'undefined') return defaults
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return defaults
  const params = new URLSearchParams(hash)
  const out: Shape = { ...defaults }
  for (const [k, v] of params) {
    if (!(k in defaults)) continue
    const dflt = defaults[k]
    if (typeof dflt === 'number') {
      const n = Number(v)
      if (!Number.isNaN(n)) out[k] = n
    } else if (typeof dflt === 'boolean') {
      out[k] = v === '1' || v === 'true'
    } else {
      out[k] = v
    }
  }
  return out as T
}

function writeHash<T extends Shape>(state: T, defaults: T) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  for (const k in state) {
    const v = state[k]
    const d = defaults[k]
    if (v === d) continue
    if (typeof v === 'boolean') params.set(k, v ? '1' : '0')
    else params.set(k, String(v))
  }
  const hash = params.toString()
  const url = window.location.pathname + window.location.search + (hash ? `#${hash}` : '')
  window.history.replaceState(null, '', url)
}

export function useHashState<T extends Shape>(defaults: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readHash(defaults))
  const defaultsRef = useRef(defaults)

  useEffect(() => {
    writeHash(state, defaultsRef.current)
  }, [state])

  return [state, setState]
}
