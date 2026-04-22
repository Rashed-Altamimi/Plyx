import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { CopyButton } from '../../components/ui/CopyButton'
import { harmony, shadeLadder, type HarmonyKind } from '../../utils/palette'

const HARMONIES: { id: HarmonyKind; labelKey: string }[] = [
  { id: 'complementary',      labelKey: 'colorPalette.complementary' },
  { id: 'analogous',          labelKey: 'colorPalette.analogous' },
  { id: 'triadic',            labelKey: 'colorPalette.triadic' },
  { id: 'tetradic',           labelKey: 'colorPalette.tetradic' },
  { id: 'splitComplementary', labelKey: 'colorPalette.splitComplementary' },
  { id: 'monochromatic',      labelKey: 'colorPalette.monochromatic' },
]

export function ColorPalette() {
  const { t } = useTranslation()
  useDocumentTitle(t('colorPalette.title'))

  const [base, setBase] = useState('#7c6cfa')
  const [mode, setMode] = useState<'harmonies' | 'shades'>('harmonies')
  const [harmonyKind, setHarmonyKind] = useState<HarmonyKind>('complementary')

  const harmonyColors = useMemo(() => harmony(base, harmonyKind), [base, harmonyKind])
  const shades = useMemo(() => shadeLadder(base), [base])

  const allHexesCss = useMemo(() => {
    const colors = mode === 'harmonies' ? harmonyColors : shades.map((s) => s.hex)
    return colors
      .map((c, i) => `--color-${i + 1}: ${c};`)
      .join('\n')
  }, [mode, harmonyColors, shades])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('colorPalette.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('colorPalette.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <input
            type="color"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="h-10 w-10 rounded-lg border border-base-content/10 bg-transparent cursor-pointer"
          />
          <Input label={t('colorPalette.baseColor')} value={base} onChange={(e) => setBase(e.target.value)} className="font-mono" />
        </div>

        <Tabs
          tabs={[
            { id: 'harmonies', label: t('colorPalette.harmonies') },
            { id: 'shades',    label: t('colorPalette.shades') },
          ]}
          active={mode}
          onChange={(id) => setMode(id as 'harmonies' | 'shades')}
        />

        {mode === 'harmonies' && (
          <div className="flex flex-wrap gap-1.5">
            {HARMONIES.map((h) => (
              <button
                key={h.id}
                onClick={() => setHarmonyKind(h.id)}
                className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                  harmonyKind === h.id
                    ? 'border-primary/40 bg-primary/15 text-base-content'
                    : 'border-base-content/10 bg-base-content/[0.03] text-base-content/60 hover:bg-base-content/5'
                }`}
              >
                {t(h.labelKey)}
              </button>
            ))}
          </div>
        )}
      </Card>

      {mode === 'harmonies' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {harmonyColors.map((c, i) => (
            <Swatch key={`${c}-${i}`} hex={c} />
          ))}
        </div>
      )}

      {mode === 'shades' && (
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
          {shades.map(({ step, hex }) => (
            <Swatch key={step} hex={hex} label={String(step)} />
          ))}
        </div>
      )}

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow">{t('colorPalette.cssVars')}</p>
          <CopyButton text={allHexesCss} />
        </div>
        <pre className="text-xs bg-base-100/60 border border-base-content/10 rounded-lg p-3 overflow-x-auto">
          {allHexesCss}
        </pre>
      </Card>
    </div>
  )
}

function Swatch({ hex, label }: { hex: string; label?: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="h-20 rounded-lg border border-base-content/10 shadow-sm"
        style={{ backgroundColor: hex }}
      />
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span className="text-[11px] font-mono text-base-content/70 uppercase">{hex}</span>
        {label && <span className="text-[10px] font-mono text-base-content/40">{label}</span>}
      </div>
      <CopyButton text={hex} size="sm" iconOnly className="w-full" />
    </div>
  )
}
