import type { LucideIcon } from '../icons'
import type { TFunction } from 'i18next'
import { NAV_CATEGORIES } from '../constants/navigation'

export interface ToolEntry {
  path: string
  label: string
  description: string
  category: string
  categoryKey: string
  icon: LucideIcon
}

export function buildToolIndex(t: TFunction): ToolEntry[] {
  const entries: ToolEntry[] = []
  for (const category of NAV_CATEGORIES) {
    for (const item of category.items) {
      entries.push({
        path: item.path,
        label: item.i18nKey ? t(`nav.${item.i18nKey}`) : item.label,
        description: item.i18nKey ? t(`navDescriptions.${item.i18nKey}`) : item.description,
        category: t(`navCategories.${category.key}`),
        categoryKey: category.key,
        icon: item.icon,
      })
    }
  }
  return entries
}

/**
 * Simple scoring:
 * - Exact label match: 1000
 * - Label starts with query: 500
 * - Label substring: 300
 * - Description substring: 100
 * - Category match: 50
 * - Subsequence match (fuzzy): 10
 */
export function scoreEntry(entry: ToolEntry, query: string): number {
  if (!query) return 0
  const q = query.toLowerCase().trim()
  const label = entry.label.toLowerCase()
  const desc = entry.description.toLowerCase()
  const cat = entry.category.toLowerCase()

  if (label === q) return 1000
  if (label.startsWith(q)) return 500
  if (label.includes(q)) return 300
  if (desc.includes(q)) return 100
  if (cat.includes(q)) return 50

  // Subsequence fuzzy
  let qi = 0
  for (let i = 0; i < label.length && qi < q.length; i++) {
    if (label[i] === q[qi]) qi++
  }
  if (qi === q.length) return 10

  return 0
}

export function filterAndRank(entries: ToolEntry[], query: string): ToolEntry[] {
  if (!query.trim()) return entries
  return entries
    .map((e) => ({ e, score: scoreEntry(e, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e)
}
