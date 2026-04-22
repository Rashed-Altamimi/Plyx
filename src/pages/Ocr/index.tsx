import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { CopyButton } from '../../components/ui/CopyButton'
import { Badge } from '../../components/ui/Badge'

// Tesseract models. The full list is large (100+); we expose the common ones.
const LANGUAGES = [
  { code: 'eng',     label: 'English' },
  { code: 'ara',     label: 'Arabic' },
  { code: 'spa',     label: 'Spanish' },
  { code: 'fra',     label: 'French' },
  { code: 'deu',     label: 'German' },
  { code: 'ita',     label: 'Italian' },
  { code: 'por',     label: 'Portuguese' },
  { code: 'rus',     label: 'Russian' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'chi_tra', label: 'Chinese (Traditional)' },
  { code: 'jpn',     label: 'Japanese' },
  { code: 'kor',     label: 'Korean' },
  { code: 'hin',     label: 'Hindi' },
  { code: 'tur',     label: 'Turkish' },
]

export function Ocr() {
  const { t } = useTranslation()
  useDocumentTitle(t('ocr.title'))

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [lang, setLang] = useState('eng')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const workerRef = useRef<unknown | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // Tear down any running worker on unmount
  useEffect(() => {
    return () => {
      const w = workerRef.current as { terminate?: () => Promise<void> } | null
      if (w?.terminate) w.terminate()
    }
  }, [])

  const handleFile = (f: File) => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setText('')
    setError('')
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setText('')
    setError('')
  }

  const run = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setProgress(0)
    setStatus(t('ocr.loadingModel'))
    try {
      // Lazy-import on first use — keeps the main bundle lean.
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(lang, 1, {
        logger: (m: { status: string; progress: number }) => {
          setStatus(m.status)
          if (typeof m.progress === 'number') setProgress(m.progress)
        },
      })
      workerRef.current = worker
      const { data } = await worker.recognize(file)
      setText(data.text.trim())
      await worker.terminate()
      workerRef.current = null
      setStatus('')
      setProgress(1)
    } catch (e) {
      setError((e as Error).message || t('ocr.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('ocr.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('ocr.subtitle')}</p>
      <p className="text-xs text-amber-500/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mb-6">
        {t('ocr.firstRunNotice')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {!file ? (
            <FileDropzone accept="image/*" onFile={handleFile} label={t('ocr.dropImage')} hint={t('ocr.imageHint')} />
          ) : (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
                <Button variant="ghost" size="sm" onClick={reset}>{t('common.change')}</Button>
              </div>
              {preview && <img src={preview} alt={t('ocr.uploadedAlt')} className="max-h-64 rounded-lg object-contain mx-auto border border-base-content/10" />}
            </Card>
          )}

          <Card className="space-y-3">
            <Select label={t('ocr.language')} value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
            </Select>
            <Button onClick={run} disabled={!file || busy} className="w-full">
              {busy ? t('ocr.running') : t('ocr.extract')}
            </Button>
            {busy && (
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-base-content/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-base-content/50">{status} · {Math.round(progress * 100)}%</p>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </Card>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-base-content/70">{t('ocr.extractedText')}</label>
              {text && <Badge color="gray">{text.length} {t('ocr.chars')}</Badge>}
            </div>
            {text && <CopyButton text={text} />}
          </div>
          <Textarea value={text} readOnly rows={18} className="text-sm" placeholder={t('ocr.placeholder')} />
        </Card>
      </div>
    </div>
  )
}
