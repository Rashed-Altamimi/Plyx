import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Slider } from '../../components/ui/Slider'
import { Checkbox } from '../../components/ui/Checkbox'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TipCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('tip.title'))
  const [bill, setBill] = useState('50')
  const [tipPct, setTipPct] = useState(15)
  const [people, setPeople] = useState('1')
  const [roundUp, setRoundUp] = useState(false)

  const result = useMemo(() => {
    const b = parseFloat(bill)
    const p = Math.max(1, parseInt(people, 10) || 1)
    if (!b || b < 0) return null
    const tipAmount = (b * tipPct) / 100
    const total = b + tipAmount
    let perPerson = total / p
    if (roundUp) perPerson = Math.ceil(perPerson)
    return { tipAmount, total, perPerson, roundedTotal: roundUp ? perPerson * p : total }
  }, [bill, tipPct, people, roundUp])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('tip.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('tip.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input label={t('tip.bill')} type="number" value={bill} onChange={(e) => setBill(e.target.value)} min="0" step="0.01" />
        <Slider label={`${t('tip.tipPct')} (${tipPct}%)`} min={0} max={50} value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))} />
        <Input label={t('tip.people')} type="number" value={people} onChange={(e) => setPeople(e.target.value)} min="1" />
        <Checkbox label={t('tip.roundUp')} checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} />
      </Card>

      {result && (
        <>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-5 mb-4 text-center">
            <p className="text-xs text-primary/60 mb-1 font-medium">{t('tip.perPerson')}</p>
            <p className="text-4xl font-bold text-primary">${fmt(result.perPerson)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-4">
              <p className="text-xl font-semibold text-base-content">${fmt(result.tipAmount)}</p>
              <p className="text-xs text-base-content/50 mt-1">{t('tip.tipAmount')}</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-xl font-semibold text-base-content">${fmt(result.roundedTotal)}</p>
              <p className="text-xs text-base-content/50 mt-1">{t('tip.total')}</p>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
