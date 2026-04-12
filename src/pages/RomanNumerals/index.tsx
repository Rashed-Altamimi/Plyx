import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { CopyButton } from '../../components/ui/CopyButton'
import { arabicToRoman, romanToArabic } from '../../utils/roman'

export function RomanNumerals() {
  const { t } = useTranslation()
  useDocumentTitle(t('roman.title'))

  const [arabic, setArabic] = useState('')
  const [roman, setRoman] = useState('')
  const [error, setError] = useState('')

  const handleArabicChange = (v: string) => {
    setArabic(v)
    setError('')
    if (!v) { setRoman(''); return }
    const n = parseInt(v, 10)
    const r = arabicToRoman(n)
    if (r === null) {
      setError(t('roman.invalidRange'))
      setRoman('')
    } else {
      setRoman(r)
    }
  }

  const handleRomanChange = (v: string) => {
    setRoman(v.toUpperCase())
    setError('')
    if (!v) { setArabic(''); return }
    const n = romanToArabic(v)
    if (n === null) {
      setError(t('roman.invalidRoman'))
      setArabic('')
    } else {
      setArabic(String(n))
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('roman.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('roman.subtitle')}</p>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              label={t('roman.arabic')}
              type="number"
              min="1"
              max="3999"
              value={arabic}
              onChange={(e) => handleArabicChange(e.target.value)}
              placeholder="1–3999"
            />
          </div>
          {arabic && <CopyButton text={arabic} />}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              label={t('roman.roman')}
              value={roman}
              onChange={(e) => handleRomanChange(e.target.value)}
              placeholder="MCMXCIX"
              className="font-mono uppercase"
            />
          </div>
          {roman && <CopyButton text={roman} />}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </Card>
    </div>
  )
}
