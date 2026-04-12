import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'
import { Select } from '../../components/ui/Select'
import { CopyButton } from '../../components/ui/CopyButton'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

function capitalise(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function randomWord(exclude?: string): string {
  let w: string
  do { w = WORDS[Math.floor(Math.random() * WORDS.length)] } while (w === exclude)
  return w
}

function generateSentence(wordCount = 8 + Math.floor(Math.random() * 10)): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) words.push(randomWord(words[words.length - 1]))
  return capitalise(words.join(' ')) + '.'
}

function generateParagraph(sentenceCount = 3 + Math.floor(Math.random() * 3)): string {
  return Array.from({ length: sentenceCount }, generateSentence).join(' ')
}

type UnitType = 'paragraphs' | 'sentences' | 'words'

export function LoremIpsum() {
  const { t } = useTranslation()
  useDocumentTitle(t('lorem.title'))
  const [type, setType] = useState<UnitType>('paragraphs')
  const [count, setCount] = useState(3)
  const [seed, setSeed] = useState(0)

  const text = useMemo(() => {
    void seed
    if (type === 'paragraphs') return Array.from({ length: count }, generateParagraph).join('\n\n')
    if (type === 'sentences')  return Array.from({ length: count }, generateSentence).join(' ')
    const words: string[] = []
    for (let i = 0; i < count; i++) words.push(randomWord(words[words.length - 1]))
    return words.join(' ') + '.'
  }, [type, count, seed])

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('lorem.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('lorem.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label={t('lorem.generateType')} value={type} onChange={(e) => setType(e.target.value as UnitType)}>
            <option value="paragraphs">{t('lorem.paragraphs')}</option>
            <option value="sentences">{t('lorem.sentences')}</option>
            <option value="words">{t('lorem.wordsOption')}</option>
          </Select>
          <Slider label="Count" min={1} max={type === 'words' ? 500 : type === 'sentences' ? 50 : 20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setSeed((s) => s + 1)} className="flex-1">{t('common.generate')}</Button>
          <CopyButton text={text} />
        </div>
      </Card>

      <Card>
        <div className="whitespace-pre-wrap text-sm text-base-content/70 leading-relaxed">{text}</div>
      </Card>
    </div>
  )
}
