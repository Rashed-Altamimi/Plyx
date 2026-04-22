import type { ReactNode } from 'react'

interface ToolHeaderProps {
  /** Small uppercase label that appears above the title (e.g. category name) */
  eyebrow?: ReactNode
  title: string
  subtitle?: string
  /** Slot for action buttons rendered on the right side */
  actions?: ReactNode
}

export function ToolHeader({ eyebrow, title, subtitle, actions }: ToolHeaderProps) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-1.5 mb-2 eyebrow">{eyebrow}</div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-base-content tracking-[-0.03em] mb-1.5">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-base-content/55">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </header>
  )
}
