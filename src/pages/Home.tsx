import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { Search, Star, Clock } from '../icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { NAV_CATEGORIES, type NavItem } from '../constants/navigation'
import { useFavorites } from '../hooks/useFavorites'
import { useRecents } from '../hooks/useRecents'
import { useCommandPalette } from '../hooks/useCommandPalette'

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.025, delayChildren: 0.02 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
}

function ToolCard({ path, iconComponent: Icon, label, description }: {
  path: string
  iconComponent: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description: string
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18 }}>
      <Link
        to={path}
        className="group flex items-start gap-3 rounded-xl border border-base-200 bg-base-100 p-3 shadow-sm hover:border-primary/30 hover:shadow-md transition-[box-shadow,border-color]"
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <Icon size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-base-content truncate">{label}</p>
          <p className="text-xs text-base-content/50 mt-0.5 truncate">{description}</p>
        </div>
      </Link>
    </motion.div>
  )
}

function CompactCard({ path, iconComponent: Icon, label }: {
  path: string
  iconComponent: React.ComponentType<{ size?: number; className?: string }>
  label: string
}) {
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.18 }}>
      <Link
        to={path}
        className="group flex items-center gap-2.5 rounded-lg border border-base-200 bg-base-100 px-3 py-2 shadow-sm hover:border-primary/30 hover:shadow-md transition-[box-shadow,border-color]"
      >
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <Icon size={13} className="text-primary" />
        </div>
        <p className="text-sm font-medium text-base-content truncate">{label}</p>
      </Link>
    </motion.div>
  )
}

export function Home() {
  const { t } = useTranslation()
  const favs = useFavorites()
  const recents = useRecents()
  const { openPalette } = useCommandPalette()
  const reduce = useReducedMotion()
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
          <motion.div
            variants={containerVariants}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
          >
            {favItems.map((item) => (
              <CompactCard key={item.path} path={item.path} iconComponent={item.icon} label={getLabel(t, item)} />
            ))}
          </motion.div>
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
          <motion.div
            variants={containerVariants}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
          >
            {recentItems.map((item) => (
              <CompactCard key={item.path} path={item.path} iconComponent={item.icon} label={getLabel(t, item)} />
            ))}
          </motion.div>
        </div>
      )}

      {/* All tools grouped by category */}
      {NAV_CATEGORIES.map((category) => (
        <div key={category.key} className="mb-8">
          <h2 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
            {t(`navCategories.${category.key}`)}
          </h2>
          <motion.div
            variants={containerVariants}
            initial={reduce ? false : 'hidden'}
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
          >
            {category.items.map((item) => (
              <ToolCard
                key={item.path}
                path={item.path}
                iconComponent={item.icon}
                label={getLabel(t, item)}
                description={item.i18nKey ? t(`navDescriptions.${item.i18nKey}`) : item.description}
              />
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  )
}

function getLabel(t: (key: string) => string, item: NavItem): string {
  return item.i18nKey ? t(`nav.${item.i18nKey}`) : item.label
}
