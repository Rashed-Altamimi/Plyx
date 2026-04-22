import { useState, useEffect, useCallback } from 'react'
import { applyCustomVars, clearCustomVars, getCustomTheme, CUSTOM_PRESETS } from './useCustomTheme'
import { updateFavicon } from '../utils/dynamicFavicon'

export type ThemeId = string

const STORAGE_KEY = 'plyx-theme'
const DEFAULT_THEME: ThemeId = 'dark'

export const THEMES = [
  { id: 'dark',   label: 'Dark',   emoji: '●' },
  { id: 'light',  label: 'Light',  emoji: '○' },
  { id: 'ocean',  label: 'Ocean',  emoji: '🌊' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'paper',  label: 'Paper',  emoji: '📜' },
  { id: 'custom', label: 'Custom', emoji: '✦' },
] as const

// Valid IDs for quick checks + migration of unknown saved values.
const VALID_IDS: Set<string> = new Set(THEMES.map((t) => t.id))

// Translate legacy theme IDs so upgraders keep a sensible look.
const LEGACY_ALIAS: Record<string, ThemeId> = {
  plyxDark: 'dark',
  plyxLight: 'light',
  cupcake: 'light',
  corporate: 'light',
  emerald: 'forest',
  synthwave: 'custom',
  dracula: 'dark',
  nord: 'ocean',
  sunset: 'custom',
  retro: 'paper',
}

function getSavedTheme(): ThemeId {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_THEME
  const migrated = LEGACY_ALIAS[raw] ?? (VALID_IDS.has(raw) ? raw : DEFAULT_THEME)
  if (migrated !== raw) {
    try { localStorage.setItem(STORAGE_KEY, migrated) } catch { /* storage full */ }
  }
  return migrated
}

/**
 * Apply a theme:
 * - `dark` / `light` — native DaisyUI theme, colors come from index.css.
 * - Any preset (`ocean`, `forest`, `paper`) — layer its colors as inline CSS
 *   variables over the `dark` / `light` base so widgets still get the right
 *   scaffolding.
 * - `custom` — same mechanism, but uses the user's saved colors.
 */
function applyTheme(theme: ThemeId) {
  const root = document.documentElement

  if (theme === 'dark' || theme === 'light') {
    root.setAttribute('data-theme', theme)
    clearCustomVars()
  } else {
    const preset = theme === 'custom' ? getCustomTheme() : CUSTOM_PRESETS[theme]
    if (!preset) {
      root.setAttribute('data-theme', DEFAULT_THEME)
      clearCustomVars()
    } else {
      root.setAttribute('data-theme', preset.colorScheme === 'dark' ? 'dark' : 'light')
      applyCustomVars(preset)
    }
  }

  // Push the new brand colors into the tab icon + browser chrome
  updateFavicon()
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
