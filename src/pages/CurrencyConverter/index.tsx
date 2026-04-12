import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeftRight, RefreshCw } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { getCached, getCachedStale, setCached } from '../../utils/localStorageCache'

const CACHE_KEY = 'plyx-currency-rates'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour
const API_URL = 'https://open.er-api.com/v6/latest/USD'

const SUPPORTED = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'NZD',
  'HKD', 'SGD', 'INR', 'AED', 'SAR', 'EGP', 'TRY', 'RUB', 'BRL',
  'MXN', 'ZAR', 'KRW', 'SEK', 'NOK', 'DKK', 'PLN',
]

interface RatesData {
  rates: Record<string, number>
  base: string
  fetchedAt: number
}

async function fetchRates(): Promise<RatesData> {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Fetch failed')
  const json = await res.json()
  if (!json.rates) throw new Error('Invalid response')
  return { rates: json.rates, base: 'USD', fetchedAt: Date.now() }
}

export function CurrencyConverter() {
  const { t } = useTranslation()
  useDocumentTitle(t('currency.title'))
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStale, setIsStale] = useState(false)

  const loadRates = async (force = false) => {
    setError('')
    if (!force) {
      const cached = getCached<RatesData>(CACHE_KEY, CACHE_TTL)
      if (cached) {
        setRates(cached.rates)
        setLastUpdated(cached.fetchedAt)
        setIsStale(false)
        setLoading(false)
        return
      }
    }
    setLoading(true)
    try {
      const fresh = await fetchRates()
      setCached(CACHE_KEY, fresh)
      setRates(fresh.rates)
      setLastUpdated(fresh.fetchedAt)
      setIsStale(false)
    } catch {
      const stale = getCachedStale<RatesData>(CACHE_KEY)
      if (stale) {
        setRates(stale.value.rates)
        setLastUpdated(stale.value.fetchedAt)
        setIsStale(true)
        setError(t('currency.fetchFailed'))
      } else {
        setError(t('currency.noCache'))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRates() }, [])

  const result = useMemo(() => {
    if (!rates) return null
    const a = parseFloat(amount)
    if (isNaN(a)) return null
    const fromRate = rates[from] ?? 1
    const toRate = rates[to] ?? 1
    return (a / fromRate) * toRate
  }, [amount, from, to, rates])

  const swap = () => {
    const tmp = from
    setFrom(to)
    setTo(tmp)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('currency.title')}</h1>
      <p className="text-sm text-base-content/50 mb-3">{t('currency.subtitle')}</p>
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-6">
        {t('currency.networkNotice')}
      </p>

      {error && !rates && (
        <Card className="text-center py-8 space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={() => loadRates(true)}>{t('currency.retry')}</Button>
        </Card>
      )}

      {rates && (
        <>
          <Card className="space-y-4 mb-4">
            <Input label={t('currency.amount')} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <Select label={t('currency.from')} value={from} onChange={(e) => setFrom(e.target.value)}>
                {SUPPORTED.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Button variant="outline" size="sm" onClick={swap} className="mb-0.5" title={t('currency.swap')}>
                <ArrowLeftRight size={14} />
              </Button>
              <Select label={t('currency.to')} value={to} onChange={(e) => setTo(e.target.value)}>
                {SUPPORTED.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </Card>

          {result !== null && (
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-6 mb-4 text-center">
              <p className="text-xs text-primary/60 mb-1 font-medium">{amount} {from} =</p>
              <p className="text-4xl font-bold text-primary">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
              <p className="text-sm text-primary/80 mt-1">{to}</p>
            </div>
          )}

          <Card className="flex items-center justify-between">
            <div className="text-xs text-base-content/60">
              {loading ? t('common.loading') : lastUpdated && t('currency.lastUpdated', { date: new Date(lastUpdated).toLocaleString() })}
              {isStale && <Badge color="orange" className="ms-2">cached</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => loadRates(true)} disabled={loading}>
              <RefreshCw size={14} /> {t('currency.refresh')}
            </Button>
          </Card>
        </>
      )}
    </div>
  )
}
