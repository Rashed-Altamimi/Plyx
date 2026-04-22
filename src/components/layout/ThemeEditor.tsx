import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { X, RefreshCw, Shuffle } from '../../icons'
import {
  useCustomTheme,
  applyCustomVars,
  clearCustomVars,
  sampleCurrentTheme,
  randomTheme,
  CUSTOM_PRESETS,
  DEFAULT_CUSTOM_THEME,
  type CustomTheme,
} from '../../hooks/useCustomTheme'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../ui/Button'
import { parseHex } from '../../utils/palette'

interface Props {
  open: boolean
  onClose: () => void
}

// Which fields the editor exposes, grouped for layout.
const FIELD_GROUPS: Array<{ label: string; fields: Array<{ key: keyof CustomTheme; label: string }> }> = [
  {
    label: 'themeEditor.groups.surfaces',
    fields: [
      { key: 'base100',     label: 'themeEditor.fields.base100' },
      { key: 'base200',     label: 'themeEditor.fields.base200' },
      { key: 'base300',     label: 'themeEditor.fields.base300' },
      { key: 'baseContent', label: 'themeEditor.fields.baseContent' },
    ],
  },
  {
    label: 'themeEditor.groups.brand',
    fields: [
      { key: 'primary',          label: 'themeEditor.fields.primary' },
      { key: 'primaryContent',   label: 'themeEditor.fields.primaryContent' },
      { key: 'secondary',        label: 'themeEditor.fields.secondary' },
      { key: 'secondaryContent', label: 'themeEditor.fields.secondaryContent' },
      { key: 'accent',           label: 'themeEditor.fields.accent' },
      { key: 'accentContent',    label: 'themeEditor.fields.accentContent' },
    ],
  },
]

/** Pick black or white text based on luminance — matches the Contrast Checker. */
function bestContentFor(hex: string): string {
  const rgb = parseHex(hex)
  if (!rgb) return '#ffffff'
  const { r, g, b } = rgb
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.55 ? '#0a0a0a' : '#ffffff'
}

export function ThemeEditor({ open, onClose }: Props) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const { theme: customTheme, replace, reset } = useCustomTheme()
  const { theme: activeTheme, setTheme } = useTheme()

  const [draft, setDraft] = useState<CustomTheme>(customTheme)
  const [autoContent, setAutoContent] = useState(true)
  // Snapshot the pre-open theme so Cancel can revert
  const initialThemeRef = useRef<string>(activeTheme)
  const initialDraftRef = useRef<CustomTheme>(customTheme)

  useEffect(() => {
    if (!open) return
    // Seed the draft from whatever colors are LIVE right now. If the user is
    // already on `custom`, use the saved custom theme; otherwise sample the
    // active DaisyUI theme's CSS variables so editing starts in-context.
    const starting = activeTheme === 'custom'
      ? customTheme
      : sampleCurrentTheme(customTheme)
    initialThemeRef.current = activeTheme
    initialDraftRef.current = starting
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(starting)
    // Overlay the starting colors via inline CSS variables. We do NOT switch
    // the theme — the active DaisyUI theme keeps its data-theme attribute
    // intact, so Cancel can simply strip the overlay.
    applyCustomVars(starting)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live-apply while editing
  useEffect(() => {
    if (!open) return
    applyCustomVars(draft)
  }, [draft, open])

  const patch = (key: keyof CustomTheme, value: string) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      if (autoContent) {
        if (key === 'primary')   next.primaryContent   = bestContentFor(value)
        if (key === 'secondary') next.secondaryContent = bestContentFor(value)
        if (key === 'accent')    next.accentContent    = bestContentFor(value)
        if (key === 'base100')   next.baseContent      = bestContentFor(value)
      }
      return next
    })
  }

  const applyPreset = (id: keyof typeof CUSTOM_PRESETS) => {
    setDraft(CUSTOM_PRESETS[id])
  }

  const save = () => {
    // Persist the user's draft and promote to the custom theme.
    replace(draft)
    setTheme('custom')
    onClose()
  }

  const cancel = () => {
    // We never changed the data-theme, so Cancel just strips our CSS overlay
    // and lets the original DaisyUI theme re-paint. If the user was already
    // on `custom` before opening, re-apply the saved values to undo any
    // half-edited state.
    if (initialThemeRef.current === 'custom') {
      applyCustomVars(initialDraftRef.current)
    } else {
      clearCustomVars()
    }
    onClose()
  }

  const resetToDefault = () => {
    setDraft(DEFAULT_CUSTOM_THEME)
    reset()
  }

  if (typeof document === 'undefined') return null

  // Portal to <body> so the fixed overlay escapes any ancestor containing
  // block (backdrop-blur on the TopNav creates one, which otherwise clips
  // the dialog to the nav strip).
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          onClick={cancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('themeEditor.title')}
            className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-base-100 border border-base-content/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-content/10 shrink-0">
              <div>
                <h2 className="font-display text-lg font-bold text-base-content tracking-tight">
                  {t('themeEditor.title')}
                </h2>
                <p className="text-xs text-base-content/50 mt-0.5">{t('themeEditor.subtitle')}</p>
              </div>
              <button
                onClick={cancel}
                aria-label={t('themeEditor.close')}
                className="p-1.5 rounded-md text-base-content/60 hover:bg-base-content/5 hover:text-base-content cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Presets */}
              <div>
                <p className="eyebrow mb-2">{t('themeEditor.startFrom')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(CUSTOM_PRESETS).map((id) => {
                    const p = CUSTOM_PRESETS[id]
                    return (
                      <button
                        key={id}
                        onClick={() => applyPreset(id as keyof typeof CUSTOM_PRESETS)}
                        className="group flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-base-content/10 bg-base-content/[0.03] hover:bg-base-content/[0.06] cursor-pointer transition-colors"
                      >
                        <div className="flex -space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-base-100" style={{ backgroundColor: p.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-base-100" style={{ backgroundColor: p.secondary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-base-100" style={{ backgroundColor: p.base100 }} />
                        </div>
                        <span className="text-xs text-base-content/80">{t(`themes.${id}`, { defaultValue: id })}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Color scheme toggle */}
              <div className="flex items-center justify-between rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3 py-2.5">
                <div>
                  <p className="text-sm text-base-content">{t('themeEditor.colorScheme')}</p>
                  <p className="text-xs text-base-content/50">{t('themeEditor.colorSchemeHint')}</p>
                </div>
                <div className="flex gap-1 rounded-md bg-base-content/5 p-0.5">
                  {(['light', 'dark'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraft((d) => ({ ...d, colorScheme: s }))}
                      className={`text-xs px-3 py-1 rounded cursor-pointer capitalize ${
                        draft.colorScheme === s ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/60'
                      }`}
                    >
                      {t(`themeEditor.scheme.${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-contrast toggle */}
              <label className="flex items-center gap-2 text-sm text-base-content/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoContent}
                  onChange={(e) => setAutoContent(e.target.checked)}
                  className="w-4 h-4 rounded border-base-content/20"
                />
                {t('themeEditor.autoContent')}
              </label>

              {/* Fields */}
              {FIELD_GROUPS.map((g) => (
                <div key={g.label}>
                  <p className="eyebrow mb-2">{t(g.label)}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {g.fields.map((f) => (
                      <ColorRow
                        key={f.key}
                        label={t(f.label)}
                        value={draft[f.key] as string}
                        onChange={(v) => patch(f.key, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Preview strip */}
              <div>
                <p className="eyebrow mb-2">{t('themeEditor.preview')}</p>
                <div className="rounded-lg border border-base-content/10 p-4 space-y-2" style={{ backgroundColor: draft.base100, color: draft.baseContent }}>
                  <p className="text-sm">{t('themeEditor.previewHeading')}</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-md text-xs" style={{ backgroundColor: draft.primary, color: draft.primaryContent }}>
                      Primary
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs" style={{ backgroundColor: draft.secondary, color: draft.secondaryContent }}>
                      Secondary
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs" style={{ backgroundColor: draft.accent, color: draft.accentContent }}>
                      Accent
                    </span>
                  </div>
                  <div className="rounded-md px-3 py-2 text-xs" style={{ backgroundColor: draft.base200 }}>
                    {t('themeEditor.previewSurface')}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-base-content/10 bg-base-content/[0.02] shrink-0">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetToDefault}>
                  <RefreshCw size={13} /> {t('themeEditor.reset')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDraft(randomTheme())}>
                  <Shuffle size={13} /> {t('themeEditor.randomize')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={cancel}>{t('themeEditor.cancel')}</Button>
                <Button size="sm" onClick={save}>{t('themeEditor.save')}</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-content/[0.02] px-2 py-1.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded border border-base-content/10 bg-transparent cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-base-content/60 truncate">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs font-mono text-base-content outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
