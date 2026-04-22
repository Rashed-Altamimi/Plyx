import { useMemo } from 'react'
import { Wrench, Globe, Search, ChevronDown, Star, Command } from '../../icons'
import { useTranslation } from 'react-i18next'
import { NAV_CATEGORIES, HOME_ITEM } from '../../constants/navigation'
import { LANGUAGES } from '../../i18n'
import { NavItem } from './NavItem'
import { ThemeSwitcher } from './ThemeSwitcher'
import { AnalyticsToggle } from './AnalyticsToggle'
import { useFavorites } from '../../hooks/useFavorites'
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories'
import { useCommandPalette } from '../../hooks/useCommandPalette'

export function Sidebar() {
  const { t, i18n } = useTranslation()
  const favs = useFavorites()
  const collapsed = useCollapsedCategories()
  const { openPalette } = useCommandPalette()

  const switchLang = () => {
    const currentIdx = LANGUAGES.findIndex((l) => l.code === i18n.language)
    const next = LANGUAGES[(currentIdx + 1) % LANGUAGES.length]
    i18n.changeLanguage(next.code)
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language)

  // Favorite items as nav items (with icon + path)
  const favNavItems = useMemo(() => {
    const all = NAV_CATEGORIES.flatMap((c) => c.items)
    return favs.list.map((p) => all.find((i) => i.path === p)).filter((i): i is NonNullable<typeof i> => !!i)
  }, [favs.list])

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

  return (
    <aside className="w-64 h-screen sticky top-0 sidebar-border bg-base-100 flex flex-col shrink-0">
      {/* Header with logo + ⌘K */}
      <div className="px-4 py-4 border-b border-base-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Wrench size={14} className="text-primary-content" />
            </div>
            <span className="font-semibold text-base-content">Plyx</span>
          </div>
        </div>

        {/* Search / command palette trigger */}
        <button
          onClick={openPalette}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors cursor-pointer text-sm text-base-content/60"
        >
          <Search size={14} />
          <span className="flex-1 text-start">{t('sidebar.search')}</span>
          <kbd className="hidden xl:inline text-xs font-mono px-1.5 py-0.5 rounded bg-base-100 border border-base-300">
            {isMac ? '⌘' : 'Ctrl'}K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <NavItem item={HOME_ITEM} />

        {/* Favorites section */}
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
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
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
                    <NavItem key={item.path} item={item} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-base-200 space-y-3">
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
        <p className="text-xs text-base-content/40 px-2 flex items-center gap-1.5">
          <Command size={10} />
          {t('common.allToolsRunInBrowser')}
        </p>
      </div>
    </aside>
  )
}
