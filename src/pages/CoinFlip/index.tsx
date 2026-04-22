import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
  const reduce = useReducedMotion()
  const [result, setResult] = useState<'heads' | 'tails' | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [stats, setStats] = useState({ heads: 0, tails: 0 })
  const [spinId, setSpinId] = useState(0)

  const flip = () => {
    setFlipping(true)
    setSpinId((n) => n + 1)
    window.setTimeout(() => {
      const r = secureFlip()
      setResult(r)
      setStats((s) => ({ ...s, [r]: s[r] + 1 }))
      setFlipping(false)
    }, reduce ? 100 : 900)
  }

  const reset = () => {
    setStats({ heads: 0, tails: 0 })
    setResult(null)
  }

  const coinBg =
    result === 'heads' ? 'bg-yellow-400 text-yellow-900'
    : result === 'tails' ? 'bg-amber-600 text-amber-100'
    : 'bg-base-300 text-base-content/40'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('coinFlip.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('coinFlip.subtitle')}</p>

      <Card className="flex flex-col items-center gap-6 py-12">
        <div className="[perspective:800px]">
          <motion.div
            key={spinId}
            animate={reduce ? {} : { rotateY: flipping ? 1440 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg transition-colors duration-300 ${coinBg}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {flipping ? '?' : result === 'heads' ? 'H' : result === 'tails' ? 'T' : '?'}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {result && !flipping && (
            <motion.p
              key={result}
              className="text-2xl font-bold text-base-content"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            >
              {result === 'heads' ? t('coinFlip.heads') : t('coinFlip.tails')}
            </motion.p>
          )}
        </AnimatePresence>

        <Button onClick={flip} disabled={flipping} className="px-8">
          {flipping ? t('coinFlip.flipping') : t('coinFlip.flip')}
        </Button>
      </Card>

      {(stats.heads > 0 || stats.tails > 0) && (
        <Card className="mt-4 flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-base-content/50">{t('coinFlip.heads')}</p>
              <p className="text-xl font-semibold text-base-content tabular-nums">{stats.heads}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/50">{t('coinFlip.tails')}</p>
              <p className="text-xl font-semibold text-base-content tabular-nums">{stats.tails}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>{t('coinFlip.reset')}</Button>
        </Card>
      )}
    </div>
  )
}
