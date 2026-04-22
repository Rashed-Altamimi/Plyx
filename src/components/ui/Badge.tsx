import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange'
  className?: string
}

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  const colors = {
    gray:   'bg-base-content/10 text-base-content/70 ring-1 ring-inset ring-base-content/10',
    blue:   'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/25',
    green:  'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
    yellow: 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/25',
    red:    'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/25',
    orange: 'bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/25',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
