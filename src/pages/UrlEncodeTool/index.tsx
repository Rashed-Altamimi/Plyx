import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

export function UrlEncodeTool() {
  const { t } = useTranslation()
  useDocumentTitle(t('urlEncode.title'))
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const encode = () => {
    try {
      setOutput(encodeURIComponent(input))
      setError('')
    } catch {
      setError('Encoding failed')
    }
  }

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input))
      setError('')
    } catch {
      setError('Invalid encoded string')
    }
  }

  const encodeQuery = () => {
    try {
      const url = new URL(input)
      setOutput(url.toString())
      setError('')
    } catch {
      // Not a full URL, just encode the string
      setOutput(input.replace(/[^A-Za-z0-9\-_.~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`))
      setError('')
    }
  }

  // Parse query string
  const queryParams = (() => {
    try {
      const search = input.includes('?') ? input.slice(input.indexOf('?')) : (input.startsWith('?') ? input : `?${input}`)
      const params = new URLSearchParams(search)
      return Array.from(params.entries())
    } catch { return [] }
  })()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('urlEncode.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('urlEncode.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Textarea
          label={t('common.input')}
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(''); setError('') }}
          rows={4}
          placeholder="https://example.com/path?q=hello world&lang=en"
          className="font-mono text-sm"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={encode}>{t('urlEncode.encodeBtn')}</Button>
          <Button onClick={decode} variant="outline">{t('urlEncode.decodeBtn')}</Button>
          <Button onClick={encodeQuery} variant="ghost">{t('urlEncode.encodeSpecial')}</Button>
        </div>
      </Card>

      {output && (
        <Card className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70">{t('common.output')}</p>
            <CopyButton text={output} />
          </div>
          <Textarea value={output} readOnly rows={4} className="font-mono text-sm" />
          <Button variant="ghost" size="sm" onClick={() => { setInput(output); setOutput('') }}>{t('common.useAsInput')}</Button>
        </Card>
      )}

      {queryParams.length > 0 && (
        <Card>
          <p className="text-sm font-medium text-base-content/70 mb-3">{t('urlEncode.queryParams')}</p>
          <div className="space-y-2">
            {queryParams.map(([k, v], i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-primary shrink-0">{k}</span>
                <span className="text-base-content/40">=</span>
                <span className="font-mono text-base-content break-all">{decodeURIComponent(v)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
