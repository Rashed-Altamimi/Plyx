import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { buildWifiString, buildVCardString, type QrTab, type WifiData, type VCardData } from '../../utils/qr'
import { Tabs } from '../../components/ui/Tabs'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'

export function QrGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('qr.title'))

  const TABS = [
    { id: 'url',   label: t('qr.url') },
    { id: 'text',  label: t('qr.text') },
    { id: 'wifi',  label: t('qr.wifi') },
    { id: 'vcard', label: t('qr.vcard') },
  ]

  const [tab, setTab] = useState<QrTab>('url')
  const [urlInput, setUrlInput] = useState('https://')
  const [textInput, setTextInput] = useState('')
  const [wifi, setWifi] = useState<WifiData>({ ssid: '', password: '', security: 'WPA', hidden: false })
  const [vcard, setVcard] = useState<VCardData>({ firstName: '', lastName: '', phone: '', email: '', url: '', organization: '' })
  const [error, setError] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getQrValue = (): string => {
    if (tab === 'url')   return urlInput
    if (tab === 'text')  return textInput
    if (tab === 'wifi')  return buildWifiString(wifi)
    if (tab === 'vcard') return buildVCardString(vcard)
    return ''
  }

  useEffect(() => {
    const value = getQrValue()
    if (!value.trim() || !canvasRef.current) {
      setError('')
      return
    }
    QRCode.toCanvas(canvasRef.current, value, { width: 256, margin: 2, errorCorrectionLevel: 'M' }, (err) => {
      if (err) {
        setError(t('qr.tooLarge'))
      } else {
        setError('')
      }
    })
  }, [tab, urlInput, textInput, wifi, vcard])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'qrcode.png'
    a.click()
  }

  const hasContent = getQrValue().trim().length > 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('qr.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('qr.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input panel */}
        <Card className="space-y-4">
          <Tabs tabs={TABS} active={tab} onChange={(id) => setTab(id as QrTab)} />

          {tab === 'url' && (
            <Input label={t('qr.urlLabel')} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com" />
          )}

          {tab === 'text' && (
            <Textarea label={t('qr.textLabel')} value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter any text…" rows={4} />
          )}

          {tab === 'wifi' && (
            <div className="space-y-3">
              <Input label={t('qr.ssid')} value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} />
              <Input label={t('qr.wifiPassword')} type="password" value={wifi.password} onChange={(e) => setWifi({ ...wifi, password: e.target.value })} />
              <Select label={t('qr.security')} value={wifi.security} onChange={(e) => setWifi({ ...wifi, security: e.target.value as WifiData['security'] })}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </Select>
              <Checkbox label={t('qr.hiddenNetwork')} checked={wifi.hidden} onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })} />
            </div>
          )}

          {tab === 'vcard' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label={t('qr.firstName')} value={vcard.firstName} onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })} />
                <Input label={t('qr.lastName')} value={vcard.lastName} onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })} />
              </div>
              <Input label={t('qr.phone')} type="tel" value={vcard.phone} onChange={(e) => setVcard({ ...vcard, phone: e.target.value })} />
              <Input label={t('qr.email')} type="email" value={vcard.email} onChange={(e) => setVcard({ ...vcard, email: e.target.value })} />
              <Input label={t('qr.website')} value={vcard.url} onChange={(e) => setVcard({ ...vcard, url: e.target.value })} />
              <Input label={t('qr.organization')} value={vcard.organization} onChange={(e) => setVcard({ ...vcard, organization: e.target.value })} />
            </div>
          )}
        </Card>

        {/* QR preview */}
        <Card className="flex flex-col items-center justify-center gap-4">
          {hasContent && !error ? (
            <>
              <canvas ref={canvasRef} className="rounded-lg" />
              <Button onClick={download} variant="outline">
                <Download size={14} /> {t('qr.downloadPng')}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-base-content/40">
              <canvas ref={canvasRef} className="hidden" />
              {error ? (
                <p className="text-sm text-red-500 text-center">{error}</p>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-xl bg-base-300 flex items-center justify-center">
                    <span className="text-3xl">⬚</span>
                  </div>
                  <p className="text-sm text-base-content/40">{t('qr.fillForm')}</p>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
