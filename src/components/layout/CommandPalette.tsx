import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Search, Star, Clock, ArrowRight, X } from '../../icons'
import { buildToolIndex, filterAndRank, type ToolEntry } from '../../utils/toolSearch'
import { useFavorites } from '../../hooks/useFavorites'
import { useRecents } from '../../hooks/useRecents'

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const favs = useFavorites()
  const recents = useRecents()
  const reduce = useReducedMotion()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const allTools = useMemo(() => buildToolIndex(t), [t])

  // Sectioned list (favorites + recents) OR ranked search results
  type Section = { key: string; label: string; icon: typeof Star; items: ToolEntry[] }

  const sections = useMemo((): Section[] => {
    if (query.trim()) {
      return [{ key: 'results', label: t('palette.results'), icon: Search, items: filterAndRank(allTools, query) }]
    }
    const sect: Section[] = []
    const favItems = favs.list.map((p) => allTools.find((a) => a.path === p)).filter((x): x is ToolEntry => !!x)
    if (favItems.length > 0) sect.push({ key: 'favs', label: t('palette.favorites'), icon: Star, items: favItems })

    const recentItems = recents.list.map((p) => allTools.find((a) => a.path === p)).filter((x): x is ToolEntry => !!x)
    if (recentItems.length > 0) sect.push({ key: 'recent', label: t('palette.recent'), icon: Clock, items: recentItems })

    // Grouped by category for the rest
    const usedPaths = new Set([...favs.list, ...recents.list])
    const rest = allTools.filter((a) => !usedPaths.has(a.path))
    if (rest.length > 0) sect.push({ key: 'all', label: t('palette.allTools'), icon: ArrowRight, items: rest })

    return sect
  }, [query, allTools, favs.list, recents.list, t])

  // Flatten items for keyboard navigation
  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections])

  // Reset active index when query or sections change
  useEffect(() => { setActive(0) }, [query, sections])

  // Focus input when opened; restore focus when closed
  useEffect(() => {
    if (open) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null
      const id = window.setTimeout(() => inputRef.current?.focus(), 50)
      return () => window.clearTimeout(id)
    }
    setQuery('')
    setActive(0)
    const trigger = triggerRef.current
    if (trigger && typeof trigger.focus === 'function') {
      // Defer so any outside click handling finishes first
      window.setTimeout(() => trigger.focus(), 0)
    }
    triggerRef.current = null
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const runItem = useCallback((item: ToolEntry) => {
    navigate(item.path)
    onClose()
  }, [navigate, onClose])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(flatItems.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = flatItems[active]
      if (item) runItem(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  let runningIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('palette.searchPlaceholder')}
            className="relative w-full max-w-xl bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-content/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_0_1px_var(--primary-08)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.9 }}
          >
            {/* subtle accent glow on top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-content/[0.06]">
          <Search size={18} className="text-base-content/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('palette.searchPlaceholder')}
            className="flex-1 bg-transparent text-base text-base-content placeholder-base-content/35 outline-none"
          />
          <kbd className="kbd-hint hidden sm:inline-flex">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden p-1 rounded hover:bg-base-content/5 text-base-content/60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatItems.length === 0 ? (
            <p className="text-sm text-base-content/40 text-center py-10">{t('palette.noResults')}</p>
          ) : (
            sections.map((section) => {
              if (section.items.length === 0) return null
              const SectionIcon = section.icon
              return (
                <div key={section.key} className="mb-1">
                  <div className="flex items-center gap-2 px-5 py-1.5">
                    <SectionIcon size={10} className="text-base-content/40" />
                    <p className="eyebrow">
                      {section.label}
                    </p>
                  </div>
                  {section.items.map((item) => {
                    runningIndex++
                    const idx = runningIndex
                    const isActive = active === idx
                    const Icon = item.icon
                    return (
                      <button
                        key={item.path}
                        data-index={idx}
                        onClick={() => runItem(item)}
                        onMouseEnter={() => setActive(idx)}
                        className={`relative w-full flex items-center gap-3 px-5 py-2 text-left cursor-pointer transition-colors ${
                          isActive ? 'bg-primary/15' : 'hover:bg-base-content/[0.04]'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute start-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary shadow-[0_0_8px_var(--primary-70)]" />
                        )}
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-base-content/5 text-base-content/60'
                        }`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-base-content' : 'text-base-content/80'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-base-content/45 truncate">{item.description}</p>
                        </div>
                        <span className="text-[10px] font-mono text-base-content/35 shrink-0 hidden sm:inline uppercase tracking-wider">{item.category}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer with shortcut hints */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-base-content/[0.06] bg-base-content/[0.02] text-[11px] text-base-content/50">
          <span className="flex items-center gap-1.5">
            <kbd className="kbd-hint">↑↓</kbd>
            {t('palette.navigate')}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="kbd-hint">↵</kbd>
            {t('palette.open')}
          </span>
          <span className="flex items-center gap-1.5 ms-auto">
            <kbd className="kbd-hint tabular-nums">{flatItems.length}</kbd>
            {t('palette.tools')}
          </span>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
