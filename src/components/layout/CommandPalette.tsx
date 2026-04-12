import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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

  // Focus input when opened, reset query when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setActive(0)
    }
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

  if (!open) return null

  let runningIndex = -1

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-200">
          <Search size={18} className="text-base-content/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('palette.searchPlaceholder')}
            className="flex-1 bg-transparent text-base text-base-content placeholder-base-content/40 outline-none"
          />
          <kbd className="hidden sm:inline-block text-xs font-mono text-base-content/40 bg-base-200 px-2 py-0.5 rounded border border-base-300">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden p-1 rounded hover:bg-base-200 text-base-content/60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatItems.length === 0 ? (
            <p className="text-sm text-base-content/40 text-center py-8">{t('palette.noResults')}</p>
          ) : (
            sections.map((section) => {
              if (section.items.length === 0) return null
              const SectionIcon = section.icon
              return (
                <div key={section.key} className="mb-2">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <SectionIcon size={11} className="text-base-content/40" />
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">
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
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left cursor-pointer transition-colors ${
                          isActive ? 'bg-primary/15' : 'hover:bg-base-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/60'
                        }`}>
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-base-content'}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-base-content/50 truncate">{item.description}</p>
                        </div>
                        <span className="text-xs text-base-content/40 shrink-0 hidden sm:inline">{item.category}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer with shortcut hints */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-base-200 bg-base-200/50 text-xs text-base-content/50">
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">↑↓</kbd>
            {t('palette.navigate')}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">↵</kbd>
            {t('palette.open')}
          </span>
          <span className="flex items-center gap-1.5 ms-auto">
            <kbd className="font-mono bg-base-100 px-1.5 py-0.5 rounded border border-base-300">{flatItems.length}</kbd>
            {t('palette.tools')}
          </span>
        </div>
      </div>
    </div>
  )
}
