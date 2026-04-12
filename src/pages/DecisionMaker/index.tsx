import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus } from 'lucide-react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'

function securePick<T>(arr: T[]): T {
  const idx = crypto.getRandomValues(new Uint32Array(1))[0] % arr.length
  return arr[idx]
}

export function DecisionMaker() {
  const { t } = useTranslation()
  useDocumentTitle(t('decide.title'))
  const [mode, setMode] = useState('yesNo')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [result, setResult] = useState<string | null>(null)

  const TABS = [
    { id: 'yesNo', label: t('decide.yesNo') },
    { id: 'pickOne', label: t('decide.pickOne') },
  ]

  const decide = () => {
    if (mode === 'yesNo') {
      setResult(securePick([t('decide.yes'), t('decide.no')]))
    } else {
      const valid = options.filter((o) => o.trim())
      if (valid.length < 2) {
        setResult(null)
        return
      }
      setResult(securePick(valid))
    }
  }

  const addOption = () => setOptions([...options, ''])
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i))
  const updateOption = (i: number, v: string) => {
    const next = [...options]
    next[i] = v
    setOptions(next)
  }

  const validCount = options.filter((o) => o.trim()).length

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('decide.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('decide.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Tabs tabs={TABS} active={mode} onChange={(id) => { setMode(id); setResult(null) }} />

        {mode === 'pickOne' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-base-content/70">{t('decide.options')}</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
                    <X size={14} />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus size={14} /> {t('decide.addOption')}
            </Button>
          </div>
        )}

        <Button onClick={decide} disabled={mode === 'pickOne' && validCount < 2} className="w-full">
          {t('decide.decide')}
        </Button>
      </Card>

      {result && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-8 text-center">
          <p className="text-xs text-primary/60 mb-2 font-medium uppercase tracking-wider">{t('decide.resultLabel')}</p>
          <p className="text-4xl font-bold text-primary">{result}</p>
        </div>
      )}
    </div>
  )
}
