import { useState, useEffect, useCallback } from 'react'

let sharedOpen = false
const subscribers = new Set<(v: boolean) => void>()

function broadcast(next: boolean) {
  sharedOpen = next
  subscribers.forEach((s) => s(next))
}

// Attach the global ⌘K / Ctrl+K listener exactly once at module load time.
// Previously this lived inside the hook's useEffect, which meant every place
// that called useCommandPalette() (AppShell, Sidebar, MobileHeader, Home)
// attached its own listener — a single key press would fire toggle() N times
// and the even number of flips would cancel out, making the shortcut a no-op.
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      broadcast(!sharedOpen)
    }
  })
}

export function useCommandPalette() {
  const [open, setOpen] = useState(sharedOpen)

  useEffect(() => {
    const handler = (v: boolean) => setOpen(v)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const openPalette = useCallback(() => broadcast(true), [])
  const closePalette = useCallback(() => broadcast(false), [])
  const toggle = useCallback(() => broadcast(!sharedOpen), [])

  return { open, openPalette, closePalette, toggle }
}
