import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { downloadDataUrl } from '../../utils/canvasImage'

type Shape = 'circle' | 'rounded' | 'square'

export function FaviconGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('favicon.title'))
  const [text, setText] = useState('P')
  const [bg, setBg] = useState('#2563EB')
  const [fg, setFg] = useState('#FFFFFF')
  const [shape, setShape] = useState<Shape>('rounded')
  const canvas16 = useRef<HTMLCanvasElement>(null)
  const canvas32 = useRef<HTMLCanvasElement>(null)
  const canvas64 = useRef<HTMLCanvasElement>(null)
  const canvas192 = useRef<HTMLCanvasElement>(null)

  const drawFavicon = (canvas: HTMLCanvasElement | null, size: number) => {
    if (!canvas) return
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = bg
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === 'rounded') {
      const r = size * 0.2
      ctx.beginPath()
      ctx.roundRect(0, 0, size, size, r)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, size, size)
    }
    ctx.fillStyle = fg
    ctx.font = `bold ${size * 0.6}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.slice(0, 2), size / 2, size / 2 + size * 0.05)
  }

  useEffect(() => {
    drawFavicon(canvas16.current, 16)
    drawFavicon(canvas32.current, 32)
    drawFavicon(canvas64.current, 64)
    drawFavicon(canvas192.current, 192)
  }, [text, bg, fg, shape])

  const download = (canvas: HTMLCanvasElement | null, size: number) => {
    if (!canvas) return
    downloadDataUrl(canvas.toDataURL('image/png'), `favicon-${size}.png`)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('favicon.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('favicon.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Input label={t('favicon.text')} value={text} onChange={(e) => setText(e.target.value)} maxLength={2} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('favicon.background')}</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('favicon.foreground')}</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>
        </div>
        <Select label={t('favicon.shape')} value={shape} onChange={(e) => setShape(e.target.value as Shape)}>
          <option value="circle">{t('favicon.circle')}</option>
          <option value="rounded">{t('favicon.rounded')}</option>
          <option value="square">{t('favicon.square')}</option>
        </Select>
      </Card>

      <Card>
        <p className="text-sm font-medium text-base-content/70 mb-4">{t('favicon.preview')}</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { ref: canvas16, size: 16 },
            { ref: canvas32, size: 32 },
            { ref: canvas64, size: 64 },
            { ref: canvas192, size: 192 },
          ].map(({ ref, size }) => (
            <div key={size} className="text-center space-y-2">
              <div className="bg-base-200 rounded-lg p-4 flex items-center justify-center h-24">
                <canvas ref={ref} style={{ width: Math.min(size, 64), height: Math.min(size, 64) }} />
              </div>
              <p className="text-xs text-base-content/50">{size}×{size}</p>
              <Button variant="outline" size="sm" onClick={() => download(ref.current, size)} className="w-full">
                <Download size={12} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
