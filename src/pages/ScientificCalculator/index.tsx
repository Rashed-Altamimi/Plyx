import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { evaluate } from '../../utils/mathEval'

type Mode = 'rad' | 'deg'

const BUTTONS: (string | { label: string; value: string; span?: number; variant?: 'op' | 'fn' | 'eq' })[] = [
  { label: 'sin', value: 'sin(', variant: 'fn' },
  { label: 'cos', value: 'cos(', variant: 'fn' },
  { label: 'tan', value: 'tan(', variant: 'fn' },
  { label: 'π', value: 'pi', variant: 'fn' },
  { label: 'e', value: 'e', variant: 'fn' },
  { label: 'ln', value: 'ln(', variant: 'fn' },
  { label: 'log', value: 'log(', variant: 'fn' },
  { label: '√', value: 'sqrt(', variant: 'fn' },
  { label: '^', value: '^', variant: 'op' },
  { label: 'x!', value: '!', variant: 'fn' },
  { label: '(', value: '(', variant: 'op' },
  { label: ')', value: ')', variant: 'op' },
  { label: 'C', value: 'CLEAR', variant: 'op' },
  { label: '⌫', value: 'BACK', variant: 'op' },
  { label: '÷', value: '/', variant: 'op' },
  '7','8','9',
  { label: '×', value: '*', variant: 'op' },
  '4','5','6',
  { label: '−', value: '-', variant: 'op' },
  '1','2','3',
  { label: '+', value: '+', variant: 'op' },
  '0','.',
  { label: '=', value: '=', variant: 'eq' },
]

export function ScientificCalculator() {
  const { t } = useTranslation()
  useDocumentTitle(t('scientific.title'))
  const [expr, setExpr] = useState('')
  const [result, setResult] = useState<string>('')
  const [mode, setMode] = useState<Mode>('deg')
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([])
  const [error, setError] = useState(false)

  const handleInput = (value: string) => {
    setError(false)
    if (value === 'CLEAR') {
      setExpr('')
      setResult('')
      return
    }
    if (value === 'BACK') {
      setExpr((e) => e.slice(0, -1))
      return
    }
    if (value === '=') {
      try {
        const r = evaluate(expr, mode)
        const rStr = Number(r.toFixed(12)).toString()
        setResult(rStr)
        setHistory((h) => [{ expr, result: rStr }, ...h].slice(0, 10))
      } catch {
        setError(true)
        setResult(t('scientific.error'))
      }
      return
    }
    setExpr((e) => e + value)
  }

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('scientific.title')}</h1>
      <p className="text-sm text-base-content/50 mb-6">{t('scientific.subtitle')}</p>

      <Card className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-1 bg-base-200 rounded-lg p-1">
            <button
              onClick={() => setMode('deg')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${mode === 'deg' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/50'}`}
            >
              {t('scientific.deg')}
            </button>
            <button
              onClick={() => setMode('rad')}
              className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${mode === 'rad' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/50'}`}
            >
              {t('scientific.rad')}
            </button>
          </div>
        </div>

        <div className="bg-base-200 rounded-lg p-4 mb-3 text-right">
          <p className="text-sm text-base-content/50 font-mono min-h-6 break-all">{expr || '\u00A0'}</p>
          <p className={`text-3xl font-mono font-bold break-all ${error ? 'text-red-500' : 'text-base-content'}`}>
            {result || '0'}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {BUTTONS.map((btn, i) => {
            const label = typeof btn === 'string' ? btn : btn.label
            const value = typeof btn === 'string' ? btn : btn.value
            const variant = typeof btn === 'object' ? btn.variant : undefined
            const classes =
              variant === 'eq' ? 'bg-primary text-primary-content hover:bg-primary/90' :
              variant === 'op' ? 'bg-base-300 text-base-content hover:bg-base-content/20' :
              variant === 'fn' ? 'bg-base-200 text-base-content/70 hover:bg-base-300 text-xs' :
              'bg-base-100 border border-base-200 text-base-content hover:bg-base-200'
            return (
              <button
                key={i}
                onClick={() => handleInput(value)}
                className={`h-11 rounded-lg font-medium cursor-pointer transition-colors ${classes}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </Card>

      {history.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{t('scientific.history')}</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setExpr(h.expr); setResult(h.result); setError(false) }}
                className="w-full text-left text-xs font-mono text-base-content/60 hover:bg-base-200 rounded px-2 py-1 cursor-pointer"
              >
                {h.expr} = <span className="text-base-content font-semibold">{h.result}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
