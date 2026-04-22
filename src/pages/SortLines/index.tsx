import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Checkbox } from '../../components/ui/Checkbox'
import { CopyButton } from '../../components/ui/CopyButton'

type SortMode = 'none' | 'alpha' | 'numeric' | 'length'
type Direction = 'asc' | 'desc'

export function SortLines() {
  const { t } = useTranslation()
  useDocumentTitle(t('sortLines.title'))
  const [input, setInput] = useState('banana\napple\ncherry\napple\ndate')
  const [mode, setMode] = useState<SortMode>('alpha')
  const [direction, setDirection] = useState<Direction>('asc')
  const [dedupe, setDedupe] = useState(true)
  const [trim, setTrim] = useState(true)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [reverse, setReverse] = useState(false)

  const output = useMemo(() => {
    let lines = input.split('\n')
    if (trim) lines = lines.map((l) => l.trim()).filter((l) => l !== '')
    if (dedupe) {
      const seen = new Set<string>()
      lines = lines.filter((l) => {
        const key = ignoreCase ? l.toLowerCase() : l
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
    if (mode === 'alpha') {
      lines = lines.slice().sort((a, b) => {
        const av = ignoreCase ? a.toLowerCase() : a
        const bv = ignoreCase ? b.toLowerCase() : b
        return av.localeCompare(bv)
      })
    } else if (mode === 'numeric') {
      lines = lines.slice().sort((a, b) => parseFloat(a) - parseFloat(b))
    } else if (mode === 'length') {
      lines = lines.slice().sort((a, b) => a.length - b.length)
    }
    if (direction === 'desc' && mode !== 'none') lines.reverse()
    if (reverse) lines.reverse()
    return lines.join('\n')
  }, [input, mode, direction, dedupe, trim, ignoreCase, reverse])

  const lineCount = output ? output.split('\n').length : 0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('sortLines.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('sortLines.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <label className="text-sm font-medium text-base-content/70">{t('sortLines.input')}</label>
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} className="font-mono mono-prose text-xs" />
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('sortLines.output')}</label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-base-content/40">{t('sortLines.lineCount', { count: lineCount })}</span>
              {output && <CopyButton text={output} />}
            </div>
          </div>
          <Textarea value={output} readOnly rows={12} className="font-mono mono-prose text-xs" />
        </Card>
      </div>

      <Card className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Sort mode" value={mode} onChange={(e) => setMode(e.target.value as SortMode)}>
            <option value="none">{t('sortLines.none')}</option>
            <option value="alpha">{t('sortLines.sortAlpha')}</option>
            <option value="numeric">{t('sortLines.sortNumeric')}</option>
            <option value="length">{t('sortLines.sortLength')}</option>
          </Select>
          <Select label="Direction" value={direction} onChange={(e) => setDirection(e.target.value as Direction)} disabled={mode === 'none'}>
            <option value="asc">{t('sortLines.ascending')}</option>
            <option value="desc">{t('sortLines.descending')}</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Checkbox label={t('sortLines.dedupe')} checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} />
          <Checkbox label={t('sortLines.trim')} checked={trim} onChange={(e) => setTrim(e.target.checked)} />
          <Checkbox label={t('sortLines.ignoreCase')} checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          <Checkbox label={t('sortLines.reverse')} checked={reverse} onChange={(e) => setReverse(e.target.checked)} />
        </div>
      </Card>
    </div>
  )
}
