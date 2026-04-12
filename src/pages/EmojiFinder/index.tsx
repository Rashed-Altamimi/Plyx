import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useClipboard } from '../../hooks/useClipboard'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { EMOJIS, type EmojiCategory } from '../../data/emojis'
import { getCachedStale, setCached } from '../../utils/localStorageCache'

const CATEGORIES: (EmojiCategory | 'all')[] = ['all', 'smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags']
const CATEGORY_I18N: Record<string, string> = {
  all: 'all', smileys: 'smileys', people: 'people', animals: 'animals',
  food: 'food', travel: 'travel', activities: 'activities',
  objects: 'objects', symbols: 'symbols', flags: 'flags',
}
const RECENT_KEY = 'plyx-emoji-recent'

export function EmojiFinder() {
  const { t } = useTranslation()
  useDocumentTitle(t('emoji.title'))
  const { copy, copied } = useClipboard()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EmojiCategory | 'all'>('all')
  const [lastCopied, setLastCopied] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    const cached = getCachedStale<string[]>(RECENT_KEY)
    if (cached?.value) setRecent(cached.value)
  }, [])

  const filtered = useMemo(() => {
    let list = EMOJIS
    if (category !== 'all') list = list.filter((e) => e.category === category)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    return list
  }, [query, category])

  const handleCopy = (emoji: string) => {
    copy(emoji)
    setLastCopied(emoji)
    const next = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 24)
    setRecent(next)
    setCached(RECENT_KEY, next)
  }

  const recentEmojis = useMemo(
    () => recent.map((char) => EMOJIS.find((e) => e.char === char)).filter((e): e is typeof EMOJIS[number] => !!e),
    [recent]
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('emoji.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('emoji.subtitle')}</p>

      <Card className="mb-4">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('emoji.search')} />
      </Card>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              category === cat
                ? 'bg-primary text-primary-content'
                : 'bg-base-200 text-base-content/70 hover:bg-base-300'
            }`}
          >
            {t(`emoji.${CATEGORY_I18N[cat]}`)}
          </button>
        ))}
      </div>

      {recentEmojis.length > 0 && category === 'all' && !query && (
        <Card className="mb-4">
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
            {t('emoji.recentlyUsed')}
          </p>
          <div className="flex flex-wrap gap-2">
            {recentEmojis.map((e) => (
              <button
                key={e.char}
                onClick={() => handleCopy(e.char)}
                className="w-10 h-10 rounded-lg hover:bg-base-200 transition-colors text-2xl cursor-pointer"
                title={e.name}
              >
                {e.char}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        {copied && lastCopied && (
          <div className="mb-3 p-2 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary text-center">
            Copied {lastCopied} to clipboard
          </div>
        )}
        {filtered.length === 0 ? (
          <p className="text-sm text-base-content/40 text-center py-8">{t('emoji.noResults')}</p>
        ) : (
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
            {filtered.map((e) => (
              <button
                key={`${e.char}-${e.name}`}
                onClick={() => handleCopy(e.char)}
                className="w-10 h-10 rounded-lg hover:bg-base-200 transition-colors text-2xl cursor-pointer"
                title={e.name}
              >
                {e.char}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
