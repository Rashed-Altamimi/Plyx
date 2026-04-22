import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { CopyButton } from '../../components/ui/CopyButton'
import { Badge } from '../../components/ui/Badge'
import { encrypt, decrypt } from '../../utils/aes'

export function AesCipher() {
  const { t } = useTranslation()
  useDocumentTitle(t('aes.title'))

  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [passphrase, setPassphrase] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setError('')
    setBusy(true)
    try {
      if (!passphrase) { setError(t('aes.needPassphrase')); return }
      if (!input.trim()) { setOutput(''); return }
      const result = mode === 'encrypt'
        ? await encrypt(input, passphrase)
        : await decrypt(input.trim(), passphrase)
      setOutput(result)
    } catch (e) {
      setError(mode === 'encrypt' ? t('aes.encryptFailed') : t('aes.decryptFailed', { msg: (e as Error).message }))
      setOutput('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('aes.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('aes.subtitle')}</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Badge color="blue">AES-256-GCM</Badge>
        <Badge color="gray">PBKDF2 · 200k iterations</Badge>
      </div>

      <Tabs
        tabs={[
          { id: 'encrypt', label: t('aes.encrypt') },
          { id: 'decrypt', label: t('aes.decrypt') },
        ]}
        active={mode}
        onChange={(id) => { setMode(id as 'encrypt' | 'decrypt'); setOutput(''); setError('') }}
        className="mb-4"
      />

      <Card className="space-y-4 mb-4">
        <Input
          label={t('aes.passphrase')}
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder={t('aes.passphrasePlaceholder')}
          autoComplete="new-password"
        />
        <Textarea
          label={mode === 'encrypt' ? t('aes.plaintextLabel') : t('aes.ciphertextLabel')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className={mode === 'decrypt' ? 'font-mono text-xs' : ''}
          placeholder={mode === 'encrypt' ? t('aes.plaintextPlaceholder') : t('aes.ciphertextPlaceholder')}
        />
        <Button onClick={run} disabled={busy} className="w-full">
          {busy ? t('aes.working') : mode === 'encrypt' ? t('aes.doEncrypt') : t('aes.doDecrypt')}
        </Button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </Card>

      {output && (
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-base-content/70">
              {mode === 'encrypt' ? t('aes.ciphertextOut') : t('aes.plaintextOut')}
            </p>
            <CopyButton text={output} />
          </div>
          <Textarea value={output} readOnly rows={5} className={mode === 'encrypt' ? 'font-mono text-xs' : ''} />
          <p className="text-xs text-base-content/40 leading-relaxed">
            {t('aes.outputFormat')}
          </p>
        </Card>
      )}
    </div>
  )
}
