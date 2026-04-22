import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { mortgage } from '../../utils/finance'

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export function Mortgage() {
  const { t } = useTranslation()
  useDocumentTitle(t('mortgage.title'))

  const [principal, setPrincipal] = useState('300000')
  const [rate, setRate] = useState('6.5')
  const [years, setYears] = useState('30')
  const [extra, setExtra] = useState('0')

  const result = useMemo(() => {
    const p = Number(principal) || 0
    const r = Number(rate) || 0
    const y = Number(years) || 0
    const e = Number(extra) || 0
    return mortgage({ principal: p, annualRate: r, termYears: y, extraMonthly: e })
  }, [principal, rate, years, extra])

  const yearsActual = result.months / 12
  const monthsSaved = (Number(years) || 0) * 12 - result.months

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('mortgage.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('mortgage.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4">
        <Card className="space-y-3">
          <Input label={t('mortgage.principal')} type="number" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          <Input label={t('mortgage.rate')} type="number" inputMode="decimal" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Input label={t('mortgage.term')} type="number" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
          <Input label={t('mortgage.extra')} type="number" inputMode="decimal" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t('mortgage.monthlyPayment')} value={money(result.monthlyPayment)} accent />
            <Stat label={t('mortgage.totalPaid')} value={money(result.totalPaid)} />
            <Stat label={t('mortgage.totalInterest')} value={money(result.totalInterest)} />
          </div>
          {monthsSaved > 0 && (
            <Card>
              <p className="text-sm text-base-content/70">
                {t('mortgage.paidOffIn', { years: yearsActual.toFixed(1) })}
                {' · '}
                <span className="text-emerald-400 font-medium">{t('mortgage.monthsSaved', { months: monthsSaved })}</span>
              </p>
            </Card>
          )}

          <Card className="p-0 overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-base-200/80 backdrop-blur text-[10px] uppercase tracking-wider text-base-content/50">
                  <tr>
                    <th className="text-start px-3 py-2 font-semibold">{t('mortgage.th.month')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('mortgage.th.principal')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('mortgage.th.interest')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('mortgage.th.balance')}</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="odd:bg-base-content/[0.02] border-t border-base-content/[0.04]">
                      <td className="px-3 py-1.5 tabular-nums">{row.month}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{money(row.principal + row.extra)}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums text-orange-400">{money(row.interest)}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums font-semibold">{money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-base-content/10 bg-base-200/40 p-3">
      <p className="text-[10px] uppercase tracking-wider text-base-content/50 mb-1">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${accent ? 'bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent' : 'text-base-content'}`}>
        {value}
      </p>
    </div>
  )
}
