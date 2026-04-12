import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Plex` : 'Plex'
    return () => {
      document.title = 'Plex'
    }
  }, [title])
}
