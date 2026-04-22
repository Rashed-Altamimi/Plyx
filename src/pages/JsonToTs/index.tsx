import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { CopyButton } from '../../components/ui/CopyButton'
import { useDebounced } from '../../hooks/useDebounced'
import { inferSchema, generate, LANGUAGES, type Language } from '../../utils/jsonClass'

const DEFAULT_JSON = `{
  "id": 1,
  "name": "Plyx",
  "active": true,
  "tags": ["tool", "utility"],
  "owner": {
    "email": "owner@example.com",
    "verified": true
  }
}`

export function JsonToTs() {
  const { t } = useTranslation()
  useDocumentTitle(t('jsonTs.title'))
  const [input, setInput] = useState(DEFAULT_JSON)
  const [rootName, setRootName] = useState('Root')
  const [lang, setLang] = useState<Language>('typescript')

  const debouncedInput = useDebounced(input, 150)
  const debouncedRoot = useDebounced(rootName, 150)

  const { output, error } = useMemo(() => {
    if (!debouncedInput.trim()) return { output: '', error: '' }
    try {
      const parsed = JSON.parse(debouncedInput)
      const schema = inferSchema(parsed, debouncedRoot || 'Root')
      return { output: generate(schema, lang), error: '' }
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : t('jsonTs.invalidJson') }
    }
  }, [debouncedInput, debouncedRoot, lang, t])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('jsonTs.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('jsonTs.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('jsonTs.rootName')} value={rootName} onChange={(e) => setRootName(e.target.value)} />
            <Select label={t('jsonTs.language')} value={lang} onChange={(e) => setLang(e.target.value as Language)}>
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </Select>
          </div>
          <Textarea label={t('jsonTs.input')} value={input} onChange={(e) => setInput(e.target.value)} rows={16} className="font-mono text-xs" />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('jsonTs.output')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <Textarea value={output} readOnly rows={20} className="font-mono text-xs" placeholder="interface Root { … }" />
        </Card>
      </div>
    </div>
  )
}
