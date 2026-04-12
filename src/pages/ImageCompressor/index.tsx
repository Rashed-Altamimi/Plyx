import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Slider } from '../../components/ui/Slider'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(2)} MB`
}

export function ImageCompressor() {
  const { t } = useTranslation()
  useDocumentTitle(t('compress.title'))

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [quality, setQuality] = useState(70)
  const [result, setResult] = useState<{ dataUrl: string; size: number; filename: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new Image()
    img.onload = () => { imgRef.current = img }
    img.src = url
  }

  const compress = () => {
    if (!imgRef.current || !file) return
    setLoading(true)

    const canvas = document.createElement('canvas')
    canvas.width = imgRef.current.naturalWidth
    canvas.height = imgRef.current.naturalHeight
    const ctx = canvas.getContext('2d')!

    // Use JPEG for compression (white background for transparency)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imgRef.current, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', quality / 100)
    // Estimate byte size from data URL
    const base64Len = dataUrl.split(',')[1].length
    const size = Math.round((base64Len * 3) / 4)
    const baseName = file.name.replace(/\.[^.]+$/, '')

    setResult({ dataUrl, size, filename: `${baseName}_compressed.jpg` })
    setLoading(false)
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = result.filename
    a.click()
  }

  const savings = file && result ? Math.round(((file.size - result.size) / file.size) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('compress.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('compress.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('compress.dropImage')} hint="PNG, JPG, WEBP" />
      ) : (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
                <p className="text-xs text-base-content/40">{t('compress.original')}: {formatSize(file.size)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); setResult(null) }}>{t('common.change')}</Button>
            </div>
            {preview && <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain mx-auto border border-base-200" />}
          </Card>

          <Card className="space-y-4">
            <Slider label={t('compress.quality')} min={5} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            <p className="text-xs text-base-content/40">{t('compress.qualityHint')}</p>
            <Button onClick={compress} disabled={loading} className="w-full">
              {loading ? t('compress.compressing') : t('compress.compressBtn')}
            </Button>
          </Card>

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-medium text-base-content/70">{t('compress.compressed')}</p>
                <div className="flex gap-2">
                  <Badge color="blue">{formatSize(result.size)}</Badge>
                  {savings > 0 && <Badge color="green">-{savings}%</Badge>}
                  {savings <= 0 && <Badge color="orange">{t('compress.noSavings')}</Badge>}
                </div>
              </div>

              {/* Comparison bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/50 w-16">{t('compress.original')}</span>
                  <div className="flex-1 h-3 bg-base-300 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-xs text-base-content/50 w-16 text-right">{formatSize(file.size)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/50 w-16">{t('compress.newLabel')}</span>
                  <div className="flex-1 h-3 bg-base-300 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.max(5, (result.size / file.size) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-base-content/50 w-16 text-right">{formatSize(result.size)}</span>
                </div>
              </div>

              <img src={result.dataUrl} alt="Compressed" className="max-h-40 rounded-lg object-contain mx-auto border border-base-200" />
              <Button onClick={download} variant="outline" className="w-full">
                <Download size={14} /> {t('common.download')} {result.filename}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
