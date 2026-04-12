import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getDirection } from '../i18n'

export function useDirection() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = getDirection(i18n.language)
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language

    const handleChange = (lng: string) => {
      const d = getDirection(lng)
      document.documentElement.dir = d
      document.documentElement.lang = lng
      localStorage.setItem('plyx-lang', lng)
    }
    i18n.on('languageChanged', handleChange)
    return () => { i18n.off('languageChanged', handleChange) }
  }, [i18n])
}
