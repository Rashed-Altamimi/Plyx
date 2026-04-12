import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SparkMD5 from 'spark-md5'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import { Tabs } from '../../components/ui/Tabs'
import { FileDropzone } from '../../components/ui/FileDropzone'

type Mode = 'text' | 'file'

async function sha(algo: string, data: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashText(text: string): Promise<Record<string, string>> {
  const enc = new TextEncoder()
  const buf = enc.encode(text).buffer as ArrayBuffer
  const [sha1, sha256, sha512] = await Promise.all([
    sha('SHA-1', buf),
    sha('SHA-256', buf),
    sha('SHA-512', buf),
  ])
  return {
    MD5: SparkMD5.hash(text),
    'SHA-1': sha1,
    'SHA-256': sha256,
    'SHA-512': sha512,
  }
}

async function hashFile(file: File): Promise<Record<string, string>> {
  const buf = await file.arrayBuffer()
  const [sha1, sha256, sha512] = await Promise.all([
    sha('SHA-1', buf),
    sha('SHA-256', buf),
    sha('SHA-512', buf),
  ])
  const md5 = SparkMD5.ArrayBuffer.hash(buf)
  return { MD5: md5, 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-512': sha512 }
}

export function HashGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('hash.title'))
  const [mode, setMode] = useState<Mode>('text')

  const TABS = [{ id: 'text', label: t('hash.text') }, { id: 'file', label: t('hash.file') }]
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const result = mode === 'text' ? await hashText(input) : await hashFile(file!)
      setHashes(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('hash.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('hash.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Tabs tabs={TABS} active={mode} onChange={(id) => { setMode(id as Mode); setHashes(null) }} />

        {mode === 'text' ? (
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} label={t('hash.inputText')} rows={4} placeholder={t('hash.placeholder')} />
        ) : (
          file ? (
            <div className="flex items-center justify-between rounded-lg bg-base-200 border border-base-200 px-4 py-3">
              <p className="text-sm text-base-content/70 truncate">{file.name}</p>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setHashes(null) }}>{t('common.change')}</Button>
            </div>
          ) : (
            <FileDropzone onFile={(f) => { setFile(f); setHashes(null) }} label={t('hash.dropFile')} />
          )
        )}

        <Button onClick={generate} disabled={loading || (mode === 'text' ? !input : !file)} className="w-full">
          {loading ? t('hash.generating') : t('hash.generateHashes')}
        </Button>
      </Card>

      {hashes && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <Card key={algo} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-base-content/40">{algo}</p>
                <CopyButton text={hash} />
              </div>
              <code className="text-xs font-mono text-base-content break-all">{hash}</code>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
