import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { CopyButton } from '../../components/ui/CopyButton'
import { encodeHtmlEntities, decodeHtmlEntities, type EncodeMode } from '../../utils/htmlEntities'

export function HtmlEntities() {
  const { t } = useTranslation()
  useDocumentTitle(t('htmlEntities.title'))
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<EncodeMode>('named')

  const encode = () => setOutput(encodeHtmlEntities(input, mode))
  const decode = () => setOutput(decodeHtmlEntities(input))

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('htmlEntities.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('htmlEntities.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Textarea
          label={t('htmlEntities.input')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="<p>Hello & welcome</p>"
          className="font-mono text-sm"
        />
        <Select label={t('htmlEntities.mode')} value={mode} onChange={(e) => setMode(e.target.value as EncodeMode)}>
          <option value="named">{t('htmlEntities.named')}</option>
          <option value="numeric">{t('htmlEntities.numeric')}</option>
          <option value="hex">{t('htmlEntities.hex')}</option>
        </Select>
        <div className="flex gap-2">
          <Button onClick={encode} className="flex-1">{t('htmlEntities.encode')}</Button>
          <Button onClick={decode} variant="outline" className="flex-1">{t('htmlEntities.decode')}</Button>
        </div>
      </Card>

      {output && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('htmlEntities.output')}</label>
            <CopyButton text={output} />
          </div>
          <Textarea value={output} readOnly rows={5} className="font-mono text-sm" />
          <Button variant="ghost" size="sm" onClick={() => { setInput(output); setOutput('') }}>
            {t('common.useAsInput')}
          </Button>
        </Card>
      )}
    </div>
  )
}
