import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Shuffle } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Slider } from '../../components/ui/Slider'
import { CopyButton } from '../../components/ui/CopyButton'

interface Stop { color: string; position: number }

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

export function GradientGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('gradient.title'))
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<Stop[]>([
    { color: '#667eea', position: 0 },
    { color: '#764ba2', position: 100 },
  ])

  const css = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position)
    const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ')
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopStr})`
    }
    return `radial-gradient(circle, ${stopStr})`
  }, [type, angle, stops])

  const updateStop = (i: number, patch: Partial<Stop>) => {
    const next = [...stops]
    next[i] = { ...next[i], ...patch }
    setStops(next)
  }

  const addStop = () => {
    setStops([...stops, { color: randomHex(), position: 50 }])
  }

  const removeStop = (i: number) => {
    if (stops.length <= 2) return
    setStops(stops.filter((_, idx) => idx !== i))
  }

  const randomize = () => {
    setStops(stops.map((s) => ({ ...s, color: randomHex() })))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('gradient.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('gradient.subtitle')}</p>

      <Card className="mb-4">
        <div className="w-full h-48 rounded-xl border border-base-200" style={{ background: css }} />
      </Card>

      <Card className="space-y-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label={t('gradient.type')} value={type} onChange={(e) => setType(e.target.value as 'linear' | 'radial')}>
            <option value="linear">{t('gradient.linear')}</option>
            <option value="radial">{t('gradient.radial')}</option>
          </Select>
          <Button variant="outline" onClick={randomize} className="self-end">
            <Shuffle size={14} /> {t('gradient.randomize')}
          </Button>
        </div>

        {type === 'linear' && (
          <Slider label={`${t('gradient.angle')} (${angle}°)`} min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-base-content/70">Stops</label>
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
                className="w-20 rounded-lg border border-base-300 bg-base-100 px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <span className="text-xs text-base-content/40">%</span>
              <span className="flex-1 font-mono text-xs text-base-content/60 truncate">{stop.color}</span>
              {stops.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removeStop(i)}>
                  <X size={14} />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addStop}>
            <Plus size={14} /> {t('gradient.addStop')}
          </Button>
        </div>
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-base-content/70">{t('gradient.css')}</label>
          <CopyButton text={`background: ${css};`} />
        </div>
        <code className="block text-xs font-mono text-base-content bg-base-200 rounded-lg p-3 break-all">
          background: {css};
        </code>
      </Card>
    </div>
  )
}
