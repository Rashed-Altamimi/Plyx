import type { ReactNode, HTMLAttributes } from 'react'

/**
 * Wraps the content of a tool page with a sensible max-width for its layout
 * intent. Pages can opt in to wider/narrower layouts by picking a variant
 * instead of hard-coding `max-w-*` classes.
 *
 * Each variant scales progressively on wider monitors via the custom
 * `3xl` (1920), `4xl` (2560), and `5xl` (3840) breakpoints so that 2K and 4K
 * screens don't see acres of empty gutter.
 */
type Variant = 'narrow' | 'medium' | 'wide' | 'full'

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  children: ReactNode
}

const WIDTH: Record<Variant, string> = {
  narrow: 'max-w-2xl 3xl:max-w-3xl 4xl:max-w-4xl',
  medium: 'max-w-4xl 3xl:max-w-5xl 4xl:max-w-6xl 5xl:max-w-7xl',
  wide:   'max-w-6xl 3xl:max-w-7xl 4xl:max-w-[1760px] 5xl:max-w-[2400px]',
  full:   'max-w-none',
}

export function PageShell({ variant = 'narrow', className = '', children, ...props }: PageShellProps) {
  return (
    <div className={`${WIDTH[variant]} mx-auto px-6 py-10 ${className}`} {...props}>
      {children}
    </div>
  )
}
