import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Star, Clock } from '../icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { NAV_CATEGORIES } from '../constants/navigation'
import { useFavorites } from '../hooks/useFavorites'
import { useRecents } from '../hooks/useRecents'
import { useCommandPalette } from '../hooks/useCommandPalette'

const CATEGORY_KEYS = ['converters', 'textTools', 'devTools', 'generators', 'calculators', 'imageTools', 'fun'] as const

const PATH_TO_DESC_KEY: Record<string, string> = {
  '/password': 'password', '/qr': 'qr', '/datetime': 'datetime', '/files': 'files', '/hijri': 'hijri',
  '/units': 'units', '/currency': 'currency', '/roman': 'roman', '/world-clock': 'worldClock',
  '/case': 'case', '/json': 'json', '/word-count': 'wordCount', '/markdown': 'markdown', '/diff': 'diff', '/regex': 'regex',
  '/sort-lines': 'sortLines', '/find-replace': 'findReplace', '/sql': 'sql', '/yaml': 'yaml', '/morse': 'morse',
  '/hash': 'hash', '/base64': 'base64', '/url-encode': 'urlEncode', '/jwt': 'jwt', '/cron': 'cron', '/base-convert': 'baseConvert', '/color': 'color',
  '/http-status': 'httpStatus', '/mime': 'mime', '/user-agent': 'userAgent', '/html-entities': 'htmlEntities', '/subnet': 'subnet', '/json-ts': 'jsonTs',
  '/uuid': 'uuid', '/lorem': 'lorem', '/random': 'random',
  '/fake-data': 'fakeData', '/gradient': 'gradient', '/box-shadow': 'boxShadow', '/favicon': 'favicon', '/meta-tags': 'metaTags',
  '/age': 'age', '/percentage': 'percentage', '/loan': 'loan', '/bmi': 'bmi',
  '/tip': 'tip', '/date-diff': 'dateDiff', '/duration': 'duration', '/scientific': 'scientific', '/prime': 'prime',
  '/resize': 'resize', '/compress': 'compress', '/color-pick': 'colorPick',
  '/crop': 'crop', '/rotate': 'rotate', '/svg-png': 'svgPng', '/exif': 'exif', '/placeholder': 'placeholder',
  '/coin-flip': 'coinFlip', '/dice': 'dice', '/decide': 'decide', '/emoji': 'emoji',
}

function ToolCard({ path, iconComponent: Icon, label, description }: {
  path: string
  iconComponent: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description: string
}) {
  return (
    <Link
      to={path}
      className="group flex items-start gap-3 rounded-xl border border-base-200 bg-base-100 p-3 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-base-content truncate">{label}</p>
        <p className="text-xs text-base-content/50 mt-0.5 truncate">{description}</p>
      </div>
    </Link>
  )
}

function CompactCard({ path, iconComponent: Icon, label }: {
  path: string
  iconComponent: React.ComponentType<{ size?: number; className?: string }>
  label: string
}) {
  return (
    <Link
      to={path}
      className="group flex items-center gap-2.5 rounded-lg border border-base-200 bg-base-100 px-3 py-2 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
    >
      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon size={13} className="text-primary" />
      </div>
      <p className="text-sm font-medium text-base-content truncate">{label}</p>
    </Link>
  )
}

export function Home() {
  const { t } = useTranslation()
  const favs = useFavorites()
  const recents = useRecents()
  const { openPalette } = useCommandPalette()
  useDocumentTitle('')

  const allTools = useMemo(() => NAV_CATEGORIES.flatMap((c) => c.items), [])

  const favItems = useMemo(
    () => favs.list.map((p) => allTools.find((i) => i.path === p)).filter((i): i is NonNullable<typeof i> => !!i),
    [favs.list, allTools]
  )

  const recentItems = useMemo(
    () => recents.list.map((p) => allTools.find((i) => i.path === p)).filter((i): i is NonNullable<typeof i> => !!i),
    [recents.list, allTools]
  )

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-3">{t('home.title')}</h1>
        <p className="text-sm text-base-content/50 max-w-md mx-auto">{t('common.noDataLeaves')}</p>
      </div>

      {/* Big search trigger */}
      <button
        onClick={openPalette}
        className="w-full max-w-2xl mx-auto mb-10 flex items-center gap-3 px-5 py-4 rounded-2xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
      >
        <Search size={20} className="text-base-content/40 group-hover:text-primary transition-colors" />
        <span className="flex-1 text-start text-base text-base-content/50">
          {t('home.searchPlaceholder')}
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-base-200 border border-base-300 text-base-content/60">
          {isMac ? '⌘' : 'Ctrl'}K
        </kbd>
      </button>

      {/* Pinned */}
      {favItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <h2 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
              {t('home.pinned')}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {favItems.map((item) => (
              <CompactCard key={item.path} path={item.path} iconComponent={item.icon} label={getLabel(t, item.path, item.label)} />
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recentItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-base-content/40" />
            <h2 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
              {t('home.recent')}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {recentItems.map((item) => (
              <CompactCard key={item.path} path={item.path} iconComponent={item.icon} label={getLabel(t, item.path, item.label)} />
            ))}
          </div>
        </div>
      )}

      {/* All tools grouped by category */}
      {NAV_CATEGORIES.map((category, idx) => (
        <div key={category.label} className="mb-8">
          <h2 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
            {t(`navCategories.${CATEGORY_KEYS[idx]}`)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {category.items.map((item) => {
              const descKey = PATH_TO_DESC_KEY[item.path]
              return (
                <ToolCard
                  key={item.path}
                  path={item.path}
                  iconComponent={item.icon}
                  label={getLabel(t, item.path, item.label)}
                  description={descKey ? t(`navDescriptions.${descKey}`) : item.description}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function getLabel(t: (key: string) => string, path: string, fallback: string): string {
  const key = PATH_TO_DESC_KEY[path]
  return key ? t(`nav.${key}`) : fallback
}
