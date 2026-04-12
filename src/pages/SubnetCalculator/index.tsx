import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { CopyButton } from '../../components/ui/CopyButton'
import { parseCidr } from '../../utils/subnet'

export function SubnetCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('subnet.title'))
  const [cidr, setCidr] = useState('192.168.1.0/24')

  const result = useMemo(() => parseCidr(cidr), [cidr])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('subnet.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('subnet.subtitle')}</p>

      <Card className="mb-4">
        <Input
          label={t('subnet.cidr')}
          value={cidr}
          onChange={(e) => setCidr(e.target.value)}
          placeholder="192.168.1.0/24"
          className="font-mono"
        />
        {!result && cidr && <p className="text-xs text-red-500 mt-2">{t('subnet.invalidCidr')}</p>}
      </Card>

      {result && (
        <div className="space-y-2">
          {[
            { label: t('subnet.network'), value: result.network },
            { label: t('subnet.broadcast'), value: result.broadcast },
            { label: t('subnet.netmask'), value: result.netmask },
            { label: t('subnet.wildcard'), value: result.wildcard },
            { label: t('subnet.firstHost'), value: result.firstHost },
            { label: t('subnet.lastHost'), value: result.lastHost },
            { label: t('subnet.totalHosts'), value: result.totalAddresses.toLocaleString() },
            { label: t('subnet.usableHosts'), value: result.usableHosts.toLocaleString() },
            { label: t('subnet.cidrPrefix'), value: `/${result.cidr}` },
          ].map(({ label, value }) => (
            <Card key={label} className="flex items-center justify-between py-3">
              <p className="text-sm text-base-content/60">{label}</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm font-semibold text-base-content">{value}</code>
                <CopyButton text={String(value)} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
