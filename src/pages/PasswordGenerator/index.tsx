import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useHashState } from '../../hooks/useHashState'
import {
  generatePassword,
  generatePassphrase,
  getStrength,
  passwordEntropy,
  passphraseEntropy,
  STRENGTH_COLORS,
} from '../../utils/password'
import { PASSPHRASE_WORDS } from '../../data/passphraseWords'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Slider } from '../../components/ui/Slider'
import { Input } from '../../components/ui/Input'
import { Tabs } from '../../components/ui/Tabs'
import { CopyButton } from '../../components/ui/CopyButton'

const DEFAULTS = {
  mode: 'password' as 'password' | 'passphrase',
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
  words: 4,
  separator: '-',
  capitalize: false,
  includeNumber: true,
}

export function PasswordGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('password.title'))

  const [state, setState] = useHashState(DEFAULTS)
  const [password, setPassword] = useState('')

  const TABS = [
    { id: 'password', label: t('password.passwordTab') },
    { id: 'passphrase', label: t('password.passphraseTab') },
  ]

  const hasNoCharset = !state.uppercase && !state.lowercase && !state.numbers && !state.symbols

  const generate = useCallback(() => {
    if (state.mode === 'passphrase') {
      setPassword(
        generatePassphrase(PASSPHRASE_WORDS as unknown as string[], {
          words: state.words,
          separator: state.separator,
          capitalize: state.capitalize,
          includeNumber: state.includeNumber,
        })
      )
    } else {
      if (hasNoCharset) { setPassword(''); return }
      setPassword(
        generatePassword({
          length: state.length,
          uppercase: state.uppercase,
          lowercase: state.lowercase,
          numbers: state.numbers,
          symbols: state.symbols,
        })
      )
    }
  }, [state, hasNoCharset])

  useEffect(() => { generate() }, [generate])

  const strength = getStrength(password)

  const entropy = useMemo(() => {
    if (state.mode === 'passphrase') {
      return passphraseEntropy(PASSPHRASE_WORDS.length, state.words, state.includeNumber)
    }
    return passwordEntropy(password, {
      length: state.length,
      uppercase: state.uppercase,
      lowercase: state.lowercase,
      numbers: state.numbers,
      symbols: state.symbols,
    })
  }, [state, password])

  const toggle = (key: 'uppercase' | 'lowercase' | 'numbers' | 'symbols') => {
    const next = { ...state, [key]: !state[key] }
    if (!(next.uppercase || next.lowercase || next.numbers || next.symbols)) return
    setState(next)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('password.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('password.subtitle')}</p>

      <Tabs
        tabs={TABS}
        active={state.mode}
        onChange={(id) => setState({ ...state, mode: id as 'password' | 'passphrase' })}
        className="mb-4"
      />

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <code className="flex-1 font-mono text-sm text-base-content break-all leading-relaxed">
            {password || <span className="text-base-content/40">—</span>}
          </code>
          <div className="flex gap-2 shrink-0">
            <CopyButton text={password} />
            <Button variant="outline" size="sm" onClick={generate} disabled={state.mode === 'password' && hasNoCharset} title={t('password.regenerate')}>
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
          <div className="flex items-center justify-between text-xs text-base-content/50">
            <span>
              {strength > 0
                ? t('password.' + (['', 'weak', 'fair', 'good', 'strong'][strength]))
                : (state.mode === 'password' ? t('password.noCharset') : '')}
            </span>
            {entropy > 0 && (
              <span className="font-mono">
                {t('password.entropyBits', { bits: entropy.toFixed(1) })}
              </span>
            )}
          </div>
        </div>
      </Card>

      {state.mode === 'password' ? (
        <Card>
          <h2 className="text-sm font-medium text-base-content/70 mb-4">{t('password.options')}</h2>

          <Slider
            label={t('password.length')}
            min={4}
            max={128}
            value={state.length}
            onChange={(e) => setState({ ...state, length: Number(e.target.value) })}
            className="mb-5"
          />

          <div className="grid grid-cols-2 gap-3">
            <Checkbox label={t('password.uppercase')} checked={state.uppercase} onChange={() => toggle('uppercase')} />
            <Checkbox label={t('password.lowercase')} checked={state.lowercase} onChange={() => toggle('lowercase')} />
            <Checkbox label={t('password.numbers')}   checked={state.numbers}   onChange={() => toggle('numbers')} />
            <Checkbox label={t('password.symbols')}   checked={state.symbols}   onChange={() => toggle('symbols')} />
          </div>

          <div className="mt-5">
            <Button onClick={generate} disabled={hasNoCharset} className="w-full">
              {t('password.generateBtn')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-sm font-medium text-base-content/70 mb-4">{t('password.options')}</h2>

          <Slider
            label={t('password.words')}
            min={2}
            max={10}
            value={state.words}
            onChange={(e) => setState({ ...state, words: Number(e.target.value) })}
            className="mb-4"
          />

          <div className="grid grid-cols-[1fr_auto] gap-4 items-end mb-3">
            <Input
              label={t('password.separator')}
              value={state.separator}
              onChange={(e) => setState({ ...state, separator: e.target.value.slice(0, 3) })}
              maxLength={3}
            />
          </div>

          <div className="space-y-2 mb-5">
            <Checkbox label={t('password.capitalize')} checked={state.capitalize} onChange={(e) => setState({ ...state, capitalize: e.target.checked })} />
            <Checkbox label={t('password.includeNumber')} checked={state.includeNumber} onChange={(e) => setState({ ...state, includeNumber: e.target.checked })} />
          </div>

          <Button onClick={generate} className="w-full">
            {t('password.generatePassphrase')}
          </Button>
        </Card>
      )}
    </div>
  )
}
