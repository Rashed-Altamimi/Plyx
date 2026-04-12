import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { Checkbox } from '../../components/ui/Checkbox'
import { Badge } from '../../components/ui/Badge'

export function ImageResizer() {
  const { t } = useTranslation()
  useDocumentTitle(t('resize.title'))

  const MODE_TABS = [
    { id: 'pixels', label: t('resize.pixels') },
    { id: 'percent', label: t('resize.percentageMode') },
  ]

  const [file, setFile] = useState<File | null>(null)
  const [origW, setOrigW] = useState(0)
  const [origH, setOrigH] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)

  const [mode, setMode] = useState('pixels')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [pct, setPct] = useState('50')
  const [lockRatio, setLockRatio] = useState(true)

  const [result, setResult] = useState<string | null>(null)
  const [resultName, setResultName] = useState('')
  const [resultSize, setResultSize] = useState('')
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new Image()
    img.onload = () => {
      setOrigW(img.naturalWidth)
      setOrigH(img.naturalHeight)
      setWidth(String(img.naturalWidth))
      setHeight(String(img.naturalHeight))
      imgRef.current = img
    }
    img.src = url
  }

  const handleWidthChange = (v: string) => {
    setWidth(v)
    if (lockRatio && origW && origH) {
      const ratio = origH / origW
      setHeight(String(Math.round(Number(v) * ratio)))
    }
  }

  const handleHeightChange = (v: string) => {
    setHeight(v)
    if (lockRatio && origW && origH) {
      const ratio = origW / origH
      setWidth(String(Math.round(Number(v) * ratio)))
    }
  }

  const resize = () => {
    if (!imgRef.current) return
    let w: number, h: number
    if (mode === 'percent') {
      const p = Number(pct) / 100
      w = Math.round(origW * p)
      h = Math.round(origH * p)
    } else {
      w = Number(width) || origW
      h = Number(height) || origH
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(imgRef.current, 0, 0, w, h)

    const dataUrl = canvas.toDataURL('image/png')
    const baseName = file!.name.replace(/\.[^.]+$/, '')
    setResult(dataUrl)
    setResultName(`${baseName}_${w}x${h}.png`)
    setResultSize(`${w} x ${h}`)
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result
    a.download = resultName
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('resize.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('resize.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('resize.dropImage')} hint="PNG, JPG, WEBP" />
      ) : (
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
                <p className="text-xs text-base-content/40">{origW} x {origH} px</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); setResult(null) }}>{t('common.change')}</Button>
            </div>
            {preview && <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain mx-auto border border-base-200" />}
          </Card>

          <Card className="space-y-4">
            <Tabs tabs={MODE_TABS} active={mode} onChange={setMode} />

            {mode === 'pixels' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('resize.widthPx')} type="number" value={width} onChange={(e) => handleWidthChange(e.target.value)} min="1" />
                  <Input label={t('resize.heightPx')} type="number" value={height} onChange={(e) => handleHeightChange(e.target.value)} min="1" />
                </div>
                <Checkbox label={t('resize.lockRatio')} checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} />
              </>
            ) : (
              <Input label={t('resize.scalePct')} type="number" value={pct} onChange={(e) => setPct(e.target.value)} min="1" max="500" />
            )}

            <Button onClick={resize} className="w-full">{t('resize.resizeBtn')}</Button>
          </Card>

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-base-content/70">{t('common.result')}</p>
                <Badge color="blue">{resultSize}</Badge>
              </div>
              <img src={result} alt="Resized" className="max-h-48 rounded-lg object-contain mx-auto border border-base-200" />
              <Button onClick={download} variant="outline" className="w-full">
                <Download size={14} /> Download {resultName}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
