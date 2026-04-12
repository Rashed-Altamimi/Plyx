import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

const POPULAR_ZONES = [
  'UTC',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Sao_Paulo', 'America/Mexico_City',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Istanbul',
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
  'Asia/Dubai', 'Asia/Riyadh', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Bangkok',
  'Asia/Singapore', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Tokyo', 'Asia/Seoul',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland',
]

function cityName(tz: string): string {
  return tz.split('/').pop()?.replace(/_/g, ' ') ?? tz
}

function tzOffset(tz: string): string {
  try {
    return formatInTimeZone(new Date(), tz, 'xxx')
  } catch {
    return ''
  }
}

export function WorldClock() {
  const { t } = useTranslation()
  useDocumentTitle(t('worldClock.title'))
  const [zones, setZones] = useState<string[]>([
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
  ])
  const [now, setNow] = useState(new Date())
  const [toAdd, setToAdd] = useState('Asia/Dubai')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const addZone = () => {
    if (!zones.includes(toAdd)) {
      setZones([...zones, toAdd])
    }
  }

  const removeZone = (tz: string) => {
    setZones(zones.filter((z) => z !== tz))
  }

  const availableZones = POPULAR_ZONES.filter((z) => !zones.includes(z))

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('worldClock.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('worldClock.subtitle')}</p>

      <div className="space-y-3 mb-4">
        {zones.map((tz) => {
          let time = ''
          let date = ''
          try {
            time = formatInTimeZone(now, tz, 'HH:mm:ss')
            date = formatInTimeZone(now, tz, 'EEE, MMM d')
          } catch {
            time = '--:--:--'
          }
          return (
            <Card key={tz} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold text-base-content">{cityName(tz)}</p>
                <p className="text-xs text-base-content/50">{tz} · UTC{tzOffset(tz)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold text-base-content">{time}</p>
                  <p className="text-xs text-base-content/50">{date}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeZone(tz)}>
                  <X size={14} />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {availableZones.length > 0 && (
        <Card className="flex gap-2 items-end">
          <Select label={t('worldClock.addZone')} value={toAdd} onChange={(e) => setToAdd(e.target.value)} className="flex-1">
            {availableZones.map((tz) => (
              <option key={tz} value={tz}>{cityName(tz)} ({tz})</option>
            ))}
          </Select>
          <Button onClick={addZone}>
            <Plus size={14} />
          </Button>
        </Card>
      )}
    </div>
  )
}
