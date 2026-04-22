import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ArrowLeftRight } from '../../icons'
import { contrastRatio, grade } from '../../utils/palette'

export function ContrastChecker() {
  const { t } = useTranslation()
  useDocumentTitle(t('contrast.title'))

  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#1f1f1f')

  const { ratio, verdict } = useMemo(() => {
    const r = contrastRatio(fg, bg)
    if (r === null) return { ratio: null, verdict: null }
    return { ratio: r, verdict: grade(r) }
  }, [fg, bg])

  const swap = () => { setFg(bg); setBg(fg) }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('contrast.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('contrast.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ColorField label={t('contrast.foreground')} value={fg} onChange={setFg} />
        <ColorField label={t('contrast.background')} value={bg} onChange={setBg} />
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={swap}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-base-content/10 text-base-content/70 hover:bg-base-content/5 cursor-pointer"
        >
          <ArrowLeftRight size={12} />
          {t('contrast.swap')}
        </button>
      </div>

      {/* Preview */}
      <Card className="mb-4 p-0 overflow-hidden">
        <div className="p-8 space-y-3" style={{ backgroundColor: bg, color: fg }}>
          <p className="text-4xl font-semibold" style={{ color: fg }}>
            {t('contrast.largeText')}
          </p>
          <p className="text-xl" style={{ color: fg }}>
            {t('contrast.mediumText')}
          </p>
          <p className="text-sm" style={{ color: fg }}>
            {t('contrast.smallText')}
          </p>
        </div>
      </Card>

      {/* Verdict */}
      {ratio !== null && verdict ? (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="eyebrow">{t('contrast.ratio')}</p>
              <p className="font-display text-5xl font-bold text-base-content tabular-nums">
                {ratio.toFixed(2)}<span className="text-2xl text-base-content/50">:1</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <VerdictCard label={t('contrast.normalText')}>
              <VerdictRow level="AA"  passes={verdict.normalAA} />
              <VerdictRow level="AAA" passes={verdict.normalAAA} />
            </VerdictCard>
            <VerdictCard label={t('contrast.largeTextTitle')}>
              <VerdictRow level="AA"  passes={verdict.largeAA} />
              <VerdictRow level="AAA" passes={verdict.largeAAA} />
            </VerdictCard>
          </div>

          <p className="text-xs text-base-content/50">
            {t('contrast.uiObjects')} <Badge color={verdict.uiAA ? 'green' : 'red'}>{verdict.uiAA ? 'AA' : t('contrast.fail')}</Badge>
          </p>
        </div>
      ) : (
        <p className="text-sm text-red-500">{t('contrast.invalidColor')}</p>
      )}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Card>
      <div className="flex items-end gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 rounded-lg border border-base-content/10 bg-transparent cursor-pointer shrink-0"
        />
        <div className="flex-1 min-w-0">
          <Input label={label} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
        </div>
      </div>
    </Card>
  )
}

function VerdictCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-2">
      <p className="eyebrow">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </Card>
  )
}

function VerdictRow({ level, passes }: { level: string; passes: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-mono text-xs text-base-content/60">{level}</span>
      <Badge color={passes ? 'green' : 'red'}>{passes ? 'PASS' : 'FAIL'}</Badge>
    </div>
  )
}
