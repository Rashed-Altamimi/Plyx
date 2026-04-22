import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import { Tabs } from '../../components/ui/Tabs'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Badge } from '../../components/ui/Badge'

export function Base64Tool() {
  const { t } = useTranslation()
  useDocumentTitle(t('base64.title'))

  const TABS = [
    { id: 'text', label: t('base64.textTab') },
    { id: 'file', label: t('base64.fileTab') },
  ]

  // Text mode
  const [tab, setTab] = useState('text')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // File mode
  const [fileResult, setFileResult] = useState('')
  const [fileName, setFileName] = useState('')

  const encode = () => {
    try {
      const bytes = new TextEncoder().encode(input)
      let bin = ''
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
      setOutput(btoa(bin))
      setError('')
    } catch {
      setError(t('base64.encodingFailed'))
    }
  }

  const decode = () => {
    try {
      const bin = atob(input.trim())
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      setOutput(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      setError('')
    } catch {
      setError(t('base64.invalidBase64'))
    }
  }

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFileResult(result)
    }
    reader.onerror = () => setFileResult('')
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('base64.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('base64.subtitle')}</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'text' && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <Textarea label={t('common.input')} value={input} onChange={(e) => { setInput(e.target.value); setOutput(''); setError('') }} rows={5} placeholder="Text or Base64 string…" className="font-mono text-sm" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={encode} className="flex-1">{t('base64.encode')}</Button>
              <Button onClick={decode} variant="outline" className="flex-1">{t('base64.decode')}</Button>
            </div>
          </Card>

          {output && (
            <Card className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-base-content/70">{t('common.output')}</p>
                <CopyButton text={output} />
              </div>
              <Textarea value={output} readOnly rows={5} className="font-mono text-sm" />
              <Button variant="ghost" size="sm" onClick={() => { setInput(output); setOutput('') }}>{t('common.useAsInput')}</Button>
            </Card>
          )}
        </div>
      )}

      {tab === 'file' && (
        <div className="space-y-4">
          <Card>
            <FileDropzone onFile={handleFile} label={t('base64.dropFile')} hint={t('base64.dataUrlHint')} />
          </Card>

          {fileResult && (
            <Card className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-base-content/70 truncate">{fileName}</p>
                <div className="flex gap-2 shrink-0">
                  <Badge color="blue">{Math.round(fileResult.length / 1024)} KB</Badge>
                  <CopyButton text={fileResult} />
                </div>
              </div>
              <Textarea value={fileResult} readOnly rows={6} className="font-mono text-xs" />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
