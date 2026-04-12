import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

interface CaseOption {
  label: string
  fn: (s: string) => string
}

export function CaseConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('case.title'))
  const [input, setInput] = useState('')

  const CASES: CaseOption[] = [
    { label: t('case.upper'),        fn: (s) => s.toUpperCase() },
    { label: t('case.lower'),        fn: (s) => s.toLowerCase() },
    { label: t('case.titleCase'),    fn: (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
    { label: t('case.sentenceCase'), fn: (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() },
    { label: t('case.camelCase'),    fn: (s) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { label: t('case.pascalCase'),   fn: (s) => s.replace(/(^|[^a-zA-Z0-9])(.)/g, (_, __, c) => c.toUpperCase()) },
    { label: t('case.snakeCase'),    fn: (s) => s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') },
    { label: t('case.kebabCase'),    fn: (s) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') },
    { label: t('case.constantCase'), fn: (s) => s.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '') },
    { label: t('case.dotCase'),      fn: (s) => s.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('case.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('case.subtitle')}</p>

      <Card className="mb-4">
        <Textarea
          label={t('case.inputText')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('case.placeholder')}
          rows={4}
        />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CASES.map(({ label, fn }) => {
          const result = input ? fn(input) : ''
          return (
            <Card key={label} className="space-y-2">
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide">{label}</p>
              <p className="text-sm text-base-content font-mono break-all min-h-[1.5rem]">{result}</p>
              {result && (
                <div className="flex gap-2">
                  <CopyButton text={result} size="sm" />
                  <Button variant="ghost" size="sm" onClick={() => setInput(result)}>{t('common.useAsInput')}</Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
