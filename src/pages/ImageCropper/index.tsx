import { useState, useEffect, useRef, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { loadImageFromFile, downloadDataUrl } from '../../utils/canvasImage'

type Aspect = 'free' | '1:1' | '16:9' | '4:3' | '3:2'

const ASPECTS: Record<Aspect, number | null> = {
  free: null,
  '1:1': 1,
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
}

interface Rect { x: number; y: number; w: number; h: number }

export function ImageCropper() {
  const { t } = useTranslation()
  useDocumentTitle(t('crop.title'))
  const [file, setFile] = useState<File | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [rect, setRect] = useState<Rect>({ x: 50, y: 50, w: 200, h: 200 })
  const [aspect, setAspect] = useState<Aspect>('free')
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ mode: 'move' | 'resize' | null; startX: number; startY: number; orig: Rect }>({ mode: null, startX: 0, startY: 0, orig: rect })

  const handleFile = async (f: File) => {
    setFile(f)
    const image = await loadImageFromFile(f)
    setImg(image)
    // Fit to 600px max width
    const maxW = 600
    const scale = image.naturalWidth > maxW ? maxW / image.naturalWidth : 1
    const dw = image.naturalWidth * scale
    const dh = image.naturalHeight * scale
    setDisplaySize({ w: dw, h: dh })
    setRect({ x: dw * 0.1, y: dh * 0.1, w: dw * 0.8, h: dh * 0.8 })
  }

  // Enforce aspect ratio when changed
  useEffect(() => {
    const ratio = ASPECTS[aspect]
    if (ratio === null || !img) return
    setRect((r) => ({ ...r, h: r.w / ratio }))
  }, [aspect, img])

  const onPointerDown = (mode: 'move' | 'resize') => (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    drag.current = { mode, startX: e.clientX, startY: e.clientY, orig: { ...rect } }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.mode) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    const orig = drag.current.orig
    if (drag.current.mode === 'move') {
      const nx = Math.max(0, Math.min(displaySize.w - orig.w, orig.x + dx))
      const ny = Math.max(0, Math.min(displaySize.h - orig.h, orig.y + dy))
      setRect({ ...orig, x: nx, y: ny })
    } else {
      let nw = Math.max(20, Math.min(displaySize.w - orig.x, orig.w + dx))
      const ratio = ASPECTS[aspect]
      let nh = ratio ? nw / ratio : Math.max(20, Math.min(displaySize.h - orig.y, orig.h + dy))
      if (orig.y + nh > displaySize.h) {
        nh = displaySize.h - orig.y
        if (ratio) nw = nh * ratio
      }
      setRect({ ...orig, w: nw, h: nh })
    }
  }

  const onPointerUp = () => { drag.current.mode = null }

  const cropAndDownload = () => {
    if (!img || !file) return
    const scale = img.naturalWidth / displaySize.w
    const sx = rect.x * scale
    const sy = rect.y * scale
    const sw = rect.w * scale
    const sh = rect.h * scale

    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    const base = file.name.replace(/\.[^.]+$/, '')
    downloadDataUrl(canvas.toDataURL('image/png'), `${base}_cropped.png`)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('crop.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('crop.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('crop.dropImage')} hint="PNG, JPG, WEBP" />
      ) : (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setImg(null) }}>
                {t('common.change')}
              </Button>
            </div>
            <div
              ref={containerRef}
              className="relative bg-base-200 rounded-lg inline-block select-none touch-none"
              style={{ width: displaySize.w, height: displaySize.h }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {img && (
                <img
                  src={img.src}
                  alt=""
                  className="block pointer-events-none"
                  style={{ width: displaySize.w, height: displaySize.h }}
                />
              )}
              <div
                className="absolute border-2 border-primary cursor-move"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}
                onPointerDown={onPointerDown('move')}
              >
                <div
                  className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary rounded-sm cursor-se-resize"
                  onPointerDown={onPointerDown('resize')}
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Select label={t('crop.aspect')} value={aspect} onChange={(e) => setAspect(e.target.value as Aspect)}>
              <option value="free">{t('crop.free')}</option>
              <option value="1:1">{t('crop.square')}</option>
              <option value="16:9">{t('crop.sixteenNine')}</option>
              <option value="4:3">{t('crop.fourThree')}</option>
              <option value="3:2">{t('crop.threeTwo')}</option>
            </Select>
            <Button onClick={cropAndDownload} className="w-full">
              <Download size={14} /> {t('crop.cropBtn')}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
