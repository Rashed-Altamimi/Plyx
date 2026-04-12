import { useState } from 'react'
import { useTranslation } from 'react-i18next'
// @ts-expect-error - exifr mini build has no types
import exifr from 'exifr/dist/mini.esm.mjs'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

export function ExifViewer() {
  const { t } = useTranslation()
  useDocumentTitle(t('exif.title'))
  const [file, setFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFile = async (f: File) => {
    setFile(f)
    setMetadata(null)
    setError('')
    setLoading(true)
    try {
      const result = await exifr.parse(f, true)
      if (!result || Object.keys(result).length === 0) {
        setError(t('exif.noMetadata'))
      } else {
        setMetadata(result)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse EXIF')
    } finally {
      setLoading(false)
    }
  }

  const displayFields = metadata
    ? [
        { label: t('exif.camera'), value: [metadata.Make, metadata.Model].filter(Boolean).join(' ') },
        { label: t('exif.lens'), value: metadata.LensModel || metadata.LensInfo },
        { label: t('exif.exposure'), value: metadata.ExposureTime && `${metadata.ExposureTime}s @ f/${metadata.FNumber}` },
        { label: t('exif.iso'), value: metadata.ISO },
        { label: t('exif.focalLength'), value: metadata.FocalLength && `${metadata.FocalLength}mm` },
        { label: t('exif.dateTaken'), value: metadata.DateTimeOriginal && new Date(metadata.DateTimeOriginal as string).toLocaleString() },
        { label: t('exif.dimensions'), value: metadata.ImageWidth && `${metadata.ImageWidth} × ${metadata.ImageHeight}` },
        { label: t('exif.gps'), value: metadata.latitude && metadata.longitude && `${(metadata.latitude as number).toFixed(5)}, ${(metadata.longitude as number).toFixed(5)}` },
      ].filter((f) => f.value)
    : []

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('exif.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('exif.subtitle')}</p>

      {!file ? (
        <FileDropzone accept="image/*" onFile={handleFile} label={t('exif.dropImage')} hint="JPG / HEIC / TIFF" />
      ) : (
        <div className="space-y-4">
          <Card className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70 truncate">{file.name}</p>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setMetadata(null); setError('') }}>
              {t('common.change')}
            </Button>
          </Card>

          {loading && <Card><p className="text-sm text-base-content/50 text-center py-4">{t('common.loading')}</p></Card>}
          {error && <Card><p className="text-sm text-red-500 text-center py-4">{error}</p></Card>}

          {metadata && displayFields.length > 0 && (
            <>
              <div className="space-y-2">
                {displayFields.map(({ label, value }) => (
                  <Card key={label} className="flex items-center justify-between py-3">
                    <p className="text-sm text-base-content/60">{label}</p>
                    <p className="text-sm font-semibold text-base-content">{String(value)}</p>
                  </Card>
                ))}
              </div>

              <Card className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-base-content/70">Full metadata</p>
                  <CopyButton text={JSON.stringify(metadata, null, 2)} />
                </div>
                <pre className="text-xs font-mono text-base-content bg-base-200 rounded-lg p-3 overflow-auto max-h-64">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
