import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { Search, Star, Clock, ArrowRight, ShieldCheck, Sparkle } from '../icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { NAV_CATEGORIES, type NavItem, type NavCategory } from '../constants/navigation'
import { useFavorites } from '../hooks/useFavorites'
import { useRecents } from '../hooks/useRecents'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { classesFor } from '../utils/categoryColor'

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
}

interface CardProps {
  path: string
  iconComponent: React.ComponentType<{ size?: number; className?: string }>
  label: string
  description?: string
  category: NavCategory
}

function ToolRow({ path, iconComponent: Icon, label, description, category }: CardProps) {
  const c = classesFor(category.color)
  return (
    <motion.div variants={itemVariants} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        to={path}
        className="group relative flex items-center gap-3 rounded-lg border border-transparent bg-base-content/[0.02] hover:bg-base-content/[0.04] hover:border-base-content/[0.08] px-3 py-2.5 transition-[background-color,border-color,transform]"
      >
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon size={14} className={c.iconText} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-base-content truncate">{label}</p>
          {description && (
            <p className="text-xs text-base-content/45 truncate mt-0.5">{description}</p>
          )}
        </div>
        <ArrowRight size={12} className="text-base-content/0 group-hover:text-base-content/40 transition-colors shrink-0" />
      </Link>
    </motion.div>
  )
}

function CompactChip({ path, iconComponent: Icon, label, category }: Omit<CardProps, 'description'>) {
  const c = classesFor(category.color)
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
      <Link
        to={path}
        className={`group flex items-center gap-2 rounded-lg border border-base-content/[0.08] bg-base-200/40 px-3 py-2 transition-[background-color,border-color] ${c.hoverBorder}`}
      >
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon size={12} className={c.iconText} />
        </div>
        <p className="text-sm font-medium text-base-content/90 truncate">{label}</p>
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

  const { allTools, categoryByPath, totalTools } = useMemo(() => {
    const items: NavItem[] = []
    const byPath = new Map<string, NavCategory>()
    for (const cat of NAV_CATEGORIES) {
      for (const item of cat.items) {
        items.push(item)
        byPath.set(item.path, cat)
      }
    }
    return { allTools: items, categoryByPath: byPath, totalTools: items.length }
  }, [])

  const favItems = useMemo(
    () => favs.list.map((p) => allTools.find((i) => i.path === p)).filter((i): i is NavItem => !!i),
    [favs.list, allTools]
  )

  const recentItems = useMemo(
    () => recents.list.map((p) => allTools.find((i) => i.path === p)).filter((i): i is NavItem => !!i),
    [recents.list, allTools]
  )

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

  return (
    <div className="relative min-h-full">
      {/* Ambient backdrop */}
      <div className="absolute inset-x-0 top-0 h-[520px] bg-dot-grid pointer-events-none opacity-60" />
      <div className="hero-orb" aria-hidden="true" />

      <div className="relative max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1760px] 5xl:max-w-[2400px] mx-auto px-6 pt-20 pb-16">
        {/* Brand mark above hero */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-base-content/10 bg-base-200/40 backdrop-blur-sm mb-6">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-xs text-base-content/60 tracking-wide">{t('common.noDataLeaves')}</span>
          </div>

          <h1 className="font-display text-6xl sm:text-7xl font-bold text-base-content mb-3 tracking-[-0.04em]">
            <span className="bg-gradient-to-br from-base-content via-base-content to-base-content/60 bg-clip-text text-transparent">
              {t('home.title')}
            </span>
          </h1>
          <p className="text-base text-base-content/55 max-w-md mx-auto text-center">
            {t('home.heroSubtitle', { count: totalTools, defaultValue: `${totalTools} utility tools, all client-side` })}
          </p>
        </motion.div>

        {/* Command palette trigger */}
        <motion.button
          onClick={openPalette}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="group relative w-full max-w-2xl mx-auto mb-10 flex items-center gap-3 px-5 py-4 rounded-xl bg-base-200/50 backdrop-blur-sm border border-base-content/10 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_var(--primary-40)] transition-[border-color,box-shadow] cursor-pointer overflow-hidden"
        >
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Search size={18} className="text-base-content/40 group-hover:text-primary transition-colors" />
          <span className="flex-1 text-start text-sm text-base-content/50">
            {t('home.searchPlaceholder')}
          </span>
          <kbd className="kbd-hint hidden sm:inline-flex">
            {isMac ? '⌘' : 'Ctrl'}K
          </kbd>
        </motion.button>

        {/* Stats ribbon */}
        <div className="flex items-center justify-center gap-8 mb-16 text-center">
          <Stat value={totalTools} label={t('home.statTools', { defaultValue: 'Tools' })} accent />
          <div className="h-8 w-px bg-base-content/10" />
          <Stat value={favs.list.length} label={t('home.statFavorites', { defaultValue: 'Favorites' })} />
          <div className="h-8 w-px bg-base-content/10" />
          <Stat value={recents.list.length} label={t('home.statRecent', { defaultValue: 'Recent' })} />
        </div>

        {/* Pinned */}
        {favItems.length > 0 ? (
          <Section
            eyebrowIcon={<Star size={11} className="text-yellow-500 fill-yellow-500" />}
            title={t('home.pinned')}
            count={favItems.length}
          >
            <motion.div
              variants={containerVariants}
              initial={reduce ? false : 'hidden'}
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 3xl:grid-cols-6 4xl:grid-cols-8 gap-2"
            >
              {favItems.map((item) => (
                <CompactChip
                  key={item.path}
                  path={item.path}
                  iconComponent={item.icon}
                  label={getLabel(t, item)}
                  category={categoryByPath.get(item.path)!}
                />
              ))}
            </motion.div>
          </Section>
        ) : (
          <EmptyPinned t={t} />
        )}

        {/* Recent */}
        {recentItems.length > 0 && (
          <Section
            eyebrowIcon={<Clock size={11} className="text-base-content/40" />}
            title={t('home.recent')}
            count={recentItems.length}
          >
            <motion.div
              variants={containerVariants}
              initial={reduce ? false : 'hidden'}
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 3xl:grid-cols-7 4xl:grid-cols-9 gap-2"
            >
              {recentItems.map((item) => (
                <CompactChip
                  key={item.path}
                  path={item.path}
                  iconComponent={item.icon}
                  label={getLabel(t, item)}
                  category={categoryByPath.get(item.path)!}
                />
              ))}
            </motion.div>
          </Section>
        )}

        {/* All tools grouped by category */}
        {NAV_CATEGORIES.map((category) => {
          const c = classesFor(category.color)
          return (
            <Section
              key={category.key}
              eyebrowIcon={<span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />}
              title={t(`navCategories.${category.key}`)}
              count={category.items.length}
            >
              <motion.div
                variants={containerVariants}
                initial={reduce ? false : 'hidden'}
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 5xl:grid-cols-6 gap-1.5"
              >
                {category.items.map((item) => (
                  <ToolRow
                    key={item.path}
                    path={item.path}
                    iconComponent={item.icon}
                    label={getLabel(t, item)}
                    description={item.i18nKey ? t(`navDescriptions.${item.i18nKey}`) : item.description}
                    category={category}
                  />
                ))}
              </motion.div>
            </Section>
          )
        })}
      </div>
    </div>
  )
}

function Section({ eyebrowIcon, title, count, children }: {
  eyebrowIcon: React.ReactNode
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        {eyebrowIcon}
        <h2 className="eyebrow">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-mono text-base-content/30 tabular-nums">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display font-bold text-2xl tabular-nums ${accent ? 'bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent' : 'text-base-content'}`}>
        {value}
      </p>
      <p className="text-[10px] text-base-content/50 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  )
}

function EmptyPinned({ t }: { t: (k: string, o?: Record<string, string | number>) => string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <Star size={11} className="text-base-content/30" />
        <h2 className="eyebrow">{t('home.pinned')}</h2>
      </div>
      <div className="rounded-xl border border-dashed border-base-content/10 bg-base-content/[0.02] px-5 py-6 text-center">
        <Sparkle size={18} className="mx-auto mb-2 text-base-content/30" />
        <p className="text-sm text-base-content/55">
          {t('home.emptyPinned', { defaultValue: 'Star any tool to pin it here.' })}
        </p>
      </div>
    </div>
  )
}

function getLabel(t: (key: string) => string, item: NavItem): string {
  return item.i18nKey ? t(`nav.${item.i18nKey}`) : item.label
}
