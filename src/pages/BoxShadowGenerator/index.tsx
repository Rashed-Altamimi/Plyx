import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Card } from '../../components/ui/Card'
import { Slider } from '../../components/ui/Slider'
import { Checkbox } from '../../components/ui/Checkbox'
import { CopyButton } from '../../components/ui/CopyButton'

interface ShadowLayer {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

export function BoxShadowGenerator() {
  const { t } = useTranslation()
  useDocumentTitle(t('boxShadow.title'))
  const [layer, setLayer] = useState<ShadowLayer>({
    x: 0, y: 10, blur: 20, spread: 0, color: '#000000', inset: false,
  })
  const [opacity, setOpacity] = useState(20)

  const shadowValue = useMemo(() => {
    const hex = layer.color
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
    const inset = layer.inset ? 'inset ' : ''
    return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${rgba}`
  }, [layer, opacity])

  const update = (patch: Partial<ShadowLayer>) => setLayer({ ...layer, ...patch })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-base-content mb-1">{t('boxShadow.title')}</h1>
      <p className="text-sm text-base-content/50 mb-8">{t('boxShadow.subtitle')}</p>

      <Card className="mb-4 h-64 flex items-center justify-center bg-base-200">
        <div
          className="w-32 h-32 bg-base-100 rounded-xl"
          style={{ boxShadow: shadowValue }}
        />
      </Card>

      <Card className="space-y-4 mb-4">
        <Slider label={`${t('boxShadow.offsetX')} (${layer.x}px)`} min={-50} max={50} value={layer.x} onChange={(e) => update({ x: Number(e.target.value) })} />
        <Slider label={`${t('boxShadow.offsetY')} (${layer.y}px)`} min={-50} max={50} value={layer.y} onChange={(e) => update({ y: Number(e.target.value) })} />
        <Slider label={`${t('boxShadow.blur')} (${layer.blur}px)`} min={0} max={100} value={layer.blur} onChange={(e) => update({ blur: Number(e.target.value) })} />
        <Slider label={`${t('boxShadow.spread')} (${layer.spread}px)`} min={-50} max={50} value={layer.spread} onChange={(e) => update({ spread: Number(e.target.value) })} />
        <Slider label={`Opacity (${opacity}%)`} min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
        <div>
          <label className="text-sm font-medium text-base-content/70 block mb-1.5">{t('boxShadow.color')}</label>
          <input type="color" value={layer.color} onChange={(e) => update({ color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
        </div>
        <Checkbox label={t('boxShadow.inset')} checked={layer.inset} onChange={(e) => update({ inset: e.target.checked })} />
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-base-content/70">{t('boxShadow.css')}</label>
          <CopyButton text={`box-shadow: ${shadowValue};`} />
        </div>
        <code className="block text-xs font-mono text-base-content bg-base-200 rounded-lg p-3 break-all">
          box-shadow: {shadowValue};
        </code>
      </Card>
    </div>
  )
}
