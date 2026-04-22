import { NAV_CATEGORIES, type CategoryColor } from '../constants/navigation'

/**
 * Pre-computed fragments for each category color. Inline classnames stay in
 * the source as literal strings so Tailwind's content scanner picks them up —
 * do not generate class names dynamically.
 */
export interface ColorClasses {
  icon: string       // gradient background for card icon
  iconText: string   // foreground colour for icon
  hoverBorder: string
  dot: string        // small badge dot
  ring: string       // focus / accent ring
  softBg: string     // subtle tinted panel background
  fill: string       // solid-filled pill / badge
}

export const COLOR_CLASSES: Record<CategoryColor, ColorClasses> = {
  blue: {
    icon: 'bg-gradient-to-br from-blue-400/20 to-blue-500/10',
    iconText: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-400/50',
    dot: 'bg-blue-500',
    ring: 'ring-blue-400/40',
    softBg: 'bg-blue-500/5',
    fill: 'bg-blue-500 text-white',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-400/20 to-amber-500/10',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-400/50',
    dot: 'bg-amber-500',
    ring: 'ring-amber-400/40',
    softBg: 'bg-amber-500/5',
    fill: 'bg-amber-500 text-white',
  },
  emerald: {
    icon: 'bg-gradient-to-br from-emerald-400/20 to-emerald-500/10',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-400/50',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-400/40',
    softBg: 'bg-emerald-500/5',
    fill: 'bg-emerald-500 text-white',
  },
  teal: {
    icon: 'bg-gradient-to-br from-teal-400/20 to-teal-500/10',
    iconText: 'text-teal-600 dark:text-teal-400',
    hoverBorder: 'hover:border-teal-400/50',
    dot: 'bg-teal-500',
    ring: 'ring-teal-400/40',
    softBg: 'bg-teal-500/5',
    fill: 'bg-teal-500 text-white',
  },
  orange: {
    icon: 'bg-gradient-to-br from-orange-400/20 to-orange-500/10',
    iconText: 'text-orange-600 dark:text-orange-400',
    hoverBorder: 'hover:border-orange-400/50',
    dot: 'bg-orange-500',
    ring: 'ring-orange-400/40',
    softBg: 'bg-orange-500/5',
    fill: 'bg-orange-500 text-white',
  },
  violet: {
    icon: 'bg-gradient-to-br from-violet-400/20 to-violet-500/10',
    iconText: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-400/50',
    dot: 'bg-violet-500',
    ring: 'ring-violet-400/40',
    softBg: 'bg-violet-500/5',
    fill: 'bg-violet-500 text-white',
  },
  pink: {
    icon: 'bg-gradient-to-br from-pink-400/20 to-pink-500/10',
    iconText: 'text-pink-600 dark:text-pink-400',
    hoverBorder: 'hover:border-pink-400/50',
    dot: 'bg-pink-500',
    ring: 'ring-pink-400/40',
    softBg: 'bg-pink-500/5',
    fill: 'bg-pink-500 text-white',
  },
}

const PATH_TO_COLOR: Map<string, CategoryColor> = (() => {
  const m = new Map<string, CategoryColor>()
  for (const cat of NAV_CATEGORIES) {
    for (const item of cat.items) m.set(item.path, cat.color)
  }
  return m
})()

export function colorForPath(path: string): CategoryColor {
  return PATH_TO_COLOR.get(path) ?? 'blue'
}

export function classesFor(color: CategoryColor): ColorClasses {
  return COLOR_CLASSES[color]
}
