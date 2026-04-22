import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { diffWords } from 'diff'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'

export function TextDiff() {
  const { t } = useTranslation()
  useDocumentTitle(t('diff.title'))
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [compared, setCompared] = useState(false)

  const diffs = useMemo(() => {
    if (!compared) return []
    return diffWords(left, right)
  }, [left, right, compared])

  const stats = useMemo(() => {
    const added   = diffs.filter((d) => d.added).reduce((acc, d) => acc + d.count!, 0)
    const removed = diffs.filter((d) => d.removed).reduce((acc, d) => acc + d.count!, 0)
    return { added, removed }
  }, [diffs])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('diff.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('diff.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <Textarea label={t('diff.original')} value={left} onChange={(e) => { setLeft(e.target.value); setCompared(false) }} rows={10} placeholder="Original text…" />
        </Card>
        <Card>
          <Textarea label={t('diff.modified')} value={right} onChange={(e) => { setRight(e.target.value); setCompared(false) }} rows={10} placeholder="Modified text…" />
        </Card>
      </div>

      <Button onClick={() => setCompared(true)} className="w-full mb-6">{t('diff.compare')}</Button>

      {compared && diffs.length > 0 && (
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-sm font-medium text-base-content/70">{t('diff.diffResult')}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">{t('diff.added', { count: stats.added })}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">{t('diff.removed', { count: stats.removed })}</span>
          </div>
          <div className="font-mono mono-prose text-sm leading-7 whitespace-pre-wrap break-all bg-base-200 rounded-lg p-4">
            {diffs.map((part, i) => (
              <span
                key={i}
                className={
                  part.added   ? 'bg-green-100 text-green-800' :
                  part.removed ? 'bg-red-100 text-red-800 line-through' :
                  'text-base-content/70'
                }
              >
                {part.value}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
