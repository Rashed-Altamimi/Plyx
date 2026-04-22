import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Wrench, Search, ChevronDown, Star, Command, Clock } from '../../icons'
import { useTranslation } from 'react-i18next'
import { NAV_CATEGORIES, HOME_ITEM } from '../../constants/navigation'
import { NavItem } from './NavItem'
import { Settings } from './Settings'
import { useFavorites } from '../../hooks/useFavorites'
import { useRecents } from '../../hooks/useRecents'
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { classesFor } from '../../utils/categoryColor'

export function Sidebar() {
  const { t } = useTranslation()
  const favs = useFavorites()
  const recents = useRecents()
  const collapsed = useCollapsedCategories()
  const { openPalette } = useCommandPalette()

  const allTools = useMemo(() => NAV_CATEGORIES.flatMap((c) => c.items), [])

  const favNavItems = useMemo(
    () => favs.list.map((p) => allTools.find((i) => i.path === p)).filter((i): i is NonNullable<typeof i> => !!i),
    [favs.list, allTools]
  )

  // Cap sidebar recents to 4 to avoid dominating the list
  const recentNavItems = useMemo(
    () => recents.list
      .map((p) => allTools.find((i) => i.path === p))
      .filter((i): i is NonNullable<typeof i> => !!i)
      .slice(0, 4),
    [recents.list, allTools]
  )

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)

  return (
    <aside className="w-64 h-screen sticky top-0 sidebar-border bg-base-100/60 backdrop-blur-xl flex flex-col shrink-0">
      {/* Header with logo + ⌘K */}
      <div className="px-4 py-4 border-b border-base-content/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_-4px_var(--primary-50)]">
              <Wrench size={14} className="text-primary-content" />
            </div>
            <span className="font-display font-bold text-lg text-base-content tracking-tight">Plyx</span>
          </div>
        </div>

        <button
          onClick={openPalette}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-base-content/10 bg-base-200/40 hover:bg-base-200 hover:border-base-content/20 transition-colors cursor-pointer text-sm text-base-content/50 group"
        >
          <Search size={13} className="group-hover:text-primary transition-colors" />
          <span className="flex-1 text-start text-xs">{t('sidebar.search')}</span>
          <kbd className="kbd-hint hidden xl:inline">
            {isMac ? '⌘' : 'Ctrl'}K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <NavItem item={HOME_ITEM} />

        {/* Favorites section */}
        {favNavItems.length > 0 && (
          <SidebarSection
            sectionKey="favorites"
            isCollapsed={collapsed.isCollapsed('favorites')}
            onToggle={() => collapsed.toggle('favorites')}
            eyebrow={
              <>
                <Star size={11} className="text-yellow-500 fill-yellow-500" />
                <p className="eyebrow group-hover:text-base-content/70 transition-colors">
                  {t('sidebar.pinned')}
                </p>
                <span className="ms-auto text-[10px] font-mono text-base-content/30 tabular-nums">
                  {favNavItems.length}
                </span>
              </>
            }
          >
            {favNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </SidebarSection>
        )}

        {/* Recents section */}
        {recentNavItems.length > 0 && (
          <SidebarSection
            sectionKey="recents"
            isCollapsed={collapsed.isCollapsed('recents')}
            onToggle={() => collapsed.toggle('recents')}
            eyebrow={
              <>
                <Clock size={11} className="text-base-content/40" />
                <p className="eyebrow group-hover:text-base-content/70 transition-colors">
                  {t('sidebar.recent')}
                </p>
                <span className="ms-auto text-[10px] font-mono text-base-content/30 tabular-nums">
                  {recentNavItems.length}
                </span>
              </>
            }
          >
            {recentNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </SidebarSection>
        )}

        {/* Divider */}
        {(favNavItems.length > 0 || recentNavItems.length > 0) && (
          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
        )}

        {/* Categories */}
        {NAV_CATEGORIES.map((category) => {
          const isCollapsed = collapsed.isCollapsed(category.key)
          const c = classesFor(category.color)
          return (
            <SidebarSection
              key={category.key}
              sectionKey={category.key}
              isCollapsed={isCollapsed}
              onToggle={() => collapsed.toggle(category.key)}
              eyebrow={
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                  <p className="eyebrow group-hover:text-base-content/70 transition-colors">
                    {t(`navCategories.${category.key}`)}
                  </p>
                  <span className="ms-auto text-[10px] font-mono text-base-content/30 tabular-nums">
                    {category.items.length}
                  </span>
                </>
              }
            >
              {category.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </SidebarSection>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-base-content/[0.06] flex items-center justify-between gap-3">
        <p className="text-[10px] text-base-content/40 flex items-center gap-1.5 tracking-wide min-w-0">
          <Command size={10} className="shrink-0" />
          <span className="truncate">{t('common.allToolsRunInBrowser')}</span>
        </p>
        <Settings align="end" />
      </div>
    </aside>
  )
}

interface SidebarSectionProps {
  sectionKey: string
  isCollapsed: boolean
  onToggle: () => void
  eyebrow: React.ReactNode
  children: React.ReactNode
}

function SidebarSection({ sectionKey, isCollapsed, onToggle, eyebrow, children }: SidebarSectionProps) {
  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-3 mb-1.5 group cursor-pointer"
        aria-expanded={!isCollapsed}
        aria-controls={`section-${sectionKey}`}
      >
        <ChevronDown
          size={11}
          className={`text-base-content/40 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
        />
        {eyebrow}
      </button>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id={`section-${sectionKey}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
