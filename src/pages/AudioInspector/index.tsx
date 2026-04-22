import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { FileDropzone } from '../../components/ui/FileDropzone'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

interface Meta {
  name: string
  type: string
  size: number
  duration: number
  sampleRate: number
  channels: number
  peaks: number[]
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function AudioInspector() {
  const { t } = useTranslation()
  useDocumentTitle(t('audio.title'))

  const [meta, setMeta] = useState<Meta | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [url])

  // Paint waveform whenever meta changes
  useEffect(() => {
    if (!meta || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, w, h)

    const peaks = meta.peaks
    const barWidth = w / peaks.length
    const mid = h / 2
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'oklch(70% 0.18 310)')
    g.addColorStop(1, 'oklch(65% 0.22 285)')
    ctx.fillStyle = g
    for (let i = 0; i < peaks.length; i++) {
      const barH = Math.max(1, peaks[i] * mid)
      ctx.fillRect(i * barWidth + 0.5, mid - barH, Math.max(1, barWidth - 1), barH * 2)
    }
  }, [meta])

  const handleFile = async (file: File) => {
    setBusy(true)
    setError('')
    setMeta(null)
    if (url) URL.revokeObjectURL(url)
    const newUrl = URL.createObjectURL(file)
    setUrl(newUrl)

    try {
      // WebKit / Safari prefix fallback
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) throw new Error('AudioContext unavailable')
      const audioCtx = new Ctx()
      const buffer = await file.arrayBuffer()
      const audio = await audioCtx.decodeAudioData(buffer.slice(0))

      // Compute peak bins — downsample the first channel into N bars.
      const BARS = 240
      const samples = audio.getChannelData(0)
      const blockSize = Math.max(1, Math.floor(samples.length / BARS))
      const peaks: number[] = []
      for (let i = 0; i < BARS; i++) {
        let peak = 0
        const start = i * blockSize
        const end = Math.min(start + blockSize, samples.length)
        for (let j = start; j < end; j++) {
          const v = Math.abs(samples[j])
          if (v > peak) peak = v
        }
        peaks.push(peak)
      }

      setMeta({
        name: file.name,
        type: file.type || 'audio/unknown',
        size: file.size,
        duration: audio.duration,
        sampleRate: audio.sampleRate,
        channels: audio.numberOfChannels,
        peaks,
      })
      audioCtx.close()
    } catch (e) {
      setError((e as Error).message || t('audio.failed'))
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    setMeta(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('audio.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('audio.subtitle')}</p>

      {!meta && !busy && !error && (
        <FileDropzone
          accept="audio/*"
          onFile={handleFile}
          label={t('audio.dropAudio')}
          hint={t('audio.hint')}
        />
      )}

      {busy && (
        <Card className="text-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-primary/25 border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-sm text-base-content/60">{t('audio.decoding')}</p>
        </Card>
      )}

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <Button variant="ghost" size="sm" onClick={reset}>{t('common.change')}</Button>
        </Card>
      )}

      {meta && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-base-content truncate">{meta.name}</p>
                <p className="text-xs text-base-content/40">{meta.type}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>{t('common.change')}</Button>
            </div>

            <canvas ref={canvasRef} className="w-full h-32 rounded-lg bg-base-100/60 border border-base-content/10" />

            {url && (
              <audio ref={audioRef} controls src={url} className="w-full">
                Your browser doesn't support audio playback.
              </audio>
            )}
          </Card>

          <Card>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label={t('audio.duration')} value={formatDuration(meta.duration)} />
              <Stat label={t('audio.sampleRate')} value={`${(meta.sampleRate / 1000).toFixed(1)} kHz`} />
              <Stat label={t('audio.channels')} value={String(meta.channels)} />
              <Stat label={t('audio.size')} value={formatBytes(meta.size)} />
            </div>
          </Card>

          <Card className="flex flex-wrap items-center gap-2">
            <Badge color="blue">{meta.type}</Badge>
            <Badge color="gray">{meta.channels === 1 ? 'Mono' : meta.channels === 2 ? 'Stereo' : `${meta.channels}ch`}</Badge>
            <Badge color="gray">{`${meta.sampleRate} Hz`}</Badge>
            <span className="ms-auto text-[10px] text-base-content/40 tracking-wide">
              {t('audio.clientOnly')}
            </span>
          </Card>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-base-content/50 mb-1">{label}</p>
      <p className="text-sm font-mono tabular-nums text-base-content">{value}</p>
    </div>
  )
}
