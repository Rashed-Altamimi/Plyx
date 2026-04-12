import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { HTTP_STATUS_CODES, type HttpStatusEntry } from '../../data/httpStatus'

function categoryColor(cat: HttpStatusEntry['category']): 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' {
  switch (cat) {
    case '1xx': return 'blue'
    case '2xx': return 'green'
    case '3xx': return 'yellow'
    case '4xx': return 'orange'
    case '5xx': return 'red'
  }
}

export function HttpStatus() {
  const { t } = useTranslation()
  useDocumentTitle(t('httpStatus.title'))
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return HTTP_STATUS_CODES
    const q = query.toLowerCase()
    return HTTP_STATUS_CODES.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('httpStatus.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('httpStatus.subtitle')}</p>

      <Card className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('httpStatus.search')}
        />
      </Card>

      <div className="space-y-2">
        {filtered.map((s) => (
          <Card key={s.code} className="flex items-start gap-4 py-3">
            <div className="text-2xl font-bold font-mono text-base-content w-16 shrink-0 text-center">{s.code}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-base-content">{s.name}</span>
                <Badge color={categoryColor(s.category)}>{s.category}</Badge>
              </div>
              <p className="text-xs text-base-content/60">{s.description}</p>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card><p className="text-sm text-base-content/40 text-center py-4">No matches</p></Card>
        )}
      </div>
    </div>
  )
}
