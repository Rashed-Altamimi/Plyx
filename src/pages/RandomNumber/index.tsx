import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'
import { Checkbox } from '../../components/ui/Checkbox'
import { CopyButton } from '../../components/ui/CopyButton'
import { useClipboard } from '../../hooks/useClipboard'

function secureRandom(min: number, max: number): number {
  const range = max - min + 1
  const bytes = crypto.getRandomValues(new Uint32Array(1))
  return min + (bytes[0] % range)
}

export function RandomNumber() {
  const { t } = useTranslation()
  useDocumentTitle(t('random.title'))
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState(1)
  const [unique, setUnique] = useState(false)
  const [results, setResults] = useState<number[]>([])
  const [error, setError] = useState('')
  const { copied, copy } = useClipboard()

  const generate = useCallback(() => {
    setError('')
    const lo = parseInt(min), hi = parseInt(max)
    if (isNaN(lo) || isNaN(hi)) { setError(t('random.enterValid')); return }
    if (lo >= hi) { setError(t('random.minLessMax')); return }
    if (unique && count > hi - lo + 1) { setError(t('random.cantGenerate', { count, min: lo, max: hi })); return }

    if (unique) {
      const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
      const picked: number[] = []
      for (let i = 0; i < count; i++) {
        const idx = secureRandom(0, pool.length - 1 - i)
        ;[pool[idx], pool[pool.length - 1 - i]] = [pool[pool.length - 1 - i], pool[idx]]
        picked.push(pool[pool.length - 1 - i])
      }
      setResults(picked)
    } else {
      setResults(Array.from({ length: count }, () => secureRandom(lo, hi)))
    }
  }, [min, max, count, unique])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('random.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('random.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('random.min')} value={min} onChange={(e) => setMin(e.target.value)} type="number" />
          <Input label={t('random.max')} value={max} onChange={(e) => setMax(e.target.value)} type="number" />
        </div>
        <Slider label={t('random.count')} min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <Checkbox label={t('random.unique')} checked={unique} onChange={(e) => setUnique(e.target.checked)} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button onClick={generate} className="w-full">
          <RefreshCw size={14} /> {t('common.generate')}
        </Button>
      </Card>

      {results.length > 0 && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70">{t('random.numbers', { count: results.length })}</p>
            <div className="flex gap-2">
              <CopyButton text={results.join(', ')} />
              <Button variant="ghost" size="sm" onClick={() => copy(results.join('\n'))}>
                {copied ? t('common.copied') : t('random.copyLines')}
              </Button>
            </div>
          </div>
          {results.length === 1 ? (
            <p className="text-5xl font-bold text-base-content text-center py-4">{results[0]}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {results.map((n, i) => (
                <span key={i} className="bg-base-300 text-base-content font-mono text-sm px-3 py-1 rounded-lg">{n}</span>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
