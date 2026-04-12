import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Tabs } from '../../components/ui/Tabs'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import {
  convertTimezone,
  unixToDate,
  dateToUnix,
  formatAllFormats,
  getTimezoneGroups,
  DATE_FORMATS,
} from '../../utils/dateTime'

function TimezoneSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const groups = getTimezoneGroups()
  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(groups).map(([region, zones]) => (
        <optgroup key={region} label={region}>
          {zones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </optgroup>
      ))}
    </Select>
  )
}

function TimezoneTab() {
  const { t } = useTranslation()
  const [dateStr, setDateStr] = useState(() => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  })
  const [fromTz, setFromTz] = useState('UTC')
  const [toTz, setToTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [result, setResult] = useState('')

  const convert = () => {
    setResult(convertTimezone(dateStr, fromTz, toTz))
  }

  return (
    <Card className="space-y-4">
      <Input label={t('datetime.dateTime')} type="datetime-local" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TimezoneSelect label={t('datetime.fromTimezone')} value={fromTz} onChange={setFromTz} />
        <TimezoneSelect label={t('datetime.toTimezone')}   value={toTz}   onChange={setToTz} />
      </div>
      <Button onClick={convert} className="w-full">{t('common.convert')}</Button>
      {result && (
        <div className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-3">
          <code className="text-sm font-mono text-base-content">{result}</code>
          <CopyButton text={result} />
        </div>
      )}
    </Card>
  )
}

function UnixTab() {
  const { t } = useTranslation()
  const [unix, setUnix] = useState(() => Math.floor(Date.now() / 1000).toString())
  const [dateInput, setDateInput] = useState('')
  const [unixResult, setUnixResult] = useState('')
  const [dateResult, setDateResult] = useState('')

  const toDate = () => setDateResult(unixToDate(Number(unix)))
  const toUnix = () => {
    const result = dateToUnix(dateInput)
    setUnixResult(result !== null ? String(result) : 'Invalid date')
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/70">{t('datetime.unixToDate')}</h2>
        <div className="flex gap-2">
          <Input value={unix} onChange={(e) => setUnix(e.target.value)} placeholder="1710509400" className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setUnix(String(Math.floor(Date.now() / 1000)))}>{t('datetime.now')}</Button>
        </div>
        <Button onClick={toDate} className="w-full">{t('common.convert')}</Button>
        {dateResult && (
          <div className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-3">
            <code className="text-sm font-mono text-base-content">{dateResult}</code>
            <CopyButton text={dateResult} />
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/70">{t('datetime.dateToUnix')}</h2>
        <Input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <Button onClick={toUnix} className="w-full">{t('common.convert')}</Button>
        {unixResult && (
          <div className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-3">
            <code className="text-sm font-mono text-base-content">{unixResult}</code>
            <CopyButton text={unixResult} />
          </div>
        )}
      </Card>
    </div>
  )
}

function FormatTab() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [fromFormat, setFromFormat] = useState(DATE_FORMATS[0].pattern)
  const [results, setResults] = useState<Array<{ label: string; value: string }> | null>(null)

  const convert = () => {
    if (!input.trim()) return
    const parsed = formatAllFormats(input)
    setResults(parsed)
  }

  return (
    <Card className="space-y-4">
      <Input label={t('datetime.dateString')} value={input} onChange={(e) => setInput(e.target.value)} placeholder={DATE_FORMATS.find(f => f.pattern === fromFormat)?.example} />
      <Select label={t('datetime.inputFormat')} value={fromFormat} onChange={(e) => setFromFormat(e.target.value)}>
        {DATE_FORMATS.map((f) => <option key={f.pattern} value={f.pattern}>{f.label} — {f.example}</option>)}
      </Select>
      <Button onClick={convert} className="w-full">{t('datetime.convertAllFormats')}</Button>
      {results && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.label} className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-2.5">
              <div>
                <p className="text-xs text-base-content/40">{r.label}</p>
                <code className="text-sm font-mono text-base-content">{r.value}</code>
              </div>
              <CopyButton text={r.value} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export function DateTimeConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('datetime.title'))
  const [tab, setTab] = useState('timezone')

  const TABS = [
    { id: 'timezone', label: t('datetime.timezone') },
    { id: 'unix',     label: t('datetime.unix') },
    { id: 'format',   label: t('datetime.format') },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('datetime.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('datetime.subtitle')}</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'timezone' && <TimezoneTab />}
      {tab === 'unix'     && <UnixTab />}
      {tab === 'format'   && <FormatTab />}
    </div>
  )
}
