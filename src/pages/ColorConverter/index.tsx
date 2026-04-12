import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { CopyButton } from '../../components/ui/CopyButton'

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (full.length !== 6) return null
  const n = parseInt(full, 16)
  if (isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360, sn = s / 100, ln = l / 100
  if (sn === 0) { const v = Math.round(ln * 255); return [v, v, v] }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  return [Math.round(hue2rgb(hn + 1/3) * 255), Math.round(hue2rgb(hn) * 255), Math.round(hue2rgb(hn - 1/3) * 255)]
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100]
  const rp = r / 255, gp = g / 255, bp = b / 255
  const k = 1 - Math.max(rp, gp, bp)
  const c = (1 - rp - k) / (1 - k)
  const m = (1 - gp - k) / (1 - k)
  const y = (1 - bp - k) / (1 - k)
  return [Math.round(c * 100), Math.round(m * 100), Math.round(y * 100), Math.round(k * 100)]
}

export function ColorConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('color.title'))
  const [hex, setHex] = useState('#2563EB')
  const [hexError, setHexError] = useState('')

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const hsl = useMemo(() => rgb ? rgbToHsl(...rgb) : null, [rgb])
  const cmyk = useMemo(() => rgb ? rgbToCmyk(...rgb) : null, [rgb])

  const handleHex = (v: string) => {
    setHex(v)
    setHexError(hexToRgb(v) ? '' : t('color.invalidHex'))
  }

  const handleRgb = (field: 0 | 1 | 2, val: string) => {
    const n = parseInt(val)
    if (isNaN(n) || !rgb) return
    const next: [number, number, number] = [...rgb]
    next[field] = Math.max(0, Math.min(255, n))
    setHex(rgbToHex(...next))
    setHexError('')
  }

  const handleHsl = (field: 0 | 1 | 2, val: string) => {
    const n = parseInt(val)
    if (isNaN(n) || !hsl) return
    const next: [number, number, number] = [...hsl]
    const max = field === 0 ? 360 : 100
    next[field] = Math.max(0, Math.min(max, n))
    setHex(rgbToHex(...hslToRgb(...next)))
    setHexError('')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('color.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('color.subtitle')}</p>

      {/* Color preview */}
      <Card className="mb-4 flex items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl border border-base-300 shadow-sm" style={{ background: rgb ? hex : '#ccc' }} />
          <input
            type="color"
            value={hex.startsWith('#') && hex.length === 7 ? hex : '#000000'}
            onChange={(e) => { setHex(e.target.value.toUpperCase()); setHexError('') }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Pick color"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs text-base-content/40 mb-1">{t('color.pickColor')}</p>
          <div className="flex items-center gap-2">
            <input
              className="font-mono text-base text-base-content bg-base-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 w-32"
              value={hex}
              onChange={(e) => handleHex(e.target.value.toUpperCase())}
              maxLength={7}
            />
            {hexError && <p className="text-xs text-red-500">{hexError}</p>}
            {rgb && <CopyButton text={hex} />}
          </div>
        </div>
      </Card>

      {rgb && hsl && cmyk && (
        <div className="space-y-3">
          {/* RGB */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-base-content/70">RGB</p>
              <CopyButton text={`rgb(${rgb.join(', ')})`} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['R', 'G', 'B'] as const).map((label, i) => (
                <div key={label}>
                  <label className="text-xs text-base-content/50">{label}</label>
                  <input
                    type="number" min={0} max={255}
                    className="w-full font-mono text-sm text-base-content bg-base-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                    value={rgb[i]}
                    onChange={(e) => handleRgb(i as 0|1|2, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* HSL */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-base-content/70">HSL</p>
              <CopyButton text={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'H (0–360)', max: 360 }, { label: 'S (%)', max: 100 }, { label: 'L (%)', max: 100 }].map((f, i) => (
                <div key={f.label}>
                  <label className="text-xs text-base-content/50">{f.label}</label>
                  <input
                    type="number" min={0} max={f.max}
                    className="w-full font-mono text-sm text-base-content bg-base-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 mt-1"
                    value={hsl[i]}
                    onChange={(e) => handleHsl(i as 0|1|2, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* CMYK */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-base-content/70">CMYK</p>
              <CopyButton text={`cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {['C', 'M', 'Y', 'K'].map((label, i) => (
                <div key={label}>
                  <label className="text-xs text-base-content/50">{label} (%)</label>
                  <div className="font-mono text-sm text-base-content bg-base-200 rounded-lg px-2 py-1.5 mt-1">{cmyk[i]}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
