import { useTranslation } from 'react-i18next'
import { useAnalyticsOptOut } from '../../hooks/useAnalyticsOptOut'

export function AnalyticsToggle() {
  const { t } = useTranslation()
  const { optedOut, toggle } = useAnalyticsOptOut()
  const enabled = !optedOut

  return (
    <button
      onClick={toggle}
      title={enabled ? t('analytics.disable') : t('analytics.enable')}
      className="flex items-center justify-between gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            enabled ? 'bg-green-500' : 'bg-base-content/30'
          }`}
        />
        {t('analytics.label')}
      </span>
      <span className="font-medium">
        {enabled ? t('analytics.on') : t('analytics.off')}
      </span>
    </button>
  )
}
