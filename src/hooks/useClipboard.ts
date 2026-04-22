import { useState, useCallback, useRef, useEffect } from 'react'

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const flash = useCallback(() => {
    if (!mountedRef.current) return
    setCopied(true)
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if (mountedRef.current) setCopied(false)
      timerRef.current = null
    }, timeout)
  }, [timeout])

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      flash()
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      try { document.execCommand('copy') } finally { document.body.removeChild(el) }
      flash()
    }
  }, [flash])

  return { copied, copy }
}
