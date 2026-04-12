import { Check, Copy } from '../../icons'
import { useTranslation } from 'react-i18next'
import { useClipboard } from '../../hooks/useClipboard'
import { Button } from './Button'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md'
  className?: string
}

export function CopyButton({ text, size = 'sm', className = '' }: CopyButtonProps) {
  const { copied, copy } = useClipboard()
  const { t } = useTranslation()
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => copy(text)}
      className={className}
      title={t('common.copy')}
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      {copied ? t('common.copied') : t('common.copy')}
    </Button>
  )
}
