import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Dices } from '../../icons'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'
import { Select } from '../../components/ui/Select'

function secureRoll(sides: number): number {
  return (crypto.getRandomValues(new Uint32Array(1))[0] % sides) + 1
}

export function DiceRoller() {
  const { t } = useTranslation()
  useDocumentTitle(t('dice.title'))
  const reduce = useReducedMotion()
  const [count, setCount] = useState(2)
  const [sides, setSides] = useState(6)
  const [rolls, setRolls] = useState<number[]>([])
  const [rollId, setRollId] = useState(0)

  const roll = () => {
    setRolls(Array.from({ length: count }, () => secureRoll(sides)))
    setRollId((n) => n + 1)
  }

  const total = rolls.reduce((sum, r) => sum + r, 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('dice.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('dice.subtitle')}</p>

      <Card className="space-y-4 mb-4">
        <Slider label={t('dice.count')} min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        <Select label={t('dice.sides')} value={sides} onChange={(e) => setSides(Number(e.target.value))}>
          <option value={4}>d4</option>
          <option value={6}>d6</option>
          <option value={8}>d8</option>
          <option value={10}>d10</option>
          <option value={12}>d12</option>
          <option value={20}>d20</option>
          <option value={100}>d100</option>
        </Select>
        <Button onClick={roll} className="w-full">
          <Dices size={16} /> {t('dice.roll')}
        </Button>
      </Card>

      <AnimatePresence>
        {rolls.length > 0 && (
          <motion.div
            key={rollId}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3">
                {rolls.map((r, i) => (
                  <motion.div
                    key={`${rollId}-${i}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 520,
                      damping: 22,
                      delay: reduce ? 0 : i * 0.06,
                    }}
                    className="w-14 h-14 rounded-xl bg-primary/10 border-2 border-primary/25 flex items-center justify-center text-xl font-bold text-primary tabular-nums"
                  >
                    {r}
                  </motion.div>
                ))}
              </div>
              <div className="text-center border-t border-base-200 pt-4">
                <p className="text-2xl font-bold text-base-content tabular-nums">{t('dice.total', { n: total })}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
