import { useState, useRef, useEffect } from 'react'
import { Palette } from '../../icons'
import { useTranslation } from 'react-i18next'
import { useTheme, THEMES } from '../../hooks/useTheme'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  // Adjust popup position if it overflows viewport
  useEffect(() => {
    if (open && popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      if (rect.top < 8) {
        popupRef.current.style.bottom = 'auto'
        popupRef.current.style.top = '100%'
        popupRef.current.style.marginTop = '0.5rem'
        popupRef.current.style.marginBottom = '0'
      }
    }
  }, [open])

  const currentLabel = THEMES.find((th) => th.id === theme)
  const translatedLabel = currentLabel ? t(`themes.${currentLabel.id}`) : ''

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors cursor-pointer"
      >
        <Palette size={12} />
        <span>{translatedLabel}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={popupRef}
            className="absolute bottom-full start-0 mb-2 z-50 bg-base-100 border border-base-200 rounded-xl shadow-lg p-2 w-48 max-h-64 overflow-y-auto"
          >
            <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider px-2.5 py-1">
              {t('common.theme')}
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => { setTheme(th.id); setOpen(false) }}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    theme === th.id
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-base-content/70 hover:bg-base-200'
                  }`}
                >
                  <span>{th.emoji}</span>
                  <span>{t(`themes.${th.id}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
