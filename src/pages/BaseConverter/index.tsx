import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { CopyButton } from '../../components/ui/CopyButton'

interface BaseField {
  label: string
  base: number
  prefix: string
  pattern: RegExp
}

export function BaseConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('baseConvert.title'))

  const BASES: BaseField[] = [
    { label: t('baseConvert.decimal'), base: 10, prefix: '',   pattern: /^[0-9]*$/ },
    { label: t('baseConvert.binary'),  base: 2,  prefix: '0b', pattern: /^[01]*$/ },
    { label: t('baseConvert.octal'),   base: 8,  prefix: '0o', pattern: /^[0-7]*$/ },
    { label: t('baseConvert.hex'),     base: 16, prefix: '0x', pattern: /^[0-9a-fA-F]*$/ },
  ]
  const [values, setValues] = useState<Record<number, string>>({ 10: '', 2: '', 8: '', 16: '' })

  const update = (base: number, raw: string) => {
    const field = BASES.find((b) => b.base === base)!
    if (raw !== '' && !field.pattern.test(raw)) return

    const next: Record<number, string> = { 10: '', 2: '', 8: '', 16: '' }
    next[base] = raw

    if (raw !== '') {
      try {
        const decimal = parseInt(raw, base)
        if (!isNaN(decimal)) {
          for (const b of BASES) {
            if (b.base !== base) {
              next[b.base] = b.base === 16
                ? decimal.toString(16).toUpperCase()
                : decimal.toString(b.base)
            }
          }
        }
      } catch { /* ignore */ }
    }
    setValues(next)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('baseConvert.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('baseConvert.subtitle')}</p>

      <div className="space-y-3">
        {BASES.map(({ label, base, prefix }) => (
          <Card key={base} className="flex items-center gap-4">
            <div className="w-36 shrink-0">
              <p className="text-xs font-semibold text-base-content/50">{label}</p>
              {prefix && <p className="text-xs text-base-content/40 font-mono">{prefix}</p>}
            </div>
            <input
              className="flex-1 font-mono text-base text-base-content bg-base-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-base-100 transition-colors"
              value={values[base]}
              onChange={(e) => update(base, e.target.value.toUpperCase())}
              placeholder={base === 10 ? '0' : base === 2 ? '0000' : base === 8 ? '00' : '0x0'}
              spellCheck={false}
            />
            {values[base] && <CopyButton text={values[base]} size="sm" />}
          </Card>
        ))}
      </div>
    </div>
  )
}
