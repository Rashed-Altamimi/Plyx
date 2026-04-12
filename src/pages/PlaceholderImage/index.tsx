import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { downloadDataUrl } from '../../utils/canvasImage'

export function PlaceholderImage() {
  const { t } = useTranslation()
  useDocumentTitle(t('placeholder.title'))
  const [width, setWidth] = useState('600')
  const [height, setHeight] = useState('400')
  const [bgColor, setBgColor] = useState('#E5E7EB')
  const [fgColor, setFgColor] = useState('#6B7280')
  const [text, setText] = useState('')
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = parseInt(width) || 1
    const h = parseInt(height) || 1
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = fgColor
    const label = text || `${w} × ${h}`
    const fontSize = Math.max(12, Math.min(w, h) * 0.12)
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, w / 2, h / 2)
  }, [width, height, bgColor, fgColor, text])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
    const dataUrl = canvas.toDataURL(mime, 0.92)
    downloadDataUrl(dataUrl, `placeholder_${width}x${height}.${format}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('placeholder.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('placeholder.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('placeholder.width')} type="number" value={width} onChange={(e) => setWidth(e.target.value)} min="1" />
          <Input label={t('placeholder.height')} type="number" value={height} onChange={(e) => setHeight(e.target.value)} min="1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('placeholder.bgColor')}</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('placeholder.fgColor')}</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <Input label={t('placeholder.text')} value={text} onChange={(e) => setText(e.target.value)} placeholder={`${width} × ${height}`} />
        <Select label={t('placeholder.format')} value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg' | 'webp')}>
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
          <option value="webp">WEBP</option>
        </Select>
      </Card>

      <Card className="space-y-3">
        <label className="text-sm font-medium text-base-content/70">{t('gradient.preview')}</label>
        <div className="bg-base-200 rounded-lg p-4 overflow-auto">
          <canvas ref={canvasRef} className="max-w-full max-h-96 mx-auto block" />
        </div>
        <Button onClick={download} variant="outline" className="w-full">
          <Download size={14} /> {t('placeholder.download')}
        </Button>
      </Card>
    </div>
  )
}
