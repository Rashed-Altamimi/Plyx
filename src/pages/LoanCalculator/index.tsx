import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Slider } from '../../components/ui/Slider'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function LoanCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('loan.title'))
  const [principal, setPrincipal] = useState('100000')
  const [rate, setRate] = useState('5')
  const [years, setYears] = useState(30)

  const result = useMemo(() => {
    const p = parseFloat(principal)
    const r = parseFloat(rate) / 100 / 12
    const n = years * 12
    if (!p || !r || !n || p <= 0) return null

    const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPaid = monthly * n
    const totalInterest = totalPaid - p

    return { monthly, totalPaid, totalInterest, n }
  }, [principal, rate, years])

  const interestPct = result ? (result.totalInterest / result.totalPaid) * 100 : 0
  const principalPct = 100 - interestPct

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('loan.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('loan.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input label={t('loan.amount')} type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} min="0" />
        <Input label={t('loan.rate')} type="number" value={rate} onChange={(e) => setRate(e.target.value)} min="0" step="0.1" />
        <Slider label={t('loan.term')} min={1} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} />
      </Card>

      {result && (
        <>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-5 mb-4 text-center">
            <p className="text-xs text-primary/60 mb-1 font-medium">{t('loan.monthly')}</p>
            <p className="text-4xl font-bold text-primary">${fmt(result.monthly)}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="text-center py-3">
              <p className="text-lg font-semibold text-base-content">${fmt(result.totalPaid)}</p>
              <p className="text-xs text-base-content/50 mt-1">{t('loan.totalPaid')}</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-lg font-semibold text-base-content">${fmt(result.totalInterest)}</p>
              <p className="text-xs text-base-content/50 mt-1">{t('loan.totalInterest')}</p>
            </Card>
            <Card className="text-center py-3">
              <p className="text-lg font-semibold text-base-content">{result.n}</p>
              <p className="text-xs text-base-content/50 mt-1">{t('loan.payments')}</p>
            </Card>
          </div>

          {/* Visual breakdown bar */}
          <Card>
            <p className="text-sm font-medium text-base-content/70 mb-3">{t('loan.breakdown')}</p>
            <div className="flex h-4 rounded-full overflow-hidden mb-3">
              <div className="bg-primary/100" style={{ width: `${principalPct}%` }} />
              <div className="bg-orange-400" style={{ width: `${interestPct}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/100 inline-block" />
                {t('loan.principal')} ({principalPct.toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                {t('loan.interest')} ({interestPct.toFixed(1)}%)
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
