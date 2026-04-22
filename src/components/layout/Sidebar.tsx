import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Star, Clock } from '../../icons'
import { useTranslation } from 'react-i18next'
import { NAV_CATEGORIES, HOME_ITEM } from '../../constants/navigation'
import { NavItem } from './NavItem'
import { useFavorites } from '../../hooks/useFavorites'
import { useRecents } from '../../hooks/useRecents'
import { useCollapsedCategories } from '../../hooks/useCollapsedCategories'
import { classesFor } from '../../utils/categoryColor'

/**
 * Persistent route rail, visible on every tool page (desktop only).
 * Mobile users get the same content via the TopNav hamburger drawer.
 */
export function Sidebar() {
  const { t } = useTranslation()
  const favs = useFavorites()
  const recents = useRecents()
  const collapsed = useCollapsedCategories()

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
      .slice(0, 4),
    [recents.list, allTools],
  )

  return (
    <aside className="hidden md:flex w-60 shrink-0 sidebar-border bg-base-100/50 backdrop-blur-xl sticky top-14 self-start h-[calc(100vh-3.5rem)] flex-col">
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-outer">
        <NavItem item={HOME_ITEM} />

        {favNavItems.length > 0 && (
          <Section
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
            {favNavItems.map((item) => <NavItem key={item.path} item={item} />)}
          </Section>
        )}

        {recentNavItems.length > 0 && (
          <Section
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
            {recentNavItems.map((item) => <NavItem key={item.path} item={item} />)}
          </Section>
        )}

        {(favNavItems.length > 0 || recentNavItems.length > 0) && (
          <div className="mx-3 my-3 h-px bg-gradient-to-r from-transparent via-base-content/10 to-transparent" />
        )}

        {NAV_CATEGORIES.map((category) => {
          const isCollapsed = collapsed.isCollapsed(category.key)
          const c = classesFor(category.color)
          return (
            <Section
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
              {category.items.map((item) => <NavItem key={item.path} item={item} />)}
            </Section>
          )
        })}
      </nav>
    </aside>
  )
}

interface SectionProps {
  sectionKey: string
  isCollapsed: boolean
  onToggle: () => void
  eyebrow: React.ReactNode
  children: React.ReactNode
}

function Section({ sectionKey, isCollapsed, onToggle, eyebrow, children }: SectionProps) {
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
