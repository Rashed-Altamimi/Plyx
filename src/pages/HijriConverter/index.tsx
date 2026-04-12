import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Tabs } from '../../components/ui/Tabs'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import {
  gregorianToHijri,
  hijriToGregorian,
  getHijriDaysInMonth,
  formatHijriDate,
  formatGregorianDate,
  todayGregorian,
  todayHijri,
  HIJRI_MONTHS,
} from '../../utils/hijri'

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function HijriConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('hijri.title'))
  const [tab, setTab] = useState('g2h')

  const TABS = [
    { id: 'g2h', label: t('hijri.g2h') },
    { id: 'h2g', label: t('hijri.h2g') },
  ]

  const todayG = todayGregorian()
  const todayH = todayHijri()

  // Gregorian → Hijri state
  const [gy, setGy] = useState(todayG.gy)
  const [gm, setGm] = useState(todayG.gm)
  const [gd, setGd] = useState(todayG.gd)
  const [hijriResult, setHijriResult] = useState<string | null>(null)
  const [gError, setGError] = useState('')

  // Hijri → Gregorian state
  const [hy, setHy] = useState(todayH.hy)
  const [hm, setHm] = useState(todayH.hm)
  const [hd, setHd] = useState(todayH.hd)
  const [gregResult, setGregResult] = useState<string | null>(null)
  const [hError, setHError] = useState('')

  const convertToHijri = () => {
    try {
      const result = gregorianToHijri(gy, gm, gd)
      setHijriResult(formatHijriDate(result.hy, result.hm, result.hd))
      setGError('')
    } catch {
      setGError(t('hijri.conversionError'))
      setHijriResult(null)
    }
  }

  const convertToGregorian = () => {
    try {
      const maxDay = getHijriDaysInMonth(hy, hm)
      if (hd > maxDay) {
        setHError(t('hijri.dayOutOfRange', { day: hd, max: maxDay }))
        setGregResult(null)
        return
      }
      const result = hijriToGregorian(hy, hm, hd)
      setGregResult(formatGregorianDate(result.gy, result.gm, result.gd))
      setHError('')
    } catch {
      setHError(t('hijri.conversionError'))
      setGregResult(null)
    }
  }

  const gDaysInMonth = new Date(gy, gm, 0).getDate()
  const hDaysInMonth = getHijriDaysInMonth(hy, hm)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('hijri.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('hijri.subtitle')}</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'g2h' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-base-content/70">{t('hijri.gregorianDate')}</h2>
            <Button variant="ghost" size="sm" onClick={() => { setGy(todayG.gy); setGm(todayG.gm); setGd(todayG.gd) }}>
              {t('common.today')}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select label={t('hijri.year')} value={gy} onChange={(e) => setGy(Number(e.target.value))}>
              {range(1800, 2100).map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Select label={t('hijri.month')} value={gm} onChange={(e) => { setGm(Number(e.target.value)); setGd(1) }}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{t(`gregorianMonths.${i + 1}`)}</option>
              ))}
            </Select>
            <Select label={t('hijri.day')} value={gd} onChange={(e) => setGd(Number(e.target.value))}>
              {range(1, gDaysInMonth).map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>

          <Button onClick={convertToHijri} className="w-full">{t('hijri.toHijri')}</Button>

          {gError && <p className="text-sm text-red-500">{gError}</p>}

          {hijriResult && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-xs text-primary/80 mb-1">{t('hijri.hijriDate')}</p>
              <p className="text-lg font-semibold text-primary">{hijriResult}</p>
            </div>
          )}
        </Card>
      )}

      {tab === 'h2g' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-base-content/70">{t('hijri.hijriDate')}</h2>
            <Button variant="ghost" size="sm" onClick={() => { setHy(todayH.hy); setHm(todayH.hm); setHd(todayH.hd) }}>
              {t('common.today')}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select label={t('hijri.year')} value={hy} onChange={(e) => setHy(Number(e.target.value))}>
              {range(1300, 1600).map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Select label={t('hijri.month')} value={hm} onChange={(e) => { setHm(Number(e.target.value)); setHd(1) }}>
              {HIJRI_MONTHS.map((_, i) => (
                <option key={i + 1} value={i + 1}>{t(`hijriMonths.${i + 1}`)}</option>
              ))}
            </Select>
            <Select label={t('hijri.day')} value={hd} onChange={(e) => setHd(Number(e.target.value))}>
              {range(1, hDaysInMonth).map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>

          <Button onClick={convertToGregorian} className="w-full">{t('hijri.toGregorian')}</Button>

          {hError && <p className="text-sm text-red-500">{hError}</p>}

          {gregResult && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-xs text-primary/80 mb-1">{t('hijri.gregorianDate')}</p>
              <p className="text-lg font-semibold text-primary">{gregResult}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
