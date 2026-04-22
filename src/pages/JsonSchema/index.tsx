import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Ajv, { type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useDebounced } from '../../hooks/useDebounced'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'

const DEFAULT_SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "email"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "email": { "type": "string", "format": "email" },
    "name": { "type": "string", "minLength": 1 },
    "age":  { "type": "integer", "minimum": 0, "maximum": 150 }
  },
  "additionalProperties": false
}`

const DEFAULT_DATA = `{
  "id": 42,
  "email": "alice@example.com",
  "name": "Alice",
  "age": 30
}`

interface Result {
  status: 'ok' | 'invalid' | 'schema-error' | 'data-error'
  errors?: ErrorObject[]
  message?: string
}

export function JsonSchema() {
  const { t } = useTranslation()
  useDocumentTitle(t('jsonSchema.title'))

  const [schema, setSchema] = useState(DEFAULT_SCHEMA)
  const [data, setData] = useState(DEFAULT_DATA)
  const debouncedSchema = useDebounced(schema, 250)
  const debouncedData = useDebounced(data, 200)

  const result = useMemo<Result>(() => {
    let parsedSchema: unknown
    try {
      parsedSchema = JSON.parse(debouncedSchema)
    } catch (e) {
      return { status: 'schema-error', message: (e as Error).message }
    }
    let parsedData: unknown
    try {
      parsedData = JSON.parse(debouncedData)
    } catch (e) {
      return { status: 'data-error', message: (e as Error).message }
    }
    try {
      const ajv = new Ajv({ allErrors: true, strict: false })
      addFormats(ajv)
      const validate = ajv.compile(parsedSchema as object)
      const ok = validate(parsedData)
      if (ok) return { status: 'ok' }
      return { status: 'invalid', errors: validate.errors ?? [] }
    } catch (e) {
      return { status: 'schema-error', message: (e as Error).message }
    }
  }, [debouncedSchema, debouncedData])

  return (
    <div className="max-w-6xl 3xl:max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('jsonSchema.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('jsonSchema.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="space-y-2">
          <label className="eyebrow">{t('jsonSchema.schemaLabel')}</label>
          <Textarea value={schema} onChange={(e) => setSchema(e.target.value)} rows={18} className="font-mono text-xs" />
        </Card>
        <Card className="space-y-2">
          <label className="eyebrow">{t('jsonSchema.dataLabel')}</label>
          <Textarea value={data} onChange={(e) => setData(e.target.value)} rows={18} className="font-mono text-xs" />
        </Card>
      </div>

      <Verdict t={t} result={result} />
    </div>
  )
}

function Verdict({ t, result }: { t: (k: string, o?: Record<string, unknown>) => string; result: Result }) {
  if (result.status === 'schema-error') {
    return (
      <Card className="border-red-500/30 bg-red-500/5 space-y-1">
        <p className="text-sm font-medium text-red-400">{t('jsonSchema.invalidSchema')}</p>
        <p className="text-xs font-mono text-base-content/70">{result.message}</p>
      </Card>
    )
  }
  if (result.status === 'data-error') {
    return (
      <Card className="border-red-500/30 bg-red-500/5 space-y-1">
        <p className="text-sm font-medium text-red-400">{t('jsonSchema.invalidData')}</p>
        <p className="text-xs font-mono text-base-content/70">{result.message}</p>
      </Card>
    )
  }
  if (result.status === 'ok') {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
        <Badge color="green">VALID</Badge>
        <p className="text-sm text-emerald-300">{t('jsonSchema.valid')}</p>
      </Card>
    )
  }
  const errors = result.errors ?? []
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge color="red">INVALID</Badge>
        <span className="text-sm text-base-content/70">{t('jsonSchema.errorCount', { count: errors.length })}</span>
      </div>
      <ul className="space-y-1.5">
        {errors.map((err, i) => (
          <li key={i} className="text-xs flex items-start gap-2 p-2.5 rounded-md bg-base-content/[0.03] border border-base-content/[0.06]">
            <span className="font-mono text-red-400/80 shrink-0 min-w-0">
              {err.instancePath || '/'}
            </span>
            <span className="text-base-content/80">{err.message}</span>
            {err.params && Object.keys(err.params).length > 0 && (
              <span className="text-base-content/40 font-mono ms-auto shrink-0">
                {Object.entries(err.params).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' · ')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}
