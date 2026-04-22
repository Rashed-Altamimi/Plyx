import { useState, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Menu, X, Wrench, Globe, Search, ChevronDown, Star } from '../../icons'
import { useTranslation } from 'react-i18next'
import { HOME_ITEM, NAV_CATEGORIES } from '../../constants/navigation'
import { LANGUAGES } from '../../i18n'
import { NavItem } from './NavItem'
import { ThemeSwitcher } from './ThemeSwitcher'
import { AnalyticsToggle } from './AnalyticsToggle'
import { useFavorites } from '../../hooks/useFavorites'
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories'
import { useCommandPalette } from '../../hooks/useCommandPalette'

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const favs = useFavorites()
  const collapsed = useCollapsedCategories()
  const { openPalette } = useCommandPalette()
  const reduce = useReducedMotion()
  const isRtl = i18n.dir() === 'rtl'

  const switchLang = () => {
    const currentIdx = LANGUAGES.findIndex((l) => l.code === i18n.language)
    const next = LANGUAGES[(currentIdx + 1) % LANGUAGES.length]
    i18n.changeLanguage(next.code)
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)

  const favNavItems = useMemo(() => {
    const all = NAV_CATEGORIES.flatMap((c) => c.items)
    return favs.list.map((p) => all.find((i) => i.path === p)).filter((i): i is NonNullable<typeof i> => !!i)
  }, [favs.list])

  const close = () => setOpen(false)
  const handleSearchClick = () => {
    close()
    openPalette()
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-base-100 border-b border-base-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Wrench size={14} className="text-primary-content" />
          </div>
          <span className="font-semibold text-base-content">Plyx</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openPalette}
            className="p-2 rounded-lg hover:bg-base-200 transition-colors"
            aria-label="Search tools"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-base-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer-backdrop"
            className="md:hidden fixed inset-0 z-50 bg-black/30"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="md:hidden fixed top-0 z-50 h-full w-72 bg-base-100 shadow-xl mobile-drawer flex flex-col"
        initial={false}
        animate={{
          x: open ? 0 : (reduce ? 0 : (isRtl ? 288 : -288)),
          opacity: open || !reduce ? 1 : 0,
        }}
        style={{
          [isRtl ? 'right' : 'left']: 0,
          pointerEvents: open ? 'auto' : 'none',
        } as React.CSSProperties}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Wrench size={14} className="text-primary-content" />
            </div>
            <span className="font-semibold text-base-content">Plyx</span>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-base-200" aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-base-200 shrink-0">
          <button
            onClick={handleSearchClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 text-sm text-base-content/60"
          >
            <Search size={14} />
            <span className="flex-1 text-start">{t('sidebar.search')}</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <NavItem item={HOME_ITEM} onClick={close} />

          {favNavItems.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 px-3 mb-1">
                <Star size={11} className="text-yellow-500 fill-yellow-500" />
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
                  {t('sidebar.pinned')}
                </p>
              </div>
              <div className="space-y-0.5">
                {favNavItems.map((item) => (
                  <NavItem key={item.path} item={item} onClick={close} />
                ))}
              </div>
            </div>
          )}

          {NAV_CATEGORIES.map((category) => {
            const isCollapsed = collapsed.isCollapsed(category.key)
            return (
              <div key={category.key} className="mt-4">
                <button
                  onClick={() => collapsed.toggle(category.key)}
                  className="w-full flex items-center gap-1.5 px-3 mb-1 group cursor-pointer"
                >
                  <ChevronDown
                    size={12}
                    className={`text-base-content/40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                  <p className="text-xs font-semibold text-base-content/40 group-hover:text-base-content/60 uppercase tracking-wider">
                    {t(`navCategories.${category.key}`)}
                  </p>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {category.items.map((item) => (
                      <NavItem key={item.path} item={item} onClick={close} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-base-200 shrink-0 space-y-3">
          <div className="flex items-center justify-between px-2">
            <ThemeSwitcher />
            <button
              onClick={switchLang}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
            >
              <Globe size={12} />
              <span>{currentLang?.label}</span>
            </button>
          </div>
          <AnalyticsToggle />
        </div>
      </motion.div>
    </>
  )
}
