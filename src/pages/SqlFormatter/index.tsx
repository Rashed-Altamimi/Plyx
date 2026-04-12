import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'sql-formatter'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'

const DIALECTS = [
  'sql', 'postgresql', 'mysql', 'mariadb', 'sqlite', 'transactsql',
  'bigquery', 'db2', 'hive', 'redshift', 'snowflake', 'spark', 'tsql', 'trino',
] as const

type Dialect = typeof DIALECTS[number]

const DEFAULT_SQL = `SELECT u.id, u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.created_at > '2024-01-01' GROUP BY u.id, u.name HAVING COUNT(o.id) > 5 ORDER BY order_count DESC LIMIT 10;`

export function SqlFormatter() {
  const { t } = useTranslation()
  useDocumentTitle(t('sql.title'))
  const [input, setInput] = useState(DEFAULT_SQL)
  const [output, setOutput] = useState('')
  const [dialect, setDialect] = useState<Dialect>('sql')
  const [error, setError] = useState('')

  const formatSql = () => {
    try {
      if (!input.trim()) { setOutput(''); setError(''); return }
      const result = format(input, { language: dialect })
      setOutput(result)
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('sql.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('sql.subtitle')}</p>

      <Card className="space-y-3 mb-4">
        <Select label={t('sql.dialect')} value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)}>
          {DIALECTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Textarea label={t('sql.input')} value={input} onChange={(e) => setInput(e.target.value)} rows={6} className="font-mono text-xs" />
        <Button onClick={formatSql} className="w-full">{t('sql.formatBtn')}</Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </Card>

      {output && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('sql.output')}</label>
            <CopyButton text={output} />
          </div>
          <Textarea value={output} readOnly rows={16} className="font-mono text-xs" />
        </Card>
      )}
    </div>
  )
}
