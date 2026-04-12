import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import cronstrue from 'cronstrue'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const EXAMPLES = [
  { expr: '* * * * *',       label: 'Every minute' },
  { expr: '0 * * * *',       label: 'Every hour' },
  { expr: '0 0 * * *',       label: 'Every day at midnight' },
  { expr: '0 9 * * 1-5',     label: 'Weekdays at 9 AM' },
  { expr: '0 0 1 * *',       label: 'First of every month' },
  { expr: '*/15 * * * *',    label: 'Every 15 minutes' },
  { expr: '0 0 * * 0',       label: 'Every Sunday midnight' },
  { expr: '30 6 * * 1,3,5',  label: 'Mon/Wed/Fri at 6:30 AM' },
]

function getNextRuns(expr: string, count = 5): string[] {
  // Simple next-run approximation using a manual approach
  // We show next occurrences at fixed intervals for illustrative purposes
  try {
    const now = new Date()
    const parts = expr.trim().split(/\s+/)
    if (parts.length < 5) return []
    const [minuteP, hourP] = parts

    const runs: string[] = []
    const d = new Date(now)
    d.setSeconds(0, 0)
    d.setMinutes(d.getMinutes() + 1)

    let attempts = 0
    while (runs.length < count && attempts < 10000) {
      attempts++
      const matches =
        matchCronField(minuteP, d.getMinutes(), 0, 59) &&
        matchCronField(hourP,   d.getHours(),   0, 23)

      if (matches) {
        runs.push(d.toLocaleString())
      }
      d.setMinutes(d.getMinutes() + 1)
    }
    return runs
  } catch { return [] }
}

function matchCronField(field: string, value: number, min: number, _max: number): boolean {
  if (field === '*') return true
  for (const part of field.split(',')) {
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2))
      if ((value - min) % step === 0) return true
    } else if (part.includes('-')) {
      const [lo, hi] = part.split('-').map(Number)
      if (value >= lo && value <= hi) return true
    } else {
      if (parseInt(part) === value) return true
    }
  }
  return false
}

export function CronParser() {
  const { t } = useTranslation()
  useDocumentTitle(t('cron.title'))
  const [expr, setExpr] = useState('0 9 * * 1-5')

  const LABELS = [t('cron.minute'), t('cron.hour'), t('cron.dayMonth'), t('cron.monthLabel'), t('cron.dayWeek')]

  const { description, error } = useMemo(() => {
    try {
      return { description: cronstrue.toString(expr), error: '' }
    } catch (e) {
      return { description: '', error: (e as Error).message }
    }
  }, [expr])

  const nextRuns = useMemo(() => getNextRuns(expr), [expr])
  const parts = expr.trim().split(/\s+/)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('cron.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('cron.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input
          label={t('cron.expression')}
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="font-mono text-lg"
          placeholder="* * * * *"
        />

        {parts.length >= 5 && (
          <div className="grid grid-cols-5 gap-2 text-center">
            {LABELS.map((label, i) => (
              <div key={label} className="bg-base-200 rounded-lg p-2">
                <p className="text-base font-mono font-bold text-primary">{parts[i] ?? '*'}</p>
                <p className="text-xs text-base-content/50 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {description && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
            <p className="text-xs text-primary/60 mb-1 font-medium">{t('cron.meaning')}</p>
            <p className="text-sm font-medium text-primary">{description}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nextRuns.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-base-content/70 mb-3">{t('cron.nextRuns')}</p>
            <div className="space-y-1.5">
              {nextRuns.map((r, i) => (
                <div key={i} className="text-xs font-mono text-base-content/70 bg-base-200 rounded px-3 py-1.5">
                  {r}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <p className="text-sm font-medium text-base-content/70 mb-3">{t('cron.examples')}</p>
          <div className="space-y-1">
            {EXAMPLES.map(({ expr: e, label }) => (
              <Button key={e} variant="ghost" size="sm" onClick={() => setExpr(e)} className="w-full justify-start font-mono text-xs">
                <span className="text-primary w-36 shrink-0">{e}</span>
                <span className="text-base-content/50">{label}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
