import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import {
  Wrench,
  Search,
  Menu,
  X,
  Star,
  Clock,
  ChevronDown,
  Palette,
  Globe,
  Sparkle,
  Check,
} from '../../icons'
import { NAV_CATEGORIES, HOME_ITEM } from '../../constants/navigation'
import { NavItem } from './NavItem'
import { ThemeEditor } from './ThemeEditor'
import { useFavorites } from '../../hooks/useFavorites'
import { useRecents } from '../../hooks/useRecents'
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { useTheme, THEMES } from '../../hooks/useTheme'
import { useAnalyticsOptOut } from '../../hooks/useAnalyticsOptOut'
import { LANGUAGES } from '../../i18n'
import { classesFor } from '../../utils/categoryColor'

/**
 * All-in-one top navigation. Logo is centered; browse (merged sidebar) lives
 * on the left; theme / language / analytics controls are inline on the right.
 * The Settings popover has been retired — every control is one click away.
 */
export function TopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const { t } = useTranslation()
  const { openPalette } = useCommandPalette()

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/70 backdrop-blur-xl border-b border-base-content/[0.06]">
        <div className="h-14 flex items-center gap-2 pe-3 sm:pe-6">
          {/* Logo lives in the same column as the sidebar, flush to the left */}
          <Link
            to="/"
            className="group shrink-0 items-center gap-2 w-60 ps-4 pe-3 border-e border-base-content/[0.06] h-full hidden md:flex"
            aria-label="Plyx home"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_24px_-4px_var(--primary-50)] group-hover:shadow-[0_0_32px_-4px_var(--primary-70)] transition-[box-shadow]">
              <Wrench size={15} className="text-primary-content" />
            </div>
            <span className="font-display font-bold text-lg text-base-content tracking-tight">
              Plyx
            </span>
          </Link>

          {/* Mobile-only row: hamburger + small logo */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 ml-2 rounded-lg text-base-content/70 hover:bg-base-content/5 cursor-pointer shrink-0"
          >
            <Menu size={16} />
          </button>
          <Link
            to="/"
            className="md:hidden group shrink-0 flex items-center gap-2"
            aria-label="Plyx home"
          >
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wrench size={13} className="text-primary-content" />
            </div>
            <span className="font-display font-bold text-base text-base-content tracking-tight">
              Plyx
            </span>
          </Link>

          {/* Search fills the middle */}
          <button
            onClick={openPalette}
            className="group hidden sm:flex flex-1 min-w-0 items-center gap-2 h-9 px-3 ms-3 md:ms-0 rounded-lg border border-base-content/10 bg-base-200/40 hover:bg-base-200 hover:border-base-content/20 transition-colors cursor-pointer text-sm text-base-content/50"
          >
            <Search size={14} className="group-hover:text-primary transition-colors shrink-0" />
            <span className="flex-1 text-start text-xs sm:text-sm truncate">
              {t('sidebar.search')}
            </span>
            <kbd className="kbd-hint hidden lg:inline-flex shrink-0">
              {isMac ? '⌘' : 'Ctrl'}K
            </kbd>
          </button>
          <button
            onClick={openPalette}
            aria-label={t('sidebar.search')}
            className="sm:hidden ms-auto p-2 rounded-lg text-base-content/70 hover:bg-base-content/5 cursor-pointer"
          >
            <Search size={16} />
          </button>

          {/* Right-side controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <ThemeMenu onCustomize={() => setEditorOpen(true)} />
            <LanguageMenu />
            <AnalyticsPill />
          </div>
        </div>
      </header>

      <BrowseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ThemeEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Theme menu — pop-down list of every theme + the "Customize…" action
// ---------------------------------------------------------------------------

function ThemeMenu({ onCustomize }: { onCustomize: () => void }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('common.theme')}
        aria-expanded={open}
        className={`flex items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors ${
          open ? 'bg-base-content/10 text-base-content' : 'text-base-content/70 hover:bg-base-content/5'
        }`}
      >
        <Palette size={15} />
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute top-full end-0 mt-2 z-50 w-56 rounded-xl border border-base-content/10 bg-base-100/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] p-1.5"
          >
            <p className="eyebrow px-2 py-1">{t('common.theme')}</p>
            <div className="max-h-60 overflow-y-auto">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => { setTheme(th.id); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                    theme === th.id
                      ? 'bg-primary/10 text-base-content'
                      : 'text-base-content/70 hover:bg-base-content/5'
                  }`}
                >
                  <span className="w-4 text-center">{th.emoji}</span>
                  <span className="flex-1 text-start">{t(`themes.${th.id}`)}</span>
                  {theme === th.id && <Check size={12} className="text-primary" />}
                </button>
              ))}
            </div>
            <div className="my-1 h-px bg-base-content/10" />
            <button
              onClick={() => { setOpen(false); onCustomize() }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-primary hover:bg-primary/10 cursor-pointer transition-colors"
            >
              <Sparkle size={11} />
              <span className="flex-1 text-start">{t('settings.customizeTheme')}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Language menu — compact code indicator, pop-down list of available locales
// ---------------------------------------------------------------------------

function LanguageMenu() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('settings.language')}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          open ? 'bg-base-content/10 text-base-content' : 'text-base-content/70 hover:bg-base-content/5'
        }`}
      >
        <Globe size={14} />
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
          {currentLang.code}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute top-full end-0 mt-2 z-50 w-44 rounded-xl border border-base-content/10 bg-base-100/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] p-1.5"
          >
            <p className="eyebrow px-2 py-1">{t('settings.language')}</p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  currentLang.code === lang.code
                    ? 'bg-primary/10 text-base-content'
                    : 'text-base-content/70 hover:bg-base-content/5'
                }`}
              >
                <span className="w-8 text-[10px] font-mono uppercase text-base-content/50">{lang.code}</span>
                <span className="flex-1 text-start">{lang.label}</span>
                {currentLang.code === lang.code && <Check size={12} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Analytics pill — one-tap toggle with a tooltip-style hint
// ---------------------------------------------------------------------------

function AnalyticsPill() {
  const { t } = useTranslation()
  const { optedOut, toggle } = useAnalyticsOptOut()
  const enabled = !optedOut
  return (
    <button
      onClick={toggle}
      title={enabled ? t('settings.analyticsHint') : t('settings.analyticsHint')}
      aria-label={t('analytics.label')}
      className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors text-base-content/70 hover:bg-base-content/5"
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-500 shadow-[0_0_6px_currentColor]' : 'bg-base-content/30'}`} />
      <span className="uppercase tracking-wider text-[10px]">
        {enabled ? t('analytics.on') : t('analytics.off')}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Browse drawer — the old sidebar, now available on every screen size via
// the Menu button. Holds Home, Favorites, Recents, and every category.
// ---------------------------------------------------------------------------

function BrowseDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const favs = useFavorites()
  const recents = useRecents()
  const collapsed = useCollapsedCategories()
  const isRtl = i18n.dir() === 'rtl'

  const allTools = useMemo(() => NAV_CATEGORIES.flatMap((c) => c.items), [])
  const favNavItems = useMemo(
    () => favs.list
      .map((p) => allTools.find((i) => i.path === p))
      .filter((i): i is NonNullable<typeof i> => !!i),
    [favs.list, allTools],
  )
  const recentNavItems = useMemo(
    () => recents.list
      .map((p) => allTools.find((i) => i.path === p))
      .filter((i): i is NonNullable<typeof i> => !!i)
      .slice(0, 6),
    [recents.list, allTools],
  )

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer-backdrop"
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 z-50 h-full w-80 max-w-[85vw] bg-base-100 shadow-xl flex flex-col"
        initial={false}
        animate={{
          x: open ? 0 : (reduce ? 0 : (isRtl ? 320 : -320)),
          opacity: open || !reduce ? 1 : 0,
        }}
        style={{
          [isRtl ? 'right' : 'left']: 0,
          pointerEvents: open ? 'auto' : 'none',
        } as React.CSSProperties}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 }}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-base-content/[0.06] shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wrench size={14} className="text-primary-content" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Plyx</span>
          </Link>
          <button onClick={onClose} className="p-1.5 rounded-md text-base-content/60 hover:bg-base-content/5" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <NavItem item={HOME_ITEM} onClick={onClose} />

          {favNavItems.length > 0 && (
            <DrawerSection
              icon={<Star size={11} className="text-yellow-500 fill-yellow-500" />}
              title={t('sidebar.pinned')}
              count={favNavItems.length}
            >
              {favNavItems.map((item) => (
                <NavItem key={item.path} item={item} onClick={onClose} />
              ))}
            </DrawerSection>
          )}

          {recentNavItems.length > 0 && (
            <DrawerSection
              icon={<Clock size={11} className="text-base-content/40" />}
              title={t('sidebar.recent')}
              count={recentNavItems.length}
            >
              {recentNavItems.map((item) => (
                <NavItem key={item.path} item={item} onClick={onClose} />
              ))}
            </DrawerSection>
          )}

          {(favNavItems.length > 0 || recentNavItems.length > 0) && (
            <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
          )}

          {NAV_CATEGORIES.map((category) => {
            const isCollapsed = collapsed.isCollapsed(category.key)
            const c = classesFor(category.color)
            return (
              <div key={category.key} className="mt-4">
                <button
                  onClick={() => collapsed.toggle(category.key)}
                  className="w-full flex items-center gap-1.5 px-3 mb-1.5 group cursor-pointer"
                >
                  <ChevronDown
                    size={11}
                    className={`text-base-content/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                  <p className="eyebrow group-hover:text-base-content/70 transition-colors">
                    {t(`navCategories.${category.key}`)}
                  </p>
                  <span className="ms-auto text-[10px] font-mono text-base-content/30 tabular-nums">
                    {category.items.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {category.items.map((item) => (
                      <NavItem key={item.path} item={item} onClick={onClose} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </motion.div>
    </>
  )
}

function DrawerSection({ icon, title, count, children }: {
  icon: React.ReactNode
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-1.5 px-3 mb-1.5">
        {icon}
        <p className="eyebrow">{title}</p>
        <span className="ms-auto text-[10px] font-mono text-base-content/30 tabular-nums">{count}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
