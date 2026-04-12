import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

interface PickedColor {
  hex: string
  rgb: [number, number, number]
  x: number
  y: number
}

export function ColorPicker() {
  const { t } = useTranslation()
  useDocumentTitle(t('colorPick.title'))

  const [file, setFile] = useState<File | null>(null)
  const [, setImageSrc] = useState<string | null>(null)
  const [colors, setColors] = useState<PickedColor[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setColors([])
    const url = URL.createObjectURL(f)
    setImageSrc(url)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      // Scale down for display while keeping full resolution for picking
      const maxW = 640
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      ctxRef.current = ctx
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const pick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()

    setColors((prev) => [{ hex, rgb: [r, g, b], x, y }, ...prev.slice(0, 9)])
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('colorPick.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('colorPick.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('colorPick.dropImage')} hint="PNG, JPG, WEBP" />
      ) : (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImageSrc(null); setColors([]) }}>{t('common.change')}</Button>
            </div>
            <p className="text-xs text-base-content/40">{t('colorPick.clickToPick')}</p>
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg cursor-crosshair border border-base-300"
              onClick={pick}
            />
          </Card>

          {colors.length > 0 && (
            <Card>
              <p className="text-sm font-medium text-base-content/70 mb-3">{t('colorPick.pickedColors')}</p>
              <div className="space-y-2">
                {colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 bg-base-200 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-lg border border-base-300 shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-base-content">{c.hex}</p>
                      <p className="text-xs text-base-content/40">rgb({c.rgb.join(', ')})</p>
                    </div>
                    <CopyButton text={c.hex} size="sm" />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Hidden canvas for initial render */}
      {!file && <canvas ref={canvasRef} className="hidden" />}
    </div>
  )
}
