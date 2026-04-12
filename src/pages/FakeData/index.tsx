import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from '../../icons'
import { faker } from '@faker-js/faker/locale/en'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Slider } from '../../components/ui/Slider'
import { Button } from '../../components/ui/Button'
import { CopyButton } from '../../components/ui/CopyButton'
import { useClipboard } from '../../hooks/useClipboard'

type FakeType = 'fullName' | 'email' | 'phone' | 'address' | 'company' | 'jobTitle' | 'username' | 'uuid' | 'creditCard' | 'date' | 'paragraph'

function generateValue(type: FakeType): string {
  switch (type) {
    case 'fullName': return faker.person.fullName()
    case 'email': return faker.internet.email()
    case 'phone': return faker.phone.number()
    case 'address': return faker.location.streetAddress({ useFullAddress: true })
    case 'company': return faker.company.name()
    case 'jobTitle': return faker.person.jobTitle()
    case 'username': return faker.internet.username()
    case 'uuid': return faker.string.uuid()
    case 'creditCard': return faker.finance.creditCardNumber()
    case 'date': return faker.date.past().toISOString().slice(0, 10)
    case 'paragraph': return faker.lorem.paragraph()
  }
}

export function FakeData() {
  const { t } = useTranslation()
  useDocumentTitle(t('fakeData.title'))
  const [type, setType] = useState<FakeType>('fullName')
  const [count, setCount] = useState(5)
  const [items, setItems] = useState<string[]>([])
  const { copy, copied } = useClipboard()

  const generate = useCallback(() => {
    setItems(Array.from({ length: count }, () => generateValue(type)))
  }, [type, count])

  useEffect(() => { generate() }, [generate])

  const copyJson = () => copy(JSON.stringify(items, null, 2))
  const copyCsv = () => copy(items.join('\n'))

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('fakeData.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('fakeData.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Select label={t('fakeData.type')} value={type} onChange={(e) => setType(e.target.value as FakeType)}>
          <option value="fullName">{t('fakeData.fullName')}</option>
          <option value="email">{t('fakeData.email')}</option>
          <option value="phone">{t('fakeData.phone')}</option>
          <option value="address">{t('fakeData.address')}</option>
          <option value="company">{t('fakeData.company')}</option>
          <option value="jobTitle">{t('fakeData.jobTitle')}</option>
          <option value="username">{t('fakeData.username')}</option>
          <option value="uuid">{t('fakeData.uuid')}</option>
          <option value="creditCard">{t('fakeData.creditCard')}</option>
          <option value="date">{t('fakeData.date')}</option>
          <option value="paragraph">{t('fakeData.paragraph')}</option>
        </Select>
        <Slider label={t('fakeData.count')} min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <div className="flex gap-2">
          <Button onClick={generate} className="flex-1">
            <RefreshCw size={14} /> {t('fakeData.regenerate')}
          </Button>
          <Button variant="outline" onClick={copyJson}>{copied ? t('common.copied') : t('fakeData.copyJson')}</Button>
          <Button variant="outline" onClick={copyCsv}>{t('fakeData.copyCsv')}</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {items.map((item, i) => (
          <Card key={i} className="flex items-center gap-3 py-2.5">
            <span className="text-xs text-base-content/40 w-8 shrink-0 font-mono">#{i + 1}</span>
            <code className="flex-1 text-sm font-mono text-base-content break-all">{item}</code>
            <CopyButton text={item} size="sm" />
          </Card>
        ))}
      </div>
    </div>
  )
}
