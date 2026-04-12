import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Input } from '../../components/ui/Input'
import { Checkbox } from '../../components/ui/Checkbox'
import { Badge } from '../../components/ui/Badge'
import { CopyButton } from '../../components/ui/CopyButton'

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function FindReplace() {
  const { t } = useTranslation()
  useDocumentTitle(t('findReplace.title'))
  const [input, setInput] = useState('')
  const [find, setFind] = useState('')
  const [replaceWith, setReplaceWith] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  const { output, error, count } = useMemo(() => {
    if (!find) return { output: input, error: '', count: 0 }
    try {
      let pattern: string
      if (useRegex) {
        pattern = find
      } else {
        pattern = escapeRegex(find)
        if (wholeWord) pattern = `\\b${pattern}\\b`
      }
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(pattern, flags)
      const matches = input.match(regex)
      const replaced = input.replace(regex, replaceWith)
      return { output: replaced, error: '', count: matches?.length ?? 0 }
    } catch (e) {
      return { output: input, error: (e as Error).message, count: 0 }
    }
  }, [input, find, replaceWith, useRegex, caseSensitive, wholeWord])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('findReplace.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('findReplace.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Textarea label={t('findReplace.input')} value={input} onChange={(e) => setInput(e.target.value)} rows={6} className="font-mono text-xs" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label={t('findReplace.find')} value={find} onChange={(e) => setFind(e.target.value)} className="font-mono" />
          <Input label={t('findReplace.replaceWith')} value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} className="font-mono" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Checkbox label={t('findReplace.useRegex')} checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
          <Checkbox label={t('findReplace.caseSensitive')} checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          <Checkbox label={t('findReplace.wholeWord')} checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} disabled={useRegex} />
        </div>
        {error && <p className="text-xs text-red-500">{t('findReplace.invalidRegex')}: {error}</p>}
        {find && !error && (
          <Badge color={count > 0 ? 'green' : 'gray'}>
            {count === 1 ? t('findReplace.matches', { count }) : t('findReplace.matchesPlural', { count })}
          </Badge>
        )}
      </Card>

      {find && !error && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('findReplace.output')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <Textarea value={output} readOnly rows={6} className="font-mono text-xs" />
        </Card>
      )}
    </div>
  )
}
