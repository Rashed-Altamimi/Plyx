import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { useState } from 'react'

interface StatCard {
  label: string
  value: number | string
}

export function WordCounter() {
  const { t } = useTranslation()
  useDocumentTitle(t('wordCount.title'))
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
    const readingTime = Math.max(1, Math.ceil(words / 200))
    const lines = text === '' ? 0 : text.split('\n').length

    return [
      { label: t('wordCount.words'),         value: words.toLocaleString() },
      { label: t('wordCount.characters'),    value: chars.toLocaleString() },
      { label: t('wordCount.charsNoSpaces'), value: charsNoSpaces.toLocaleString() },
      { label: t('wordCount.sentences'),     value: sentences.toLocaleString() },
      { label: t('wordCount.paragraphs'),    value: paragraphs.toLocaleString() },
      { label: t('wordCount.lines'),         value: lines.toLocaleString() },
      { label: t('wordCount.readingTime'),   value: t('wordCount.readingTimeValue', { min: readingTime }) },
    ] as StatCard[]
  }, [text, t])

  // Top 5 most frequent words
  const topWords = useMemo(() => {
    if (!text.trim()) return []
    const freq: Record<string, number> = {}
    text.toLowerCase().match(/\b[a-z]{2,}\b/g)?.forEach((w) => { freq[w] = (freq[w] ?? 0) + 1 })
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [text])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('wordCount.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('wordCount.subtitle')}</p>

      <Card className="mb-4">
        <Textarea
          label={t('wordCount.text')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('wordCount.placeholder')}
          rows={8}
        />
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(({ label, value }) => (
          <Card key={label} className="text-center py-4">
            <p className="text-2xl font-semibold text-base-content">{value}</p>
            <p className="text-xs text-base-content/50 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {topWords.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-base-content/70 mb-3">{t('wordCount.mostFrequent')}</p>
          <div className="space-y-2">
            {topWords.map(([word, count]) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-sm font-mono text-base-content/70 w-32">{word}</span>
                <div className="flex-1 h-2 bg-base-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${(count / topWords[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-base-content/50 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
