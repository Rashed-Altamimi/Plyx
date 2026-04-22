import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Checkbox } from '../../components/ui/Checkbox'
import { compound } from '../../utils/finance'

const FREQ = [
  { value: 12, labelKey: 'compound.freq.monthly' },
  { value: 4,  labelKey: 'compound.freq.quarterly' },
  { value: 2,  labelKey: 'compound.freq.semiannual' },
  { value: 1,  labelKey: 'compound.freq.annual' },
  { value: 365, labelKey: 'compound.freq.daily' },
]

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

export function CompoundInterest() {
  const { t } = useTranslation()
  useDocumentTitle(t('compound.title'))

  const [principal, setPrincipal] = useState('10000')
  const [rate, setRate] = useState('7')
  const [years, setYears] = useState('10')
  const [compoundsPerYear, setCompoundsPerYear] = useState(12)
  const [contribution, setContribution] = useState('200')
  const [atStart, setAtStart] = useState(false)

  const result = useMemo(() => {
    const p = Number(principal) || 0
    const r = Number(rate) || 0
    const y = Number(years) || 0
    const c = Number(contribution) || 0
    return compound({
      principal: p,
      annualRate: r,
      years: y,
      compoundsPerYear,
      contribution: c,
      contributionAtStart: atStart,
    })
  }, [principal, rate, years, compoundsPerYear, contribution, atStart])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('compound.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('compound.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-4">
        <Card className="space-y-3">
          <Input label={t('compound.principal')} type="number" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          <Input label={t('compound.rate')} type="number" inputMode="decimal" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Input label={t('compound.years')} type="number" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
          <Select label={t('compound.frequency')} value={compoundsPerYear} onChange={(e) => setCompoundsPerYear(Number(e.target.value))}>
            {FREQ.map((f) => <option key={f.value} value={f.value}>{t(f.labelKey)}</option>)}
          </Select>
          <Input label={t('compound.contribution')} type="number" inputMode="decimal" value={contribution} onChange={(e) => setContribution(e.target.value)} />
          <Checkbox label={t('compound.contributeAtStart')} checked={atStart} onChange={(e) => setAtStart(e.target.checked)} />
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t('compound.finalBalance')} value={money(result.finalBalance)} accent />
            <Stat label={t('compound.totalContrib')} value={money(result.totalContributions)} />
            <Stat label={t('compound.totalInterest')} value={money(result.totalInterest)} />
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-base-200/80 backdrop-blur text-[10px] uppercase tracking-wider text-base-content/50">
                  <tr>
                    <th className="text-start px-3 py-2 font-semibold">{t('compound.th.year')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('compound.th.contrib')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('compound.th.interest')}</th>
                    <th className="text-end px-3 py-2 font-semibold">{t('compound.th.balance')}</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {result.yearly.map((row) => (
                    <tr key={row.year} className="odd:bg-base-content/[0.02] border-t border-base-content/[0.04]">
                      <td className="px-3 py-1.5 tabular-nums">{row.year}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{money(row.contributions)}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums text-emerald-400">{money(row.interest)}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums font-semibold">{money(row.endBalance)}</td>
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
