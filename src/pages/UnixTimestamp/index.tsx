import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

type Unit = 'seconds' | 'milliseconds'

function dateToInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatRelative(diffMs: number, t: (key: string, opts?: Record<string, number>) => string): string {
  const abs = Math.abs(diffMs)
  const future = diffMs < 0
  const sec = Math.round(abs / 1000)
  if (sec < 60) return future ? t('unixTime.inSeconds', { n: sec }) : t('unixTime.agoSeconds', { n: sec })
  const min = Math.round(sec / 60)
  if (min < 60) return future ? t('unixTime.inMinutes', { n: min }) : t('unixTime.agoMinutes', { n: min })
  const hr = Math.round(min / 60)
  if (hr < 24) return future ? t('unixTime.inHours', { n: hr }) : t('unixTime.agoHours', { n: hr })
  const day = Math.round(hr / 24)
  if (day < 365) return future ? t('unixTime.inDays', { n: day }) : t('unixTime.agoDays', { n: day })
  const year = Math.round(day / 365)
  return future ? t('unixTime.inYears', { n: year }) : t('unixTime.agoYears', { n: year })
}

export function UnixTimestamp() {
  const { t } = useTranslation()
  useDocumentTitle(t('unixTime.title'))

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const [tsInput, setTsInput] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [unit, setUnit] = useState<Unit>('seconds')
  const [dateInput, setDateInput] = useState(() => dateToInputValue(new Date()))

  const tsAsDate = useMemo(() => {
    const n = Number(tsInput)
    if (!Number.isFinite(n)) return null
    const ms = unit === 'seconds' ? n * 1000 : n
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? null : d
  }, [tsInput, unit])

  const dateAsTs = useMemo(() => {
    const d = new Date(dateInput)
    if (Number.isNaN(d.getTime())) return null
    return d
  }, [dateInput])

  const useNow = () => {
    setTsInput(String(unit === 'seconds' ? Math.floor(Date.now() / 1000) : Date.now()))
    setDateInput(dateToInputValue(new Date()))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('unixTime.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('unixTime.subtitle')}</p>

      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-base-content/50 mb-1">{t('unixTime.currentTime')}</p>
            <p className="text-2xl font-mono font-semibold text-base-content">
              {unit === 'seconds' ? Math.floor(now / 1000) : now}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={useNow}>
            {t('unixTime.useNow')}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 mb-4">
        <h2 className="text-sm font-medium text-base-content/70">{t('unixTime.tsToDate')}</h2>
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <Input
            label={t('unixTime.timestamp')}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value.trim())}
            inputMode="numeric"
            className="font-mono"
          />
          <Select label={t('unixTime.unit')} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            <option value="seconds">{t('unixTime.seconds')}</option>
            <option value="milliseconds">{t('unixTime.milliseconds')}</option>
          </Select>
        </div>

        {tsAsDate ? (
          <div className="bg-base-200 rounded-lg p-3 space-y-1.5">
            <Row label={t('unixTime.local')} value={tsAsDate.toString()} />
            <Row label="ISO 8601" value={tsAsDate.toISOString()} />
            <Row label="UTC" value={tsAsDate.toUTCString()} />
            <p className="text-xs text-base-content/40 pt-1">
              {formatRelative(now - tsAsDate.getTime(), t as never)}
            </p>
          </div>
        ) : tsInput && (
          <p className="text-xs text-red-500">{t('unixTime.invalidTs')}</p>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-sm font-medium text-base-content/70">{t('unixTime.dateToTs')}</h2>
        <Input
          label={t('unixTime.localDate')}
          type="datetime-local"
          step={1}
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />

        {dateAsTs ? (
          <div className="bg-base-200 rounded-lg p-3 space-y-1.5">
            <Row label={t('unixTime.seconds')} value={String(Math.floor(dateAsTs.getTime() / 1000))} copy />
            <Row label={t('unixTime.milliseconds')} value={String(dateAsTs.getTime())} copy />
            <Row label="ISO 8601" value={dateAsTs.toISOString()} copy />
          </div>
        ) : (
          <p className="text-xs text-red-500">{t('unixTime.invalidDate')}</p>
        )}
      </Card>
    </div>
  )
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-semibold">{label}</p>
        <p className="text-sm font-mono text-base-content break-all">{value}</p>
      </div>
      {copy && <CopyButton text={value} />}
    </div>
  )
}
