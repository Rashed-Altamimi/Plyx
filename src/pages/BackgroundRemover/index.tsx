import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'

type Status =
  | { phase: 'idle' }
  | { phase: 'loading'; msg: string; progress: number }
  | { phase: 'processing' }
  | { phase: 'done' }
  | { phase: 'error'; msg: string }

export function BackgroundRemover() {
  const { t } = useTranslation()
  useDocumentTitle(t('bgRemove.title'))

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>({ phase: 'idle' })

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const reset = () => {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setResult(null)
    setStatus({ phase: 'idle' })
  }

  const handleFile = (f: File) => {
    reset()
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const run = async () => {
    if (!file) return
    try {
      setStatus({ phase: 'loading', msg: t('bgRemove.loadingModel'), progress: 0 })

      // Lazy-load transformers.js only on click. Configures WASM backend.
      const { pipeline, RawImage, env } = await import('@huggingface/transformers')
      env.allowLocalModels = false

      const segmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (p: any) => {
          if (p?.status === 'progress' && typeof p.progress === 'number') {
            setStatus({ phase: 'loading', msg: `${p.status} · ${p.file ?? ''}`, progress: p.progress / 100 })
          } else if (p?.status) {
            setStatus({ phase: 'loading', msg: p.status, progress: 0 })
          }
        },
      })

      setStatus({ phase: 'processing' })
      const url = URL.createObjectURL(file)
      const image = await RawImage.fromURL(url)
      URL.revokeObjectURL(url)

      const output = await segmenter(image)
      const mask = Array.isArray(output) ? output[0]?.mask : null
      if (!mask) throw new Error('No mask returned')

      // Composite mask onto original: RGBA with alpha from mask
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')

      // Draw the original image
      const bitmap = await createImageBitmap(await (await fetch(URL.createObjectURL(file))).blob())
      ctx.drawImage(bitmap, 0, 0)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Apply mask as alpha channel
      const maskData = mask.data
      for (let i = 0; i < maskData.length; i++) {
        pixels.data[4 * i + 3] = maskData[i]
      }
      ctx.putImageData(pixels, 0, 0)

      setResult(canvas.toDataURL('image/png'))
      setStatus({ phase: 'done' })
    } catch (e) {
      setStatus({ phase: 'error', msg: (e as Error).message || t('bgRemove.failed') })
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result
    a.download = file ? `${file.name.replace(/\.[^.]+$/, '')}_no-bg.png` : 'no-bg.png'
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('bgRemove.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('bgRemove.subtitle')}</p>
      <p className="text-xs text-amber-500/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mb-6">
        {t('bgRemove.firstRunNotice')}
      </p>

      {!file ? (
        <FileDropzone
          accept="image/*"
          onFile={handleFile}
          label={t('bgRemove.dropImage')}
          hint={t('bgRemove.hint')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={reset}>{t('common.change')}</Button>
            </div>
            <div className="flex items-center justify-center h-64 rounded-lg bg-base-100/40 border border-base-content/10 p-2">
              {preview && <img src={preview} alt={t('bgRemove.uploadedAlt')} className="max-h-full max-w-full object-contain" />}
            </div>
            <Button
              onClick={run}
              disabled={status.phase === 'loading' || status.phase === 'processing'}
              className="w-full"
            >
              {status.phase === 'loading' ? t('bgRemove.loading')
                : status.phase === 'processing' ? t('bgRemove.processing')
                : t('bgRemove.remove')}
            </Button>
            {status.phase === 'loading' && (
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-base-content/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-[width]"
                    style={{ width: `${Math.round(status.progress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-base-content/50 truncate">{status.msg}</p>
              </div>
            )}
            {status.phase === 'error' && (
              <p className="text-xs text-red-500">{status.msg}</p>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-medium text-base-content/70">{t('bgRemove.result')}</p>
            <div
              className="flex items-center justify-center h-64 rounded-lg border border-base-content/10 p-2 bg-[conic-gradient(at_0_0,#444_0_25%,#222_0_50%,#444_0_75%,#222_0)] bg-[length:20px_20px]"
            >
              {result
                ? <img src={result} alt={t('bgRemove.resultAlt')} className="max-h-full max-w-full object-contain" />
                : <p className="text-xs text-base-content/40">{t('bgRemove.waiting')}</p>
              }
            </div>
            {result && (
              <Button variant="outline" onClick={download} className="w-full">
                <Download size={14} /> {t('common.download')} PNG
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
