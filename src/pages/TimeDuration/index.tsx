import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'

function parseTime(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const s = m[3] ? parseInt(m[3], 10) : 0
  if (h > 23 || min > 59 || s > 59) return null
  return h * 3600 + min * 60 + s
}

function formatDuration(seconds: number): string {
  const abs = Math.abs(seconds)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const sign = seconds < 0 ? '-' : ''
  return `${sign}${h}h ${m}m ${s}s`
}

function formatTime(seconds: number): string {
  const total = ((seconds % 86400) + 86400) % 86400
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimeDuration() {
  const { t } = useTranslation()
  useDocumentTitle(t('duration.title'))
  const [mode, setMode] = useState('between')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:30')
  const [baseTime, setBaseTime] = useState('12:00')
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('30')
  const [seconds, setSeconds] = useState('0')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')

  const TABS = [
    { id: 'between', label: t('duration.between') },
    { id: 'addSubtract', label: t('duration.addSubtract') },
  ]

  const betweenResult = useMemo(() => {
    const s = parseTime(startTime)
    const e = parseTime(endTime)
    if (s === null || e === null) return null
    return formatDuration(e - s)
  }, [startTime, endTime])

  const addSubtractResult = useMemo(() => {
    const base = parseTime(baseTime)
    if (base === null) return null
    const offset = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    const sign = operation === 'add' ? 1 : -1
    return formatTime(base + sign * offset)
  }, [baseTime, hours, minutes, seconds, operation])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('duration.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('duration.subtitle')}</p>

      <Tabs tabs={TABS} active={mode} onChange={setMode} className="mb-6" />

      {mode === 'between' && (
        <Card className="space-y-4">
          <Input label={t('duration.startTime')} type="time" step="1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input label={t('duration.endTime')} type="time" step="1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          {betweenResult && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-5 text-center">
              <p className="text-xs text-primary/60 mb-1 font-medium">{t('duration.result')}</p>
              <p className="text-3xl font-bold text-primary">{betweenResult}</p>
            </div>
          )}
        </Card>
      )}

      {mode === 'addSubtract' && (
        <Card className="space-y-4">
          <Input label={t('duration.startTime')} type="time" step="1" value={baseTime} onChange={(e) => setBaseTime(e.target.value)} />
          <div className="flex gap-2">
            <button
              onClick={() => setOperation('add')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                operation === 'add' ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/70'
              }`}
            >
              + {t('duration.add')}
            </button>
            <button
              onClick={() => setOperation('subtract')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                operation === 'subtract' ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/70'
              }`}
            >
              − {t('duration.subtract')}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label={t('duration.hours')} type="number" value={hours} onChange={(e) => setHours(e.target.value)} min="0" />
            <Input label={t('duration.minutes')} type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} min="0" />
            <Input label={t('duration.seconds')} type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} min="0" />
          </div>
          {addSubtractResult && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-5 text-center">
              <p className="text-xs text-primary/60 mb-1 font-medium">{t('duration.result')}</p>
              <p className="text-3xl font-bold text-primary font-mono">{addSubtractResult}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
