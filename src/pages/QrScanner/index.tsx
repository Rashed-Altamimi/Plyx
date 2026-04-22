import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import jsQR from 'jsqr'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { CopyButton } from '../../components/ui/CopyButton'
import { Badge } from '../../components/ui/Badge'

function isUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function QrScanner() {
  const { t } = useTranslation()
  useDocumentTitle(t('qrScan.title'))

  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleFile = (file: File) => {
    setFileName(file.name)
    setResult(null)
    setError('')

    const url = URL.createObjectURL(file)
    setPreview(url)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { setError(t('qrScan.decodeFailed')); return }
      ctx.drawImage(img, 0, 0)
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' })
        if (code) setResult(code.data)
        else setError(t('qrScan.noCode'))
      } catch {
        setError(t('qrScan.decodeFailed'))
      }
    }
    img.onerror = () => setError(t('qrScan.loadFailed'))
    img.src = url
  }

  const reset = () => {
    setPreview(null)
    setResult(null)
    setError('')
    setFileName('')
  }

  const url = result && isUrl(result) ? result : null

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('qrScan.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('qrScan.subtitle')}</p>

      {!preview ? (
        <FileDropzone
          accept="image/*"
          onFile={handleFile}
          label={t('qrScan.dropImage')}
          hint={t('qrScan.hint')}
        />
      ) : (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-base-content/70 truncate">{fileName}</p>
              <Button variant="ghost" size="sm" onClick={reset}>{t('common.change')}</Button>
            </div>
            <img
              src={preview}
              alt={t('qrScan.uploadedAlt')}
              className="max-h-64 rounded-lg object-contain mx-auto border border-base-200"
            />
          </Card>

          {error && (
            <Card className="text-center py-6 bg-red-50 border-red-100">
              <p className="text-sm text-red-600">{error}</p>
            </Card>
          )}

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-base-content/70">{t('qrScan.decoded')}</p>
                  {url && <Badge color="blue">URL</Badge>}
                </div>
                <CopyButton text={result} />
              </div>
              <Textarea value={result} readOnly rows={Math.min(8, Math.max(2, result.split('\n').length))} className="font-mono text-sm" />
              {url && (
                <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                  {t('qrScan.openLink')}
                </Button>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
