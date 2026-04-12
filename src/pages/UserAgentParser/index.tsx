import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UAParser } from 'ua-parser-js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'

interface UaResult {
  browser: { name?: string; version?: string }
  engine: { name?: string; version?: string }
  os: { name?: string; version?: string }
  device: { model?: string; type?: string; vendor?: string }
  cpu: { architecture?: string }
}

export function UserAgentParser() {
  const { t } = useTranslation()
  useDocumentTitle(t('userAgent.title'))
  const [input, setInput] = useState('')
  const [result, setResult] = useState<UaResult | null>(null)

  const parse = (ua: string) => {
    if (!ua.trim()) { setResult(null); return }
    const parser = new UAParser(ua)
    setResult(parser.getResult() as UaResult)
  }

  const useMyUa = () => {
    const ua = navigator.userAgent
    setInput(ua)
    parse(ua)
  }

  const unknown = t('userAgent.unknown')
  const formatField = (v?: string) => v || unknown

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('userAgent.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('userAgent.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Textarea
          label={t('userAgent.input')}
          value={input}
          onChange={(e) => { setInput(e.target.value); parse(e.target.value) }}
          rows={4}
          placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36…"
          className="font-mono text-xs"
        />
        <Button onClick={useMyUa} variant="outline" className="w-full">{t('userAgent.useMyUa')}</Button>
      </Card>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('userAgent.browser')}</p>
            <p className="text-base font-semibold text-base-content">{formatField(result.browser.name)}</p>
            <p className="text-sm text-base-content/60">{formatField(result.browser.version)}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('userAgent.engine')}</p>
            <p className="text-base font-semibold text-base-content">{formatField(result.engine.name)}</p>
            <p className="text-sm text-base-content/60">{formatField(result.engine.version)}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('userAgent.os')}</p>
            <p className="text-base font-semibold text-base-content">{formatField(result.os.name)}</p>
            <p className="text-sm text-base-content/60">{formatField(result.os.version)}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('userAgent.device')}</p>
            <p className="text-base font-semibold text-base-content">{formatField(result.device.vendor)} {result.device.model || ''}</p>
            <p className="text-sm text-base-content/60">{formatField(result.device.type)}</p>
          </Card>
          <Card className="sm:col-span-2">
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('userAgent.cpu')}</p>
            <p className="text-base font-semibold text-base-content">{formatField(result.cpu.architecture)}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
