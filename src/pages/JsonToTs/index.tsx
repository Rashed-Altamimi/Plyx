import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JsonToTS from 'json-to-ts'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

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
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const generate = () => {
    try {
      const parsed = JSON.parse(input)
      const result = JsonToTS(parsed, { rootName }).join('\n\n')
      setOutput(result)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t('jsonTs.invalidJson'))
      setOutput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('jsonTs.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('jsonTs.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <Input label={t('jsonTs.rootName')} value={rootName} onChange={(e) => setRootName(e.target.value)} />
          <Textarea label={t('jsonTs.input')} value={input} onChange={(e) => setInput(e.target.value)} rows={14} className="font-mono text-xs" />
          <Button onClick={generate} className="w-full">{t('common.generate')}</Button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('jsonTs.output')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <Textarea value={output} readOnly rows={18} className="font-mono text-xs" placeholder="interface Root { … }" />
        </Card>
      </div>
    </div>
  )
}
