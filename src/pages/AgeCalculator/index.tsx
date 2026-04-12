import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

interface AgeResult {
  years: number
  months: number
  days: number
  totalDays: number
  totalWeeks: number
  totalHours: number
  nextBirthday: string
  daysToNextBirthday: number
}

function calculateAge(dob: Date, ref: Date = new Date()): AgeResult {
  let years = ref.getFullYear() - dob.getFullYear()
  let months = ref.getMonth() - dob.getMonth()
  let days = ref.getDate() - dob.getDate()

  if (days < 0) { months--; const prev = new Date(ref.getFullYear(), ref.getMonth(), 0); days += prev.getDate() }
  if (months < 0) { years--; months += 12 }

  const msPerDay = 86400000
  const totalDays = Math.floor((ref.getTime() - dob.getTime()) / msPerDay)

  // Next birthday
  let nextBday = new Date(ref.getFullYear(), dob.getMonth(), dob.getDate())
  if (nextBday <= ref) nextBday = new Date(ref.getFullYear() + 1, dob.getMonth(), dob.getDate())
  const daysToNextBirthday = Math.ceil((nextBday.getTime() - ref.getTime()) / msPerDay)

  return {
    years, months, days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalHours: totalDays * 24,
    nextBirthday: nextBday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    daysToNextBirthday,
  }
}

export function AgeCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('age.title'))
  const [dob, setDob] = useState('')
  const [refDate, setRefDate] = useState('')

  const result = useMemo((): AgeResult | null => {
    if (!dob) return null
    const d = new Date(dob)
    if (isNaN(d.getTime())) return null
    const r = refDate ? new Date(refDate) : new Date()
    if (isNaN(r.getTime()) || d >= r) return null
    return calculateAge(d, r)
  }, [dob, refDate])

  const stats = result ? [
    { label: t('age.years'),      value: result.years },
    { label: t('age.months'),     value: result.months },
    { label: t('age.days'),       value: result.days },
    { label: t('age.totalDays'),  value: result.totalDays.toLocaleString() },
    { label: t('age.totalWeeks'), value: result.totalWeeks.toLocaleString() },
    { label: t('age.totalHours'), value: result.totalHours.toLocaleString() },
  ] : []

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('age.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('age.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input label={t('age.dob')} type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
        <div>
          <Input label={t('age.asOfDate')} type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} />
          {refDate && <Button variant="ghost" size="sm" className="mt-1" onClick={() => setRefDate('')}>{t('age.useToday')}</Button>}
        </div>
      </Card>

      {result && (
        <>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-5 mb-4 text-center">
            <p className="text-xs text-primary/60 mb-1 font-medium">{t('age.ageLabel')}</p>
            <p className="text-3xl font-bold text-primary">
              {t('age.ageValue', { years: result.years, months: result.months, days: result.days })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {stats.map(({ label, value }) => (
              <Card key={label} className="text-center py-4">
                <p className="text-xl font-semibold text-base-content">{value}</p>
                <p className="text-xs text-base-content/50 mt-1">{label}</p>
              </Card>
            ))}
          </div>

          <Card className="text-center">
            <p className="text-xs text-base-content/40 mb-1">{t('age.nextBirthday')}</p>
            <p className="text-base font-semibold text-base-content">{result.nextBirthday}</p>
            <p className="text-sm text-base-content/50 mt-1">{t('age.inDays', { days: result.daysToNextBirthday })}</p>
          </Card>
        </>
      )}
    </div>
  )
}
