import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'

export function RegexTester() {
  const { t } = useTranslation()
  useDocumentTitle(t('regex.title'))
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState({ g: true, i: false, m: false })
  const [testStr, setTestStr] = useState('')

  const { error, matches, highlighted } = useMemo(() => {
    if (!pattern) return { regex: null, error: '', matches: [], highlighted: testStr }
    try {
      const f = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')
      const rx = new RegExp(pattern, f)
      const allMatches: RegExpExecArray[] = []
      let m: RegExpExecArray | null

      // Iterate matches
      const g = f.includes('g')
      if (g) {
        while ((m = rx.exec(testStr)) !== null) {
          allMatches.push(m)
          if (m.index === rx.lastIndex) rx.lastIndex++ // avoid infinite loop on zero-length
        }
      } else {
        m = rx.exec(testStr)
        if (m) allMatches.push(m)
      }

      // Build highlighted HTML (rendered as text with spans via React)
      const parts: Array<{ text: string; match: boolean }> = []
      let last = 0
      for (const match of allMatches) {
        if (match.index > last) parts.push({ text: testStr.slice(last, match.index), match: false })
        parts.push({ text: match[0], match: true })
        last = match.index + match[0].length
      }
      if (last < testStr.length) parts.push({ text: testStr.slice(last), match: false })

      return { regex: rx, error: '', matches: allMatches, highlighted: parts }
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [], highlighted: testStr }
    }
  }, [pattern, flags, testStr])

  const matchCount = matches.length

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('regex.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('regex.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('regex.pattern')}</label>
          <div className="flex items-center border border-base-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="px-3 text-base-content/40 text-sm font-mono">/</span>
            <input
              className="flex-1 py-2 text-sm font-mono text-base-content outline-none"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[a-z]+"
              spellCheck={false}
            />
            <span className="px-3 text-base-content/40 text-sm font-mono">
              /{Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}
            </span>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-4">
          <Checkbox label={t('regex.globalFlag')} checked={flags.g} onChange={(e) => setFlags({ ...flags, g: e.target.checked })} />
          <Checkbox label={t('regex.caseInsensitive')} checked={flags.i} onChange={(e) => setFlags({ ...flags, i: e.target.checked })} />
          <Checkbox label={t('regex.multiline')} checked={flags.m} onChange={(e) => setFlags({ ...flags, m: e.target.checked })} />
        </div>
      </Card>

      <Card className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-base-content/70">{t('regex.testString')}</label>
          {pattern && !error && (
            <Badge color={matchCount > 0 ? 'green' : 'gray'}>
              {matchCount === 1 ? t('regex.matches', { count: matchCount }) : t('regex.matchesPlural', { count: matchCount })}
            </Badge>
          )}
        </div>
        <Textarea value={testStr} onChange={(e) => setTestStr(e.target.value)} rows={6} placeholder="Enter text to test against…" className="font-mono text-sm" />
      </Card>

      {Array.isArray(highlighted) && highlighted.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-base-content/70 mb-3">{t('regex.highlighted')}</p>
          <div className="font-mono text-sm leading-7 whitespace-pre-wrap break-all bg-base-200 rounded-lg p-4">
            {highlighted.map((part, i) =>
              part.match
                ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part.text}</mark>
                : <span key={i}>{part.text}</span>
            )}
          </div>
          {matches.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs text-base-content/50 font-medium mb-2">{t('regex.matchDetails')}</p>
              {matches.map((m, i) => (
                <div key={i} className="text-xs font-mono bg-base-200 rounded px-3 py-1.5 flex gap-4">
                  <span className="text-base-content/40">#{i + 1}</span>
                  <span className="text-base-content">"{m[0]}"</span>
                  <span className="text-base-content/40">index: {m.index}</span>
                  {m.slice(1).map((g, gi) => g !== undefined && <span key={gi} className="text-primary">group {gi + 1}: "{g}"</span>)}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
