import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, Download } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useDebounced } from '../../hooks/useDebounced'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Slider } from '../../components/ui/Slider'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Tabs } from '../../components/ui/Tabs'
import { Textarea } from '../../components/ui/Textarea'
import { CopyButton } from '../../components/ui/CopyButton'
import { Badge } from '../../components/ui/Badge'
import {
  PRESETS,
  findPreset,
  generateFromSchema,
  AVAILABLE_TOKENS,
  type PresetId,
} from '../../utils/fakeJson'

const DEFAULT_SCHEMA = `{
  "id": "@uuid",
  "name": "@name",
  "email": "@email",
  "age": "@int(18,80)",
  "role": "@pick(admin,editor,viewer)",
  "address": {
    "city": "@city",
    "country": "@country"
  },
  "tags": ["@word"]
}`

export function FakeJson() {
  const { t } = useTranslation()
  useDocumentTitle(t('fakeJson.title'))

  const [mode, setMode] = useState<'preset' | 'schema'>('preset')
  const [preset, setPreset] = useState<PresetId>('user')
  const [count, setCount] = useState(5)
  const [pretty, setPretty] = useState(true)
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA)
  const [tick, setTick] = useState(0)

  const TABS = [
    { id: 'preset', label: t('fakeJson.presetMode') },
    { id: 'schema', label: t('fakeJson.schemaMode') },
  ]

  const debouncedSchema = useDebounced(schemaText, 200)

  const { output, error } = useMemo(() => {
    // tick is captured so regenerate re-runs even when inputs are unchanged
    void tick
    try {
      const records: unknown[] = []
      if (mode === 'preset') {
        const p = findPreset(preset)
        if (!p) return { output: '', error: t('fakeJson.unknownPreset') }
        for (let i = 0; i < count; i++) records.push(p.generate())
      } else {
        const template = JSON.parse(debouncedSchema)
        for (let i = 0; i < count; i++) records.push(generateFromSchema(template))
      }
      const json = pretty ? JSON.stringify(records, null, 2) : JSON.stringify(records)
      return { output: json, error: '' }
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : t('fakeJson.genericError') }
    }
  }, [mode, preset, count, pretty, debouncedSchema, tick, t])

  const regenerate = () => setTick((n) => n + 1)

  const download = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fake-${mode === 'preset' ? preset : 'data'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1760px] 5xl:max-w-[2400px] mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('fakeJson.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('fakeJson.subtitle')}</p>

      <Tabs tabs={TABS} active={mode} onChange={(id) => setMode(id as 'preset' | 'schema')} className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-4">
          {mode === 'preset' ? (
            <Select label={t('fakeJson.preset')} value={preset} onChange={(e) => setPreset(e.target.value as PresetId)}>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{t(p.labelKey)}</option>
              ))}
            </Select>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('fakeJson.template')}</label>
                <Textarea
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  rows={12}
                  className="font-mono text-xs"
                  spellCheck={false}
                />
              </div>
              <details className="text-xs text-base-content/60">
                <summary className="cursor-pointer select-none mb-2">{t('fakeJson.availableTokens')}</summary>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_TOKENS.map((tok) => (
                    <Badge key={tok} color="gray">@{tok}</Badge>
                  ))}
                </div>
              </details>
            </>
          )}

          <Slider
            label={t('fakeJson.count')}
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <Checkbox
            label={t('fakeJson.pretty')}
            checked={pretty}
            onChange={(e) => setPretty(e.target.checked)}
          />

          <Button onClick={regenerate} className="w-full">
            <RefreshCw size={14} /> {t('fakeJson.regenerate')}
          </Button>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-base-content/70">{t('fakeJson.output')}</label>
            <div className="flex gap-2 shrink-0">
              {output && (
                <Button variant="outline" size="sm" onClick={download}>
                  <Download size={14} />
                </Button>
              )}
              {output && <CopyButton text={output} />}
            </div>
          </div>
          <Textarea value={output} readOnly rows={22} className="font-mono text-xs" />
        </Card>
      </div>
    </div>
  )
}
