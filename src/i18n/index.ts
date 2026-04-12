import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import ar from './ar'

const savedLang = typeof localStorage !== 'undefined'
  ? localStorage.getItem('plex-lang') || 'en'
  : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', dir: 'rtl' as const },
]

export function getDirection(lang: string): 'ltr' | 'rtl' {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr'
}

export default i18n
