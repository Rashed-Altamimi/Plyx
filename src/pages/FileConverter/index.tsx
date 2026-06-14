import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Tabs } from '../../components/ui/Tabs'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Select } from '../../components/ui/Select'
import { Slider } from '../../components/ui/Slider'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Checkbox } from '../../components/ui/Checkbox'
import { CopyButton } from '../../components/ui/CopyButton'
import {
  convertImage,
  convertData,
  detectDataFormat,
  supportsWebp,
  type ImageFormat,
  type DataFormat,
} from '../../utils/fileConverter'
import { xlsxToData, dataToXlsx } from '../../utils/xlsxConverter'

function ImageConverter() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg')
  const [quality, setQuality] = useState(92)
  const [result, setResult] = useState<{ dataUrl: string; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const webpSupported = supportsWebp()

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')
    setPreview(URL.createObjectURL(f))
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await convertImage(file, targetFormat, quality / 100)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = result.filename
    a.click()
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <FileDropzone
          accept="image/*"
          onFile={handleFile}
          label={t('files.dropImage')}
          hint={t('files.imageHint')}
        />
      ) : (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview(null); setResult(null) }}>
              {t('common.change')}
            </Button>
          </div>
          {preview && (
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain mx-auto border border-base-200" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select label={t('files.outputFormat')} value={targetFormat} onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              {webpSupported && <option value="image/webp">WEBP</option>}
            </Select>
            {targetFormat !== 'image/png' && (
              <Slider label={t('files.quality')} min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            )}
          </div>

          <Button onClick={convert} disabled={loading} className="w-full">
            {loading ? t('files.converting') : t('files.convertImage')}
          </Button>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <div className="space-y-3">
              <img src={result.dataUrl} alt="Converted" className="max-h-48 rounded-lg object-contain mx-auto border border-base-200" />
              <Button onClick={download} variant="outline" className="w-full">
                <Download size={14} /> Download {result.filename}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

type FileFormat = DataFormat | 'xlsx'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const FORMAT_OPTIONS: { value: FileFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv',  label: 'CSV' },
  { value: 'tsv',  label: 'TSV' },
  { value: 'xml',  label: 'XML' },
  { value: 'xlsx', label: 'XLSX (Excel)' },
]

function triggerDownload(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function DataConverter() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [fromFormat, setFromFormat] = useState<FileFormat>('json')
  const [toFormat, setToFormat] = useState<FileFormat>('csv')
  const [output, setOutput] = useState('')
  const [xlsxIn, setXlsxIn] = useState<{ buffer: ArrayBuffer; name: string } | null>(null)
  const [xlsxOut, setXlsxOut] = useState<Uint8Array | null>(null)
  const [hasHeader, setHasHeader] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetResults = () => { setOutput(''); setXlsxOut(null); setError('') }

  const handleFile = (f: File) => {
    resetResults()
    const isXlsx = /\.xlsx?$/i.test(f.name) || f.type.includes('spreadsheet')
    const reader = new FileReader()
    if (isXlsx) {
      reader.onload = (e) => {
        setXlsxIn({ buffer: e.target?.result as ArrayBuffer, name: f.name })
        setFromFormat('xlsx')
        setInput('')
      }
      reader.onerror = () => setError(t('files.readFailed'))
      reader.readAsArrayBuffer(f)
    } else {
      const ext = f.name.split('.').pop()?.toLowerCase()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setInput(text)
        setXlsxIn(null)
        const detected = ext === 'tsv' || ext === 'tab' ? 'tsv' : detectDataFormat(text)
        if (detected) setFromFormat(detected)
      }
      reader.onerror = () => setError(t('files.readFailed'))
      reader.readAsText(f)
    }
  }

  const convert = async () => {
    resetResults()
    setLoading(true)
    try {
      if (fromFormat === 'xlsx') {
        if (!xlsxIn) throw new Error(t('files.needXlsx'))
        if (toFormat === 'xlsx') setXlsxOut(new Uint8Array(xlsxIn.buffer))
        else setOutput(await xlsxToData(xlsxIn.buffer, toFormat, hasHeader))
      } else if (toFormat === 'xlsx') {
        setXlsxOut(await dataToXlsx(input.trim(), fromFormat, hasHeader))
      } else {
        setOutput(convertData(input.trim(), fromFormat, toFormat, hasHeader))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadText = () => {
    const ext = toFormat === 'json' ? 'json' : toFormat === 'csv' ? 'csv' : toFormat === 'tsv' ? 'tsv' : 'xml'
    const mime =
      toFormat === 'json' ? 'application/json'
      : toFormat === 'csv' ? 'text/csv'
      : toFormat === 'tsv' ? 'text/tab-separated-values'
      : 'application/xml'
    triggerDownload(new Blob([output], { type: mime }), `converted.${ext}`)
  }

  const downloadXlsx = () => {
    if (!xlsxOut) return
    triggerDownload(new Blob([new Uint8Array(xlsxOut)], { type: XLSX_MIME }), 'converted.xlsx')
  }

  return (
    <div className="space-y-4">
      <Card>
        <FileDropzone
          accept=".json,.csv,.tsv,.tab,.xml,.txt,.xlsx,.xls"
          onFile={handleFile}
          label={t('files.dropData')}
          hint={t('files.dataHint')}
        />
      </Card>

      <Card className="space-y-4">
        {fromFormat === 'xlsx' ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-base-content/60 tracking-wide">{t('common.input')}</span>
            {xlsxIn ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-base-content/10 bg-base-100/60 px-3 py-2.5">
                <span className="text-sm text-base-content/80 truncate">{xlsxIn.name}</span>
                <Button variant="ghost" size="sm" onClick={() => { setXlsxIn(null); setFromFormat('json'); resetResults() }}>
                  {t('common.change')}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-base-content/50 rounded-lg border border-dashed border-base-content/15 px-3 py-3">
                {t('files.needXlsx')}
              </p>
            )}
          </div>
        ) : (
          <Textarea
            label={t('common.input')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or drop your data here…"
            rows={8}
            className="font-mono text-xs"
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select label={t('files.from')} value={fromFormat} onChange={(e) => { setFromFormat(e.target.value as FileFormat); resetResults() }}>
            {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
          <Select label={t('files.to')} value={toFormat} onChange={(e) => { setToFormat(e.target.value as FileFormat); resetResults() }}>
            {FORMAT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
        </div>

        <Checkbox
          label={t('files.hasHeader')}
          checked={hasHeader}
          onChange={(e) => { setHasHeader(e.target.checked); resetResults() }}
        />

        <Button onClick={convert} disabled={loading} className="w-full">
          {loading ? t('files.converting') : t('common.convert')}
        </Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </Card>

      {toFormat === 'xlsx' ? (
        xlsxOut && (
          <Card className="space-y-3">
            <p className="text-sm font-medium text-base-content/70">{t('files.xlsxReady')}</p>
            <Button variant="outline" onClick={downloadXlsx} className="w-full">
              <Download size={14} /> converted.xlsx
            </Button>
          </Card>
        )
      ) : (
        output && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-base-content/70">{t('common.output')}</p>
              <div className="flex gap-2">
                <CopyButton text={output} />
                <Button variant="outline" size="sm" onClick={downloadText}>
                  <Download size={14} /> {t('common.download')}
                </Button>
              </div>
            </div>
            <Textarea value={output} readOnly rows={10} className="font-mono text-xs" />
          </Card>
        )
      )}
    </div>
  )
}

export function FileConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('files.title'))
  const [tab, setTab] = useState('image')

  const TABS = [
    { id: 'image', label: t('files.images') },
    { id: 'data',  label: t('files.data') },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('files.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('files.subtitle')}</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'image' && <ImageConverter />}
      {tab === 'data'  && <DataConverter />}
    </div>
  )
}
