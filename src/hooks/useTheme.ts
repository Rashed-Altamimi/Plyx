import { useState, useEffect, useCallback } from 'react'

export type ThemeId = string

const STORAGE_KEY = 'plyx-theme'

export const THEMES = [
  { id: 'light',      label: 'Light',     emoji: '☀️' },
  { id: 'dark',       label: 'Dark',      emoji: '🌙' },
  { id: 'cupcake',    label: 'Cupcake',   emoji: '🧁' },
  { id: 'corporate',  label: 'Corporate', emoji: '🏢' },
  { id: 'emerald',    label: 'Emerald',   emoji: '✳️' },
  { id: 'synthwave',  label: 'Synthwave', emoji: '🌆' },
  { id: 'dracula',    label: 'Dracula',   emoji: '🧛' },
  { id: 'nord',       label: 'Nord',      emoji: '❄️' },
  { id: 'sunset',     label: 'Sunset',    emoji: '🌅' },
  { id: 'retro',      label: 'Retro',     emoji: '📺' },
] as const

function getSavedTheme(): ThemeId {
  if (typeof localStorage === 'undefined') return 'light'
  return localStorage.getItem(STORAGE_KEY) || 'light'
}

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(getSavedTheme)

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
