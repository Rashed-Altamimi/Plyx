import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Textarea } from '../../components/ui/Textarea'
import { Input } from '../../components/ui/Input'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'
import { downloadDataUrl } from '../../utils/canvasImage'

export function SvgToPng() {
  const { t } = useTranslation()
  useDocumentTitle(t('svgPng.title'))
  const [svgSource, setSvgSource] = useState('')
  const [scale, setScale] = useState('2')
  const [transparent, setTransparent] = useState(true)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => setSvgSource((e.target?.result as string) || '')
    reader.readAsText(f)
  }

  const convert = () => {
    setError('')
    if (!svgSource.trim()) { setError(t('svgPng.error')); return }
    try {
      const blob = new Blob([svgSource], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const s = parseFloat(scale) || 1
        const canvas = document.createElement('canvas')
        canvas.width = (img.naturalWidth || 300) * s
        canvas.height = (img.naturalHeight || 300) * s
        const ctx = canvas.getContext('2d')!
        if (!transparent) {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        try {
          setResult(canvas.toDataURL('image/png'))
        } catch {
          setError('Canvas is tainted — SVG may reference external resources')
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        setError(t('svgPng.error'))
      }
      img.src = url
    } catch {
      setError(t('svgPng.error'))
    }
  }

  const download = () => {
    if (result) downloadDataUrl(result, 'converted.png')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('svgPng.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('svgPng.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <FileDropzone accept="image/svg+xml,.svg" onFile={handleFile} label={t('svgPng.dropSvg')} />
        <Textarea
          label={t('svgPng.pasteSvg')}
          value={svgSource}
          onChange={(e) => setSvgSource(e.target.value)}
          rows={6}
          placeholder='<svg xmlns="http://www.w3.org/2000/svg">…</svg>'
          className="font-mono text-xs"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('svgPng.scale')} type="number" value={scale} onChange={(e) => setScale(e.target.value)} min="0.1" step="0.5" />
          <div>
            <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('svgPng.background')}</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              disabled={transparent}
              className="w-full h-10 rounded-lg cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
        <Checkbox label={t('svgPng.transparent')} checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
        <Button onClick={convert} className="w-full">{t('svgPng.convert')}</Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </Card>

      {result && (
        <Card className="space-y-3">
          <img src={result} alt="Preview" className="max-h-64 mx-auto block bg-base-200 rounded-lg" />
          <Button onClick={download} variant="outline" className="w-full">
            <Download size={14} /> {t('svgPng.download')}
          </Button>
        </Card>
      )}
    </div>
  )
}
