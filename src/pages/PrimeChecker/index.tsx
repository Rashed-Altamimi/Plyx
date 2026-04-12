import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { isPrime, primeFactors, formatFactors } from '../../utils/prime'

export function PrimeChecker() {
  const { t } = useTranslation()
  useDocumentTitle(t('prime.title'))
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ n: number; prime: boolean; factors: number[] } | null>(null)
  const [error, setError] = useState('')

  const check = () => {
    setError('')
    const n = parseInt(input, 10)
    if (isNaN(n) || n < 2) {
      setError('Enter an integer ≥ 2')
      setResult(null)
      return
    }
    if (n > Number.MAX_SAFE_INTEGER) {
      setError(t('prime.tooLarge'))
      setResult(null)
      return
    }
    const prime = isPrime(n)
    const factors = prime ? [n] : primeFactors(n)
    setResult({ n, prime, factors })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('prime.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('prime.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Input
          label={t('prime.number')}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="42"
          min="2"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button onClick={check} className="w-full">{t('prime.check')}</Button>
      </Card>

      {result && (
        <Card className="space-y-4">
          <div className="text-center">
            <Badge color={result.prime ? 'green' : 'orange'}>
              {result.prime ? t('prime.isPrime', { n: result.n }) : t('prime.notPrime', { n: result.n })}
            </Badge>
          </div>
          {!result.prime && (
            <div>
              <p className="text-sm font-medium text-base-content/70 mb-2">{t('prime.factors')}</p>
              <div className="bg-base-200 rounded-lg p-4 text-center">
                <code className="text-xl font-mono text-base-content">{formatFactors(result.factors)}</code>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
