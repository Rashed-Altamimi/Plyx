import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { isOptedOut } from './useAnalyticsOptOut'

declare global {
  interface Window {
    goatcounter?: {
      no_onload?: boolean
      count?: (vars: { path?: string; title?: string; event?: boolean }) => void
    }
  }
}

const MAX_RETRIES = 10
const RETRY_DELAY_MS = 500

/**
 * Tracks SPA route changes via GoatCounter.
 *
 * - Skips tracking if the user has opted out (localStorage 'skipgc' = 't').
 * - Skips tracking in development (no GoatCounter script in dev mode).
 * - GoatCounter respects Do Not Track natively, so we don't need to check it here.
 * - Retries up to N times if the gc script hasn't finished loading yet.
 */
export function useAnalytics() {
  const location = useLocation()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isOptedOut()) return

    const path = location.pathname + location.search
    if (lastTracked.current === path) return
    lastTracked.current = path

    let retries = 0
    const tryCount = () => {
      const gc = window.goatcounter
      if (gc?.count) {
        try {
          gc.count({ path, title: document.title, event: false })
        } catch { /* swallow — analytics must never crash the app */ }
        return
      }
      if (retries++ < MAX_RETRIES) {
        setTimeout(tryCount, RETRY_DELAY_MS)
      }
      // Otherwise the script never loaded (blocked by adblocker, DNS, etc.) — silently give up.
    }
    tryCount()
  }, [location.pathname, location.search])
}
