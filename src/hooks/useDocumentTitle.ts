import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Plyx` : 'Plyx'
    return () => {
      document.title = 'Plyx'
    }
  }, [title])
}
