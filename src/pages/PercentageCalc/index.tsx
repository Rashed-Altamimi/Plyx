import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { CopyButton } from '../../components/ui/CopyButton'

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-3">
      <p className="text-sm text-base-content/60">{label}</p>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base-content">{value}</span>
        <CopyButton text={value} size="sm" />
      </div>
    </div>
  )
}

export function PercentageCalc() {
  const { t } = useTranslation()
  useDocumentTitle(t('percentage.title'))
  const [pct, setPct]   = useState('')
  const [of, setOf]     = useState('')
  const [part, setPart] = useState('')
  const [whole, setWhole] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const fmt = (n: number) => isFinite(n) ? (Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, '')) : '—'

  const r1 = (pct && of) ? fmt((parseFloat(pct) / 100) * parseFloat(of)) : null
  const r2 = (part && whole) ? fmt((parseFloat(part) / parseFloat(whole)) * 100) + '%' : null
  const r3 = (from && to) ? (() => {
    const f = parseFloat(from), t = parseFloat(to)
    const change = ((t - f) / Math.abs(f)) * 100
    return `${change >= 0 ? '+' : ''}${fmt(change)}%`
  })() : null

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('percentage.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('percentage.subtitle')}</p>

      <div className="space-y-4">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-base-content/70">{t('percentage.whatIsXofY')}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Input value={pct} onChange={(e) => setPct(e.target.value)} placeholder="%" type="number" className="w-24" />
            <span className="text-sm text-base-content/50">{t('percentage.ofLabel')}</span>
            <Input value={of} onChange={(e) => setOf(e.target.value)} placeholder="value" type="number" className="w-28" />
          </div>
          {r1 && <ResultRow label={`${pct}% of ${of} =`} value={r1} />}
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold text-base-content/70">{t('percentage.xIsWhatPctOfY')}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Input value={part} onChange={(e) => setPart(e.target.value)} placeholder="part" type="number" className="w-28" />
            <span className="text-sm text-base-content/50">{t('percentage.isWhatPctOf')}</span>
            <Input value={whole} onChange={(e) => setWhole(e.target.value)} placeholder="whole" type="number" className="w-28" />
          </div>
          {r2 && <ResultRow label={`${part} is what % of ${whole} =`} value={r2} />}
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold text-base-content/70">{t('percentage.pctChange')}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-base-content/50">{t('percentage.fromLabel')}</span>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="from" type="number" className="w-28" />
            <span className="text-sm text-base-content/50">{t('percentage.toLabel')}</span>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="to" type="number" className="w-28" />
          </div>
          {r3 && <ResultRow label={`${from} → ${to} =`} value={r3} />}
        </Card>
      </div>
    </div>
  )
}
