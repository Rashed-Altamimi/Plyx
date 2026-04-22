import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV_CATEGORIES, type NavItem } from '../../constants/navigation'

const SITE_NAME = 'Plyx'
const SITE_URL = 'https://rashed-altamimi.github.io/Plyx'

interface ResolvedMeta {
  title: string
  description: string
  canonical: string
}

function findItem(path: string): { item: NavItem; categoryKey: string } | null {
  for (const cat of NAV_CATEGORIES) {
    for (const item of cat.items) {
      if (item.path === path) return { item, categoryKey: cat.key }
    }
  }
  return null
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

/**
 * Route-driven SEO. Looks up the current path in the navigation catalog and
 * sets title / description / canonical / Open Graph / Twitter tags from the
 * tool's i18n entries. Mounted once in AppShell — no per-page changes needed.
 */
export function SeoHead() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const meta = resolveMeta(pathname, t)
    document.title = meta.title
    setMeta('description', meta.description)
    setLink('canonical', meta.canonical)

    // Open Graph
    setMeta('og:site_name', SITE_NAME, true)
    setMeta('og:title', meta.title, true)
    setMeta('og:description', meta.description, true)
    setMeta('og:url', meta.canonical, true)
    setMeta('og:type', 'website', true)
    setMeta('og:image', `${SITE_URL}/pwa-512x512.png`, true)
    setMeta('og:locale', i18n.language === 'ar' ? 'ar_AR' : 'en_US', true)

    // Twitter
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', meta.title)
    setMeta('twitter:description', meta.description)
    setMeta('twitter:image', `${SITE_URL}/pwa-512x512.png`)

    // <html lang>
    document.documentElement.setAttribute('lang', i18n.language)
  }, [pathname, t, i18n.language])

  return null
}

function resolveMeta(
  pathname: string,
  t: (key: string, options?: Record<string, unknown>) => string
): ResolvedMeta {
  const canonicalPath = pathname === '/' ? '/' : pathname
  const canonical = `${SITE_URL}${canonicalPath}`

  if (pathname === '/' || pathname === '') {
    return {
      title: `${SITE_NAME} — ${t('home.heroSubtitle', { count: countTools(), defaultValue: '65 utility tools, all client-side' })}`,
      description: t('common.noDataLeaves'),
      canonical,
    }
  }

  const match = findItem(pathname)
  if (!match) {
    return {
      title: SITE_NAME,
      description: t('common.noDataLeaves'),
      canonical,
    }
  }

  const label = match.item.i18nKey
    ? t(`nav.${match.item.i18nKey}`)
    : match.item.label
  const description = match.item.i18nKey
    ? t(`navDescriptions.${match.item.i18nKey}`)
    : match.item.description

  return {
    title: `${label} — ${SITE_NAME}`,
    description,
    canonical,
  }
}

function countTools(): number {
  return NAV_CATEGORIES.reduce((n, c) => n + c.items.length, 0)
}
