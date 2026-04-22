import { useEffect, useState, useCallback } from 'react'
import { hslToRgb, toHex, parseHex } from '../utils/palette'

const STORAGE_KEY = 'plyx-custom-theme'

export interface CustomTheme {
  base100: string
  base200: string
  base300: string
  baseContent: string
  primary: string
  primaryContent: string
  secondary: string
  secondaryContent: string
  accent: string
  accentContent: string
  colorScheme: 'light' | 'dark'
}

/** Default = clone of the built-in dark theme. Stored as hex so color pickers round-trip cleanly. */
export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  base100:        '#09090b',
  base200:        '#111113',
  base300:        '#1d1d20',
  baseContent:    '#f4f4f5',
  primary:        '#7c6cfa',
  primaryContent: '#ffffff',
  secondary:      '#a78bfa',
  secondaryContent: '#ffffff',
  accent:         '#22d3ee',
  accentContent:  '#0a0a0a',
  colorScheme:    'dark',
}

/** Ready-made starting points. Keyed for UI. */
export const CUSTOM_PRESETS: Record<string, CustomTheme> = {
  dark: DEFAULT_CUSTOM_THEME,
  light: {
    base100: '#fefefe', base200: '#f4f4f5', base300: '#e4e4e7', baseContent: '#18181b',
    primary: '#6d5ef6', primaryContent: '#ffffff',
    secondary: '#8b5cf6', secondaryContent: '#ffffff',
    accent: '#06b6d4', accentContent: '#ffffff',
    colorScheme: 'light',
  },
  ocean: {
    base100: '#0a192f', base200: '#112240', base300: '#1d3557',
    baseContent: '#e6f1ff',
    primary: '#64ffda', primaryContent: '#0a192f',
    secondary: '#80b3ff', secondaryContent: '#0a192f',
    accent: '#f5a623', accentContent: '#0a192f',
    colorScheme: 'dark',
  },
  forest: {
    base100: '#1a1a1a', base200: '#222222', base300: '#2e2e2e',
    baseContent: '#e9e9e6',
    primary: '#a3e635', primaryContent: '#1a1a1a',
    secondary: '#fbbf24', secondaryContent: '#1a1a1a',
    accent: '#f472b6', accentContent: '#1a1a1a',
    colorScheme: 'dark',
  },
  paper: {
    base100: '#fbf9f4', base200: '#f2ede3', base300: '#e6dfd1',
    baseContent: '#1f1c18',
    primary: '#7a4d1e', primaryContent: '#fbf9f4',
    secondary: '#b85c38', secondaryContent: '#fbf9f4',
    accent: '#3d85c6', accentContent: '#fbf9f4',
    colorScheme: 'light',
  },
}

// --- Module-level state so all hook consumers stay in sync -------------------

function load(): CustomTheme {
  if (typeof localStorage === 'undefined') return DEFAULT_CUSTOM_THEME
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CUSTOM_THEME
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_CUSTOM_THEME, ...parsed }
  } catch {
    return DEFAULT_CUSTOM_THEME
  }
}

let shared = load()
const subscribers = new Set<(t: CustomTheme) => void>()

function broadcast(next: CustomTheme) {
  shared = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* quota */ }
  subscribers.forEach((s) => s(next))
}

// --- CSS variable application ------------------------------------------------

const CSS_MAP: Array<[keyof CustomTheme, string]> = [
  ['base100',         '--color-base-100'],
  ['base200',         '--color-base-200'],
  ['base300',         '--color-base-300'],
  ['baseContent',     '--color-base-content'],
  ['primary',         '--color-primary'],
  ['primaryContent',  '--color-primary-content'],
  ['secondary',       '--color-secondary'],
  ['secondaryContent','--color-secondary-content'],
  ['accent',          '--color-accent'],
  ['accentContent',   '--color-accent-content'],
]

/** Write the theme values to the root element as inline CSS variables. */
export function applyCustomVars(t: CustomTheme) {
  const root = document.documentElement
  for (const [key, cssVar] of CSS_MAP) {
    root.style.setProperty(cssVar, t[key] as string)
  }
  root.style.colorScheme = t.colorScheme
}

/** Remove all overrides so DaisyUI's theme values take over again. */
export function clearCustomVars() {
  const root = document.documentElement
  for (const [, cssVar] of CSS_MAP) {
    root.style.removeProperty(cssVar)
  }
  root.style.removeProperty('color-scheme')
}

// --- Hook --------------------------------------------------------------------

export function useCustomTheme() {
  const [theme, setTheme] = useState<CustomTheme>(shared)

  useEffect(() => {
    const handler = (t: CustomTheme) => setTheme(t)
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  const update = useCallback((patch: Partial<CustomTheme>) => {
    broadcast({ ...shared, ...patch })
  }, [])

  const replace = useCallback((next: CustomTheme) => {
    broadcast(next)
  }, [])

  const reset = useCallback(() => {
    broadcast(DEFAULT_CUSTOM_THEME)
  }, [])

  return { theme, update, replace, reset }
}

/** Non-React accessor — used by useTheme to apply on mount/switch. */
export function getCustomTheme(): CustomTheme {
  return shared
}

// ---------------------------------------------------------------------------
// Random theme generator — builds a coherent palette around a random hue.
// ---------------------------------------------------------------------------

function bestContentFor(hex: string): string {
  const rgb = parseHex(hex)
  if (!rgb) return '#ffffff'
  const luma = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luma > 0.55 ? '#0a0a0a' : '#ffffff'
}

/** Generate a random but visually-coherent theme. */
export function randomTheme(): CustomTheme {
  const hue = Math.floor(Math.random() * 360)
  const isDark = Math.random() > 0.5
  const make = (h: number, s: number, l: number) =>
    toHex(hslToRgb({ h: ((h % 360) + 360) % 360, s, l }))

  const primary   = isDark ? make(hue, 70, 62)       : make(hue, 75, 50)
  const secondary = isDark ? make(hue + 35, 65, 70)  : make(hue + 35, 70, 55)
  const accent    = isDark ? make(hue + 180, 70, 60) : make(hue + 180, 80, 50)

  if (isDark) {
    return {
      base100:          make(hue, 18, 11),
      base200:          make(hue, 16, 15),
      base300:          make(hue, 14, 22),
      baseContent:      make(hue, 8, 96),
      primary,
      primaryContent:   bestContentFor(primary),
      secondary,
      secondaryContent: bestContentFor(secondary),
      accent,
      accentContent:    bestContentFor(accent),
      colorScheme:      'dark',
    }
  }
  return {
    base100:          make(hue, 6, 98),
    base200:          make(hue, 10, 95),
    base300:          make(hue, 14, 90),
    baseContent:      make(hue, 30, 14),
    primary,
    primaryContent:   bestContentFor(primary),
    secondary,
    secondaryContent: bestContentFor(secondary),
    accent,
    accentContent:    bestContentFor(accent),
    colorScheme:      'light',
  }
}

// ---------------------------------------------------------------------------
// Sampling the currently-active theme from the DOM.
//
// DaisyUI ships colors as `oklch(...)` strings. Color pickers in the editor
// speak hex, so we normalise by painting the color onto a 1×1 canvas and
// reading back the pixel — this works for any CSS-parseable color (oklch,
// hsl, rgb, named) in any modern browser.
// ---------------------------------------------------------------------------

function paintAndRead(cssColor: string): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = cssColor
    // If fillStyle didn't accept the color it will keep the default (#000).
    if (ctx.fillStyle === '#000000' && !/^(#000000|rgb\(0, *0, *0\)|black)$/.test(cssColor.trim())) {
      return null
    }
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    const h = (n: number) => n.toString(16).padStart(2, '0')
    return `#${h(r)}${h(g)}${h(b)}`
  } catch {
    return null
  }
}

/** Read the current theme's CSS variables and return them as a CustomTheme. */
export function sampleCurrentTheme(fallback: CustomTheme = DEFAULT_CUSTOM_THEME): CustomTheme {
  if (typeof document === 'undefined') return fallback
  const cs = getComputedStyle(document.documentElement)
  const read = (cssVar: string, fb: string) => {
    const raw = cs.getPropertyValue(cssVar).trim()
    if (!raw) return fb
    return paintAndRead(raw) ?? fb
  }

  const baseContent = read('--color-base-content', fallback.baseContent)
  // Guess the color scheme from base-content luminance — more reliable than
  // reading the `color-scheme` property, which is often unset.
  const m = baseContent.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  let colorScheme: 'light' | 'dark' = fallback.colorScheme
  if (m) {
    const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    colorScheme = luma > 0.5 ? 'dark' : 'light'
  }

  return {
    base100:          read('--color-base-100',         fallback.base100),
    base200:          read('--color-base-200',         fallback.base200),
    base300:          read('--color-base-300',         fallback.base300),
    baseContent,
    primary:          read('--color-primary',          fallback.primary),
    primaryContent:   read('--color-primary-content',  fallback.primaryContent),
    secondary:        read('--color-secondary',        fallback.secondary),
    secondaryContent: read('--color-secondary-content', fallback.secondaryContent),
    accent:           read('--color-accent',           fallback.accent),
    accentContent:    read('--color-accent-content',   fallback.accentContent),
    colorScheme,
  }
}
