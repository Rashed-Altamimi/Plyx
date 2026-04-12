import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { CopyButton } from '../../components/ui/CopyButton'
import { MIME_TYPES } from '../../data/mimeTypes'

export function MimeTypes() {
  const { t } = useTranslation()
  useDocumentTitle(t('mime.title'))
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return MIME_TYPES
    const q = query.toLowerCase().replace(/^\./, '')
    return MIME_TYPES.filter(
      (m) =>
        m.extension.toLowerCase().includes(q) ||
        m.mimeType.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('mime.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('mime.subtitle')}</p>

      <Card className="mb-4">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('mime.search')} />
      </Card>

      <div className="space-y-2">
        {filtered.map((m, i) => (
          <Card key={i} className="flex items-center gap-4 py-3">
            <div className="font-mono text-sm font-semibold text-primary w-20 shrink-0">{m.extension}</div>
            <div className="flex-1 min-w-0">
              <code className="text-xs font-mono text-base-content break-all">{m.mimeType}</code>
              <p className="text-xs text-base-content/50 mt-0.5">{m.description}</p>
            </div>
            <CopyButton text={m.mimeType} />
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><p className="text-sm text-base-content/40 text-center py-4">No matches</p></Card>
        )}
      </div>
    </div>
  )
}
