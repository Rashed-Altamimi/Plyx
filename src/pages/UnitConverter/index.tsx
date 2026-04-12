import { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Ruler, Weight, Thermometer, FlaskConical, Gauge, Square, Clock, ArrowLeftRight,
} from '../../icons'
import type { LucideIcon } from '../../icons'
// @ts-expect-error - no types for convert-units
import convertModule from 'convert-units'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { CopyButton } from '../../components/ui/CopyButton'

// Defensive CJS interop
const convert = (convertModule as unknown as { default?: (v: number) => ConvertChain } & ((v: number) => ConvertChain)).default
  ?? (convertModule as unknown as (v: number) => ConvertChain)

interface ConvertChain {
  from: (u: string) => { to: (u: string) => number }
}

interface Category {
  key: string
  icon: LucideIcon
  units: string[]
  defaults: [string, string]
}

const CATEGORIES: Category[] = [
  { key: 'length',      icon: Ruler,         units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'], defaults: ['m', 'ft'] },
  { key: 'mass',        icon: Weight,        units: ['mg', 'g', 'kg', 'oz', 'lb', 't'], defaults: ['kg', 'lb'] },
  { key: 'temperature', icon: Thermometer,   units: ['C', 'F', 'K'], defaults: ['C', 'F'] },
  { key: 'volume',      icon: FlaskConical,  units: ['ml', 'cl', 'l', 'm3', 'tsp', 'Tbs', 'fl-oz', 'cup', 'pnt', 'qt', 'gal'], defaults: ['l', 'gal'] },
  { key: 'speed',       icon: Gauge,         units: ['m/s', 'km/h', 'm/h', 'knot', 'ft/s'], defaults: ['km/h', 'm/h'] },
  { key: 'area',        icon: Square,        units: ['mm2', 'cm2', 'm2', 'km2', 'in2', 'ft2', 'yd2', 'mi2', 'ha', 'ac'], defaults: ['m2', 'ft2'] },
  { key: 'time',        icon: Clock,         units: ['ns', 'ms', 's', 'min', 'h', 'd', 'week', 'month', 'year'], defaults: ['h', 'min'] },
]

const UNIT_LABELS: Record<string, string> = {
  mm: 'Millimeter', cm: 'Centimeter', m: 'Meter', km: 'Kilometer',
  in: 'Inch', ft: 'Foot', yd: 'Yard', mi: 'Mile',
  mg: 'Milligram', g: 'Gram', kg: 'Kilogram',
  oz: 'Ounce', lb: 'Pound', t: 'Metric ton',
  C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin',
  ml: 'Milliliter', cl: 'Centiliter', l: 'Liter', m3: 'Cubic meter',
  tsp: 'Teaspoon', Tbs: 'Tablespoon', 'fl-oz': 'Fluid ounce',
  cup: 'Cup', pnt: 'Pint', qt: 'Quart', gal: 'Gallon',
  'm/s': 'Meters/sec', 'km/h': 'Kilometers/hr', 'm/h': 'Miles/hr',
  knot: 'Knot', 'ft/s': 'Feet/sec',
  mm2: 'Square mm', cm2: 'Square cm', m2: 'Square m', km2: 'Square km',
  in2: 'Square in', ft2: 'Square ft', yd2: 'Square yd', mi2: 'Square mi',
  ha: 'Hectare', ac: 'Acre',
  ns: 'Nanosecond', ms: 'Millisecond', s: 'Second', min: 'Minute',
  h: 'Hour', d: 'Day', week: 'Week', month: 'Month', year: 'Year',
}

const UNIT_SYMBOLS: Record<string, string> = {
  mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi',
  mg: 'mg', g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', t: 't',
  C: '°C', F: '°F', K: 'K',
  ml: 'ml', cl: 'cl', l: 'L', m3: 'm³',
  tsp: 'tsp', Tbs: 'Tbs', 'fl-oz': 'fl oz', cup: 'cup', pnt: 'pt', qt: 'qt', gal: 'gal',
  'm/s': 'm/s', 'km/h': 'km/h', 'm/h': 'mph', knot: 'kn', 'ft/s': 'ft/s',
  mm2: 'mm²', cm2: 'cm²', m2: 'm²', km2: 'km²',
  in2: 'in²', ft2: 'ft²', yd2: 'yd²', mi2: 'mi²', ha: 'ha', ac: 'ac',
  ns: 'ns', ms: 'ms', s: 's', min: 'min', h: 'h', d: 'd',
  week: 'wk', month: 'mo', year: 'yr',
}

interface QuickConversion {
  category: string
  from: string
  to: string
  label: string
}

const QUICK_CONVERSIONS: QuickConversion[] = [
  { category: 'temperature', from: 'C', to: 'F', label: '°C → °F' },
  { category: 'temperature', from: 'F', to: 'C', label: '°F → °C' },
  { category: 'length',      from: 'km', to: 'mi', label: 'km → mi' },
  { category: 'length',      from: 'mi', to: 'km', label: 'mi → km' },
  { category: 'length',      from: 'ft', to: 'm', label: 'ft → m' },
  { category: 'mass',        from: 'kg', to: 'lb', label: 'kg → lb' },
  { category: 'mass',        from: 'lb', to: 'kg', label: 'lb → kg' },
  { category: 'volume',      from: 'l', to: 'gal', label: 'L → gal' },
  { category: 'speed',       from: 'km/h', to: 'm/h', label: 'km/h → mph' },
]

function formatNumber(n: number): string {
  if (!isFinite(n)) return ''
  // Smart formatting: use fixed decimals for small results, scientific for huge/tiny
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1e15 || (abs < 1e-6 && abs > 0)) {
    return n.toExponential(4)
  }
  // Round to max 6 significant fractional digits, strip trailing zeros
  const rounded = Number(n.toFixed(6))
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function safeConvert(value: number, from: string, to: string): number | null {
  try {
    return convert(value).from(from).to(to)
  } catch {
    return null
  }
}

export function UnitConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('units.title'))
  const [catKey, setCatKey] = useState('length')
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from')
  const fromInputRef = useRef<HTMLInputElement>(null)

  const category = CATEGORIES.find((c) => c.key === catKey)!

  // Auto-focus the "from" input on first render
  useEffect(() => {
    fromInputRef.current?.focus()
  }, [])

  // Recompute whichever side is not being edited
  useEffect(() => {
    if (lastEdited === 'from') {
      const v = parseFloat(fromValue)
      if (isNaN(v)) { setToValue(''); return }
      const r = safeConvert(v, fromUnit, toUnit)
      setToValue(r !== null ? formatNumber(r) : '')
    } else {
      const v = parseFloat(toValue)
      if (isNaN(v)) { setFromValue(''); return }
      const r = safeConvert(v, toUnit, fromUnit)
      setFromValue(r !== null ? formatNumber(r) : '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromValue, toValue, fromUnit, toUnit])

  const handleCategoryChange = (key: string) => {
    const cat = CATEGORIES.find((c) => c.key === key)!
    setCatKey(key)
    setFromUnit(cat.defaults[0])
    setToUnit(cat.defaults[1])
    setFromValue('1')
    setLastEdited('from')
    setTimeout(() => fromInputRef.current?.focus(), 0)
  }

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
    setLastEdited('from')
  }

  const applyQuick = (q: QuickConversion) => {
    setCatKey(q.category)
    setFromUnit(q.from)
    setToUnit(q.to)
    setFromValue('1')
    setLastEdited('from')
    setTimeout(() => fromInputRef.current?.focus(), 0)
  }

  // Live formula chip
  const formulaChip = useMemo(() => {
    const v = parseFloat(fromValue)
    if (isNaN(v) || !toValue) return ''
    return `${formatNumber(v)} ${UNIT_SYMBOLS[fromUnit] ?? fromUnit} = ${toValue} ${UNIT_SYMBOLS[toUnit] ?? toUnit}`
  }, [fromValue, toValue, fromUnit, toUnit])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('units.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('units.subtitle')}</p>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const active = catKey === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-primary text-primary-content shadow-sm'
                  : 'bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <Icon size={14} />
              {t(`units.${cat.key}`)}
            </button>
          )
        })}
      </div>

      {/* Conversion display */}
      <Card className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          {/* FROM */}
          <div className="bg-base-200 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              {t('units.from')}
            </label>
            <input
              ref={fromInputRef}
              type="number"
              value={fromValue}
              onChange={(e) => { setFromValue(e.target.value); setLastEdited('from') }}
              className="w-full bg-transparent text-3xl font-bold font-mono text-base-content outline-none tabular-nums"
              placeholder="0"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full bg-base-100 border border-base-300 rounded-lg px-3 py-2 text-sm text-base-content outline-none focus:border-primary cursor-pointer"
            >
              {category.units.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u] ?? u} ({UNIT_SYMBOLS[u] ?? u})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP */}
          <div className="flex md:flex-col items-center justify-center">
            <button
              onClick={swap}
              className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors cursor-pointer md:rotate-90"
              title={t('units.swap') || 'Swap'}
              aria-label="Swap units"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>

          {/* TO */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-primary/70 uppercase tracking-wider">
                {t('units.to')}
              </label>
              {toValue && <CopyButton text={toValue} size="sm" />}
            </div>
            <input
              type="number"
              value={toValue}
              onChange={(e) => { setToValue(e.target.value); setLastEdited('to') }}
              className="w-full bg-transparent text-3xl font-bold font-mono text-primary outline-none tabular-nums"
              placeholder="0"
            />
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full bg-base-100 border border-primary/25 rounded-lg px-3 py-2 text-sm text-base-content outline-none focus:border-primary cursor-pointer"
            >
              {category.units.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u] ?? u} ({UNIT_SYMBOLS[u] ?? u})
                </option>
              ))}
            </select>
          </div>
        </div>

        {formulaChip && (
          <p className="text-center text-xs text-base-content/50 mt-4 font-mono">
            {formulaChip}
          </p>
        )}
      </Card>

      {/* Quick conversions */}
      <Card>
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-3">
          Quick conversions
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_CONVERSIONS.map((q) => (
            <button
              key={q.label}
              onClick={() => applyQuick(q)}
              className="px-3 py-1.5 rounded-lg bg-base-200 hover:bg-base-300 text-xs font-medium text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
