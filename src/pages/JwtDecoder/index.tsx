import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Badge } from '../../components/ui/Badge'
import { CopyButton } from '../../components/ui/CopyButton'

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice((base64.length % 4) || 4)
  return decodeURIComponent(escape(atob(padded)))
}

function parseJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('NOT_VALID_JWT')
  const header  = JSON.parse(decodeBase64Url(parts[0]))
  const payload = JSON.parse(decodeBase64Url(parts[1]))
  return { header, payload, signature: parts[2] }
}

function ExpiryBadge({ exp, t }: { exp?: number; t: (key: string, opts?: Record<string, string>) => string }) {
  if (!exp) return null
  const now = Math.floor(Date.now() / 1000)
  const expired = exp < now
  const date = new Date(exp * 1000).toLocaleString()
  return (
    <Badge color={expired ? 'red' : 'green'}>
      {expired ? t('jwt.expired', { date }) : t('jwt.expires', { date })}
    </Badge>
  )
}

export function JwtDecoder() {
  const { t } = useTranslation()
  useDocumentTitle(t('jwt.title'))
  const [token, setToken] = useState('')

  const result = useMemo(() => {
    if (!token.trim()) return null
    try {
      return { data: parseJwt(token), error: null }
    } catch (e) {
      return { data: null, error: (e as Error).message }
    }
  }, [token])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('jwt.title')}</h1>
      <p className="text-sm text-base-content/50 mb-2">{t('jwt.subtitle')}</p>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-8">
        {t('jwt.notice')}
      </p>

      <Card className="mb-4">
        <Textarea
          label={t('jwt.tokenLabel')}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
          className="font-mono text-xs"
        />
        {result?.error && <p className="text-xs text-red-500 mt-2">{t('jwt.notValid')}</p>}
      </Card>

      {result?.data && (
        <div className="space-y-4">
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-base-content/70">{t('jwt.header')}</p>
              <Badge color="blue">{result.data.header.alg}</Badge>
            </div>
            <pre className="text-xs font-mono text-base-content bg-base-200 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(result.data.header, null, 2)}
            </pre>
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-base-content/70">{t('jwt.payload')}</p>
              <div className="flex gap-2">
                <ExpiryBadge exp={result.data.payload.exp} t={t} />
                <CopyButton text={JSON.stringify(result.data.payload, null, 2)} />
              </div>
            </div>
            <pre className="text-xs font-mono text-base-content bg-base-200 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(result.data.payload, null, 2)}
            </pre>
            {result.data.payload.iat && (
              <p className="text-xs text-base-content/40">
                {t('jwt.issuedAt', { date: new Date(result.data.payload.iat * 1000).toLocaleString() })}
              </p>
            )}
          </Card>

          <Card className="space-y-2">
            <p className="text-sm font-semibold text-base-content/70">{t('jwt.signature')}</p>
            <code className="text-xs font-mono text-base-content/60 break-all">{result.data.signature}</code>
          </Card>
        </div>
      )}
    </div>
  )
}
