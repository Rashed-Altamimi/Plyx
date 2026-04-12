import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Textarea } from '../../components/ui/Textarea'
import { CopyButton } from '../../components/ui/CopyButton'
import { textToMorse, morseToText } from '../../data/morseCode'

export function MorseCode() {
  const { t } = useTranslation()
  useDocumentTitle(t('morse.title'))

  const [text, setText] = useState('HELLO WORLD')
  const [morse, setMorse] = useState(textToMorse('HELLO WORLD'))

  const handleTextChange = (v: string) => {
    setText(v)
    setMorse(textToMorse(v))
  }

  const handleMorseChange = (v: string) => {
    setMorse(v)
    setText(morseToText(v))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('morse.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('morse.subtitle')}</p>

      <div className="space-y-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('morse.text')}</label>
            {text && <CopyButton text={text} />}
          </div>
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={3}
            placeholder="HELLO WORLD"
            className="font-mono uppercase"
          />
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-base-content/70">{t('morse.morse')}</label>
            {morse && <CopyButton text={morse} />}
          </div>
          <Textarea
            value={morse}
            onChange={(e) => handleMorseChange(e.target.value)}
            rows={3}
            placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
            className="font-mono"
          />
          <p className="text-xs text-base-content/40">
            Letters separated by spaces; words separated by <code className="font-mono">/</code>.
          </p>
        </Card>
      </div>
    </div>
  )
}
