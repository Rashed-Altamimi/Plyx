import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecents } from '../../hooks/useRecents'

export function RouteTracker() {
  const location = useLocation()
  // Only destructure the stable `push` callback — including the whole `recents`
  // object in deps causes an infinite loop because useRecents returns a new
  // object reference on every render, even when nothing changed.
  const { push } = useRecents()

  useEffect(() => {
    push(location.pathname)
  }, [location.pathname, push])

  return null
}
