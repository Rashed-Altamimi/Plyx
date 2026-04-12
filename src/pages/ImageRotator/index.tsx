import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2 } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { loadImageFromFile, downloadDataUrl } from '../../utils/canvasImage'

export function ImageRotator() {
  const { t } = useTranslation()
  useDocumentTitle(t('rotate.title'))
  const [file, setFile] = useState<File | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    const image = await loadImageFromFile(f)
    setImg(image)
  }

  useEffect(() => {
    if (!img || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const rotated = rotation % 180 !== 0
    canvas.width = rotated ? img.naturalHeight : img.naturalWidth
    canvas.height = rotated ? img.naturalWidth : img.naturalHeight

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()
  }, [img, rotation, flipH, flipV])

  const rotate = (deg: number) => setRotation((r) => (r + deg + 360) % 360)

  const download = () => {
    if (!canvasRef.current || !file) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const base = file.name.replace(/\.[^.]+$/, '')
    downloadDataUrl(dataUrl, `${base}_transformed.png`)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('rotate.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('rotate.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('rotate.dropImage')} hint="PNG, JPG, WEBP" />
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImg(null) }}>
                {t('common.change')}
              </Button>
            </div>
            <div className="bg-base-200 rounded-lg p-4 overflow-auto">
              <canvas ref={canvasRef} className="max-w-full max-h-96 mx-auto block" />
            </div>
          </Card>

          <Card className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button variant="outline" onClick={() => rotate(-90)}>
              <RotateCcw size={14} /> 90°
            </Button>
            <Button variant="outline" onClick={() => rotate(90)}>
              <RotateCw size={14} /> 90°
            </Button>
            <Button variant="outline" onClick={() => rotate(180)}>
              180°
            </Button>
            <Button variant={flipH ? 'primary' : 'outline'} onClick={() => setFlipH(!flipH)}>
              <FlipHorizontal2 size={14} />
            </Button>
            <Button variant={flipV ? 'primary' : 'outline'} onClick={() => setFlipV(!flipV)}>
              <FlipVertical2 size={14} />
            </Button>
          </Card>

          <Button onClick={download} className="w-full">
            <Download size={14} /> {t('rotate.download')}
          </Button>
        </div>
      )}
    </div>
  )
}
