import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  differenceInBusinessDays,
  differenceInHours,
  differenceInMinutes,
  isValid,
} from 'date-fns'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function DateDiff() {
  const { t } = useTranslation()
  useDocumentTitle(t('dateDiff.title'))
  const today = new Date().toISOString().slice(0, 10)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)

  const result = useMemo(() => {
    const s = new Date(start)
    const e = new Date(end)
    if (!isValid(s) || !isValid(e)) return null
    return {
      years: differenceInYears(e, s),
      months: differenceInMonths(e, s),
      weeks: differenceInWeeks(e, s),
      days: differenceInDays(e, s),
      business: differenceInBusinessDays(e, s),
      hours: differenceInHours(e, s),
      minutes: differenceInMinutes(e, s),
    }
  }, [start, end])

  const setToday = (setter: (v: string) => void) => setter(new Date().toISOString().slice(0, 10))

  const stats = result
    ? [
        { label: t('dateDiff.years'), value: result.years },
        { label: t('dateDiff.months'), value: result.months },
        { label: t('dateDiff.weeks'), value: result.weeks },
        { label: t('dateDiff.days'), value: result.days },
        { label: t('dateDiff.businessDays'), value: result.business },
        { label: t('dateDiff.totalHours'), value: result.hours.toLocaleString() },
        { label: t('dateDiff.totalMinutes'), value: result.minutes.toLocaleString() },
      ]
    : []

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('dateDiff.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('dateDiff.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div>
          <Input label={t('dateDiff.startDate')} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setToday(setStart)}>{t('dateDiff.today')}</Button>
        </div>
        <div>
          <Input label={t('dateDiff.endDate')} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setToday(setEnd)}>{t('dateDiff.today')}</Button>
        </div>
      </Card>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(({ label, value }) => (
            <Card key={label} className="text-center py-4">
              <p className="text-2xl font-semibold text-base-content">{value}</p>
              <p className="text-xs text-base-content/50 mt-1">{label}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
