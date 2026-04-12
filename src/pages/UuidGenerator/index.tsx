import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Trash2 } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import { Slider } from '../../components/ui/Slider'
import { useClipboard } from '../../hooks/useClipboard'

function uuidV4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'))
  return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10).join('')}`
}

export function UuidGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('uuid.title'))
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, uuidV4))
  const { copied, copy } = useClipboard()

  const generate = useCallback(() => {
    setUuids(Array.from({ length: count }, uuidV4))
  }, [count])

  const copyAll = () => copy(uuids.join('\n'))

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('uuid.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('uuid.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Slider label={t('uuid.count')} min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <div className="flex gap-2">
          <Button onClick={generate} className="flex-1">
            <RefreshCw size={14} /> {t('common.generate')}
          </Button>
          <Button variant="outline" onClick={copyAll}>
            {copied ? t('common.copied') : t('uuid.copyAll')}
          </Button>
          <Button variant="ghost" onClick={() => setUuids([])} title="Clear">
            <Trash2 size={14} />
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {uuids.map((id, i) => (
          <div key={i} className="flex items-center gap-3 bg-base-100 border border-base-200 rounded-lg px-4 py-2.5 shadow-sm">
            <code className="flex-1 font-mono text-sm text-base-content">{id}</code>
            <CopyButton text={id} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
