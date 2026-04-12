import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

function secureFlip(): 'heads' | 'tails' {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]
  return n % 2 === 0 ? 'heads' : 'tails'
}

export function CoinFlip() {
  const { t } = useTranslation()
  useDocumentTitle(t('coinFlip.title'))
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [stats, setStats] = useState({ heads: 0, tails: 0 })

  const flip = () => {
    setFlipping(true)
    setTimeout(() => {
      const r = secureFlip()
      setResult(r)
      setStats((s) => ({ ...s, [r]: s[r] + 1 }))
      setFlipping(false)
    }, 700)
  }

  const reset = () => {
    setStats({ heads: 0, tails: 0 })
    setResult(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('coinFlip.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('coinFlip.subtitle')}</p>

      <Card className="flex flex-col items-center gap-6 py-12">
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg transition-all duration-700 ${
            flipping ? 'animate-spin' : ''
          } ${result === 'heads' ? 'bg-yellow-400 text-yellow-900' : result === 'tails' ? 'bg-amber-600 text-amber-100' : 'bg-base-300 text-base-content/40'}`}
        >
          {flipping ? '?' : result === 'heads' ? 'H' : result === 'tails' ? 'T' : '?'}
        </div>

        {result && !flipping && (
          <p className="text-2xl font-bold text-base-content">
            {result === 'heads' ? t('coinFlip.heads') : t('coinFlip.tails')}
          </p>
        )}

        <Button onClick={flip} disabled={flipping} className="px-8">
          {flipping ? t('coinFlip.flipping') : t('coinFlip.flip')}
        </Button>
      </Card>

      {(stats.heads > 0 || stats.tails > 0) && (
        <Card className="mt-4 flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-base-content/50">{t('coinFlip.heads')}</p>
              <p className="text-xl font-semibold text-base-content">{stats.heads}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/50">{t('coinFlip.tails')}</p>
              <p className="text-xl font-semibold text-base-content">{stats.tails}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>{t('coinFlip.reset')}</Button>
        </Card>
      )}
    </div>
  )
}
