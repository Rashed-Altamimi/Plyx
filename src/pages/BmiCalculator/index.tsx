import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'

interface BmiResult {
  bmi: number
  category: string
  color: string
}

export function BmiCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('bmi.title'))

  function getBmiResult(bmi: number): BmiResult {
    if (bmi < 18.5) return { bmi, category: t('bmi.underweight'), color: 'text-primary' }
    if (bmi < 25)   return { bmi, category: t('bmi.normal'),      color: 'text-green-600' }
    if (bmi < 30)   return { bmi, category: t('bmi.overweight'),  color: 'text-orange-500' }
    return { bmi, category: t('bmi.obese'), color: 'text-red-600' }
  }

  const TABS = [
    { id: 'metric',   label: t('bmi.metric') },
    { id: 'imperial', label: t('bmi.imperial') },
  ]

  const RANGES = [
    { label: t('bmi.underweight'), range: '< 18.5',      color: 'bg-blue-400',   pos: 0,    width: 18.5 },
    { label: t('bmi.normal'),      range: '18.5 – 24.9', color: 'bg-green-500',  pos: 18.5, width: 6.5 },
    { label: t('bmi.overweight'),  range: '25 – 29.9',   color: 'bg-orange-400', pos: 25,   width: 5 },
    { label: t('bmi.obese'),       range: '≥ 30',        color: 'bg-red-500',    pos: 30,   width: 10 },
  ]

  const [unit, setUnit] = useState('metric')

  // Metric
  const [heightCm, setHeightCm] = useState('170')
  const [weightKg, setWeightKg] = useState('70')

  // Imperial
  const [heightFt, setHeightFt] = useState('5')
  const [heightIn, setHeightIn] = useState('7')
  const [weightLbs, setWeightLbs] = useState('154')

  const result = useMemo((): BmiResult | null => {
    if (unit === 'metric') {
      const h = parseFloat(heightCm) / 100
      const w = parseFloat(weightKg)
      if (!h || !w || h <= 0 || w <= 0) return null
      return getBmiResult(w / (h * h))
    } else {
      const ft = parseFloat(heightFt) || 0
      const inches = (ft * 12) + (parseFloat(heightIn) || 0)
      const w = parseFloat(weightLbs)
      if (!inches || !w || inches <= 0 || w <= 0) return null
      return getBmiResult((w / (inches * inches)) * 703)
    }
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLbs])

  const markerPos = result ? Math.min(Math.max((result.bmi / 40) * 100, 0), 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('bmi.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('bmi.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Tabs tabs={TABS} active={unit} onChange={setUnit} />

        {unit === 'metric' ? (
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('bmi.heightCm')} type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min="0" />
            <Input label={t('bmi.weightKg')} type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min="0" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Input label={t('bmi.heightFt')} type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} min="0" />
            <Input label={t('bmi.heightIn')} type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} min="0" />
            <Input label={t('bmi.weightLbs')} type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} min="0" />
          </div>
        )}
      </Card>

      {result && (
        <>
          <div className="rounded-xl border border-base-200 bg-base-100 p-5 mb-4 text-center shadow-sm">
            <p className="text-xs text-base-content/40 mb-1 font-medium">{t('bmi.yourBmi')}</p>
            <p className="text-4xl font-bold text-base-content">{result.bmi.toFixed(1)}</p>
            <p className={`text-sm font-semibold mt-1 ${result.color}`}>{result.category}</p>
          </div>

          <Card>
            <div className="relative h-5 rounded-full overflow-hidden flex mb-4">
              {RANGES.map((r) => (
                <div key={r.label} className={`${r.color} h-full`} style={{ width: `${(r.width / 40) * 100}%` }} />
              ))}
              <div
                className="absolute top-0 w-0.5 h-full bg-neutral-900 border border-white"
                style={{ left: `${markerPos}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {RANGES.map((r) => (
                <div key={r.label}>
                  <div className={`w-3 h-3 rounded-full ${r.color} mx-auto mb-1`} />
                  <p className="text-xs font-medium text-base-content/70">{r.label}</p>
                  <p className="text-xs text-base-content/40">{r.range}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
