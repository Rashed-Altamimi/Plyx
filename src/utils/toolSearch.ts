import type { LucideIcon } from 'lucide-react'
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

const CATEGORY_KEY_BY_LABEL: Record<string, string> = {
  'Converters':  'converters',
  'Text Tools':  'textTools',
  'Dev Tools':   'devTools',
  'Generators':  'generators',
  'Calculators': 'calculators',
  'Image Tools': 'imageTools',
  'Fun':         'fun',
}

const PATH_TO_KEY: Record<string, string> = {
  '/password': 'password', '/qr': 'qr', '/datetime': 'datetime', '/files': 'files', '/hijri': 'hijri',
  '/units': 'units', '/currency': 'currency', '/roman': 'roman', '/world-clock': 'worldClock',
  '/case': 'case', '/json': 'json', '/word-count': 'wordCount', '/markdown': 'markdown',
  '/diff': 'diff', '/regex': 'regex', '/sort-lines': 'sortLines', '/find-replace': 'findReplace',
  '/sql': 'sql', '/yaml': 'yaml', '/morse': 'morse',
  '/hash': 'hash', '/base64': 'base64', '/url-encode': 'urlEncode', '/jwt': 'jwt', '/cron': 'cron',
  '/base-convert': 'baseConvert', '/color': 'color', '/http-status': 'httpStatus', '/mime': 'mime',
  '/user-agent': 'userAgent', '/html-entities': 'htmlEntities', '/subnet': 'subnet', '/json-ts': 'jsonTs',
  '/uuid': 'uuid', '/lorem': 'lorem', '/random': 'random', '/fake-data': 'fakeData',
  '/gradient': 'gradient', '/box-shadow': 'boxShadow', '/favicon': 'favicon', '/meta-tags': 'metaTags',
  '/age': 'age', '/percentage': 'percentage', '/loan': 'loan', '/bmi': 'bmi', '/tip': 'tip',
  '/date-diff': 'dateDiff', '/duration': 'duration', '/scientific': 'scientific', '/prime': 'prime',
  '/resize': 'resize', '/compress': 'compress', '/color-pick': 'colorPick',
  '/crop': 'crop', '/rotate': 'rotate', '/svg-png': 'svgPng', '/exif': 'exif', '/placeholder': 'placeholder',
  '/coin-flip': 'coinFlip', '/dice': 'dice', '/decide': 'decide', '/emoji': 'emoji',
}

export function buildToolIndex(t: TFunction): ToolEntry[] {
  const entries: ToolEntry[] = []
  for (const category of NAV_CATEGORIES) {
    const catKey = CATEGORY_KEY_BY_LABEL[category.label] ?? category.label
    for (const item of category.items) {
      const navKey = PATH_TO_KEY[item.path]
      entries.push({
        path: item.path,
        label: navKey ? t(`nav.${navKey}`) : item.label,
        description: navKey ? t(`navDescriptions.${navKey}`) : item.description,
        category: t(`navCategories.${catKey}`),
        categoryKey: catKey,
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
