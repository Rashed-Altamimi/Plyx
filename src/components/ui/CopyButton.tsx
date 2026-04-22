import { Check, Copy } from '../../icons'
import { useTranslation } from 'react-i18next'
import { useClipboard } from '../../hooks/useClipboard'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md'
  className?: string
  /** Hide the text label, showing only the icon inside the tooltip */
  iconOnly?: boolean
}

export function CopyButton({ text, size = 'sm', className = '', iconOnly = false }: CopyButtonProps) {
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()
  const label = copied ? t('common.copied') : t('common.copy')

  const button = (
    <Button
      variant="outline"
      size={size}
      onClick={() => copy(text)}
      className={className}
      aria-label={label}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {!iconOnly && label}
    </Button>
  )

  return <Tooltip content={label}>{button}</Tooltip>
}
