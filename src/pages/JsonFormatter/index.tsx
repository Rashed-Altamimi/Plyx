import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'

export function JsonFormatter() {
  const { t } = useTranslation()
  useDocumentTitle(t('json.title'))
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indent, setIndent] = useState('2')
  const [error, setError] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, Number(indent)))
      setError('')
      setValid(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setValid(false)
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
      setValid(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setValid(false)
      setOutput('')
    }
  }

  const validate = () => {
    try {
      JSON.parse(input)
      setError('')
      setValid(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setValid(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('json.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('json.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70">{t('common.input')}</p>
            {valid !== null && (
              <Badge color={valid ? 'green' : 'red'}>{valid ? t('json.validJson') : t('json.invalidJson')}</Badge>
            )}
          </div>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setValid(null); setError('') }}
            placeholder='{"key": "value"}'
            rows={14}
            className="font-mono text-xs"
          />
          {error && <p className="text-xs text-red-500 break-all">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Select value={indent} onChange={(e) => setIndent(e.target.value)} className="w-32">
              <option value="2">{t('json.spaces2')}</option>
              <option value="4">{t('json.spaces4')}</option>
              <option value="	">{t('json.tab')}</option>
            </Select>
            <Button onClick={format} size="sm">{t('json.formatBtn')}</Button>
            <Button onClick={minify} variant="outline" size="sm">{t('json.minify')}</Button>
            <Button onClick={validate} variant="ghost" size="sm">{t('json.validate')}</Button>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70">{t('common.output')}</p>
            {output && <CopyButton text={output} />}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder={t('json.outputPlaceholder')}
            rows={14}
            className="font-mono text-xs"
          />
        </Card>
      </div>
    </div>
  )
}
