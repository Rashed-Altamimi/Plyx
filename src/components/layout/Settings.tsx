import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, Palette, Globe, Check } from '../../icons'
import { useTheme, THEMES } from '../../hooks/useTheme'
import { useAnalyticsOptOut } from '../../hooks/useAnalyticsOptOut'
import { LANGUAGES } from '../../i18n'

/**
 * Consolidated settings popover: theme, language, analytics opt-out.
 * Mounted from the sidebar footer (and mobile drawer footer).
 */
export function Settings({ align = 'start' }: { align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false)
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { optedOut, toggle: toggleAnalytics } = useAnalyticsOptOut()
  const rootRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('settings.open')}
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
          open
            ? 'bg-base-content/10 text-base-content'
            : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content'
        }`}
      >
        <SettingsIcon size={12} />
        <span>{t('settings.title')}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={t('settings.title')}
            className={`absolute bottom-full ${align === 'end' ? 'end-0' : 'start-0'} mb-2 z-50 w-64 rounded-xl border border-base-content/10 bg-base-100/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] p-2`}
          >
            {/* Theme */}
            <SettingsGroup icon={<Palette size={11} />} label={t('common.theme')}>
              <div className="max-h-44 overflow-y-auto py-0.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      theme === th.id
                        ? 'bg-primary/10 text-base-content'
                        : 'text-base-content/70 hover:bg-base-content/5'
                    }`}
                  >
                    <span className="w-4 text-center">{th.emoji}</span>
                    <span className="flex-1 text-start">{t(`themes.${th.id}`)}</span>
                    {theme === th.id && <Check size={12} className="text-primary" />}
                  </button>
                ))}
              </div>
            </SettingsGroup>

            <div className="my-1.5 mx-1 h-px bg-base-content/10" />

            {/* Language */}
            <SettingsGroup icon={<Globe size={11} />} label={t('settings.language')}>
              <div className="py-0.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      currentLang.code === lang.code
                        ? 'bg-primary/10 text-base-content'
                        : 'text-base-content/70 hover:bg-base-content/5'
                    }`}
                  >
                    <span className="w-4 text-center text-[10px] font-mono uppercase text-base-content/50">{lang.code}</span>
                    <span className="flex-1 text-start">{lang.label}</span>
                    {currentLang.code === lang.code && <Check size={12} className="text-primary" />}
                  </button>
                ))}
              </div>
            </SettingsGroup>

            <div className="my-1.5 mx-1 h-px bg-base-content/10" />

            {/* Analytics toggle */}
            <div className="px-2.5 py-1.5">
              <button
                onClick={toggleAnalytics}
                className="w-full flex items-center justify-between gap-2 text-xs text-base-content/70 hover:text-base-content transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${!optedOut ? 'bg-emerald-500' : 'bg-base-content/30'}`} />
                  {t('analytics.label')}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${!optedOut ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/25' : 'bg-base-content/5 text-base-content/50 ring-1 ring-inset ring-base-content/10'}`}>
                  {!optedOut ? t('analytics.on') : t('analytics.off')}
                </span>
              </button>
              <p className="text-[10px] text-base-content/40 mt-1.5 leading-relaxed">
                {t('settings.analyticsHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SettingsGroup({ icon, label, children }: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 eyebrow">
        {icon}
        {label}
      </div>
      {children}
    </div>
  )
}
