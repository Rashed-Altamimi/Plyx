// Color palette math — harmonies, shades, tints, and WCAG contrast.
// Keeps the implementation free of named-color tables; everything flows from
// a single `#rrggbb` entry point.

export type Rgb = { r: number; g: number; b: number }
export type Hsl = { h: number; s: number; l: number }

const HEX_RX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseHex(input: string): Rgb | null {
  const m = input.trim().match(HEX_RX)
  if (!m) return null
  let hex = m[1]
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const n = parseInt(hex, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function toHex({ r, g, b }: Rgb): string {
  const p = (n: number) => n.toString(16).padStart(2, '0')
  return `#${p(Math.round(r))}${p(Math.round(g))}${p(Math.round(b))}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break
      case gn: h = ((bn - rn) / d + 2); break
      case bn: h = ((rn - gn) / d + 4); break
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sN = s / 100, lN = l / 100
  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const hh = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))
  let r = 0, g = 0, b = 0
  if (hh < 1)      [r, g, b] = [c, x, 0]
  else if (hh < 2) [r, g, b] = [x, c, 0]
  else if (hh < 3) [r, g, b] = [0, c, x]
  else if (hh < 4) [r, g, b] = [0, x, c]
  else if (hh < 5) [r, g, b] = [x, 0, c]
  else             [r, g, b] = [c, 0, x]
  const m = lN - c / 2
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

// --- Harmonies ---------------------------------------------------------------

export type HarmonyKind =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'splitComplementary'
  | 'monochromatic'

export function harmony(hex: string, kind: HarmonyKind): string[] {
  const rgb = parseHex(hex)
  if (!rgb) return []
  const base = rgbToHsl(rgb)
  const make = (h: number, s = base.s, l = base.l): string =>
    toHex(hslToRgb({ h, s, l }))

  switch (kind) {
    case 'complementary':
      return [hex, make(base.h + 180)]
    case 'analogous':
      return [make(base.h - 30), hex, make(base.h + 30)]
    case 'triadic':
      return [hex, make(base.h + 120), make(base.h + 240)]
    case 'tetradic':
      return [hex, make(base.h + 90), make(base.h + 180), make(base.h + 270)]
    case 'splitComplementary':
      return [hex, make(base.h + 150), make(base.h + 210)]
    case 'monochromatic':
      return [
        make(base.h, base.s, Math.max(10, base.l - 30)),
        make(base.h, base.s, Math.max(10, base.l - 15)),
        hex,
        make(base.h, base.s, Math.min(92, base.l + 15)),
        make(base.h, base.s, Math.min(92, base.l + 30)),
      ]
  }
}

// Generate the classic 50/100/.../900 material-style shades around a color
export function shadeLadder(hex: string): { step: number; hex: string }[] {
  const rgb = parseHex(hex)
  if (!rgb) return []
  const hsl = rgbToHsl(rgb)
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  // Map shade step → target lightness (empirical curve matching design systems)
  const lightness = [97, 93, 84, 74, 62, 50, 42, 34, 27, 20]
  return steps.map((step, i) => ({
    step,
    hex: toHex(hslToRgb({ h: hsl.h, s: Math.min(100, hsl.s), l: lightness[i] })),
  }))
}

// --- WCAG contrast -----------------------------------------------------------

function relativeLuminance({ r, g, b }: Rgb): number {
  const ch = (v: number) => {
    const vn = v / 255
    return vn <= 0.03928 ? vn / 12.92 : Math.pow((vn + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

export function contrastRatio(a: string, b: string): number | null {
  const ra = parseHex(a)
  const rb = parseHex(b)
  if (!ra || !rb) return null
  const la = relativeLuminance(ra)
  const lb = relativeLuminance(rb)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

export interface ContrastVerdict {
  ratio: number
  normalAA: boolean
  normalAAA: boolean
  largeAA: boolean
  largeAAA: boolean
  uiAA: boolean  // non-text graphical objects / UI components
}

export function grade(ratio: number): ContrastVerdict {
  return {
    ratio,
    normalAA:  ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA:   ratio >= 3,
    largeAAA:  ratio >= 4.5,
    uiAA:      ratio >= 3,
  }
}
