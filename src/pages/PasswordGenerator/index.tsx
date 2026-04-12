import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { generatePassword, getStrength, STRENGTH_COLORS, type PasswordOptions } from '../../utils/password'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Slider } from '../../components/ui/Slider'
import { CopyButton } from '../../components/ui/CopyButton'

export function PasswordGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('password.title'))

  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  })
  const [password, setPassword] = useState('')

  const generate = useCallback(() => {
    setPassword(generatePassword(options))
  }, [options])

  useEffect(() => { generate() }, [generate])

  const strength = getStrength(password)
  const hasNoCharset = !options.uppercase && !options.lowercase && !options.numbers && !options.symbols

  const toggle = (key: keyof typeof options) => {
    const next = { ...options, [key]: !options[key] }
    const anyOn = next.uppercase || next.lowercase || next.numbers || next.symbols
    if (!anyOn) return
    setOptions(next)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('password.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('password.subtitle')}</p>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 font-mono text-sm text-base-content break-all leading-relaxed">
            {password || <span className="text-base-content/40">—</span>}
          </code>
          <div className="flex gap-2 shrink-0">
            <CopyButton text={password} />
            <Button variant="outline" size="sm" onClick={generate} disabled={hasNoCharset} title="Regenerate">
              <RefreshCw size={14} />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex gap-1 mb-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  strength >= level ? STRENGTH_COLORS[strength] : 'bg-base-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-base-content/50">
            {strength > 0 ? `${t('password.' + (['', 'weak', 'fair', 'good', 'strong'][strength]))}` : t('password.noCharset')}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-medium text-base-content/70 mb-4">{t('password.options')}</h2>

        <Slider
          label={t('password.length')}
          min={4}
          max={128}
          value={options.length}
          onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
          className="mb-5"
        />

        <div className="grid grid-cols-2 gap-3">
          <Checkbox label={t('password.uppercase')} checked={options.uppercase} onChange={() => toggle('uppercase')} />
          <Checkbox label={t('password.lowercase')} checked={options.lowercase} onChange={() => toggle('lowercase')} />
          <Checkbox label={t('password.numbers')}   checked={options.numbers}   onChange={() => toggle('numbers')} />
          <Checkbox label={t('password.symbols')}   checked={options.symbols}   onChange={() => toggle('symbols')} />
        </div>

        <div className="mt-5">
          <Button onClick={generate} disabled={hasNoCharset} className="w-full">
            {t('password.generateBtn')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
