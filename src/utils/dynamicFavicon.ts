// Regenerate the browser tab favicon from the active theme's brand colors.
// Runs whenever a theme is applied or a custom color is edited.

// Phosphor "Wrench" (fill weight) — copied verbatim so the tab icon silhouette
// is pixel-identical to the in-app brand lockup.
const WRENCH_PATH =
  'M232,96a72,72,0,0,1-100.94,66L79,222.22c-.12.14-.26.29-.39.42a32,32,0,0,1-45.26-45.26c.14-.13.28-.27.43-.39L94,124.94a72.07,72.07,0,0,1,83.54-98.78,8,8,0,0,1,3.93,13.19L144,80l5.66,26.35L176,112l40.65-37.52a8,8,0,0,1,13.19,3.93A72.6,72.6,0,0,1,232,96Z'

const DEFAULT_PRIMARY = '#7c6cfa'
const DEFAULT_SECONDARY = '#a78bfa'
const DEFAULT_PRIMARY_CONTENT = '#ffffff'

/** Paint any CSS color string onto a 1×1 canvas and read it back as #rrggbb.
 *  Normalizes oklch/hsl/rgb/named colors so the SVG below has a value every
 *  browser can render inside a favicon. */
function resolveToHex(color: string): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    const h = (n: number) => n.toString(16).padStart(2, '0')
    return `#${h(r)}${h(g)}${h(b)}`
  } catch {
    return null
  }
}

function buildSvg(primary: string, secondary: string, wrenchFill: string): string {
  // One line — smaller encoded payload in the data: URI.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs><rect width="256" height="256" rx="64" fill="url(#g)"/><g transform="translate(64 64) scale(0.5)"><path fill="${wrenchFill}" d="${WRENCH_PATH}"/></g></svg>`
}

function setLink(rel: string, type: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"][type="${type}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    link.type = type
    document.head.appendChild(link)
  }
  link.href = href
}

function setMeta(name: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (el) el.content = content
}

let lastPair = ''

/**
 * Read the current primary + secondary from computed styles, normalize to
 * hex, and push a fresh SVG favicon into <head>. Also updates the mobile
 * theme-color meta so the browser chrome shifts with the theme.
 */
export function updateFavicon() {
  if (typeof document === 'undefined') return
  const cs = getComputedStyle(document.documentElement)
  const primary =
    resolveToHex(cs.getPropertyValue('--color-primary').trim()) ?? DEFAULT_PRIMARY
  const secondary =
    resolveToHex(cs.getPropertyValue('--color-secondary').trim()) ?? DEFAULT_SECONDARY
  const wrenchFill =
    resolveToHex(cs.getPropertyValue('--color-primary-content').trim()) ?? DEFAULT_PRIMARY_CONTENT

  const pair = `${primary}|${secondary}|${wrenchFill}`
  if (pair === lastPair) return
  lastPair = pair

  const svg = buildSvg(primary, secondary, wrenchFill)
  const href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
  setLink('icon', 'image/svg+xml', href)
  setMeta('theme-color', primary)
}
