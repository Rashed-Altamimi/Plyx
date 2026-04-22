import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-base-content/[0.06] bg-base-200/40 backdrop-blur-sm p-5 shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--color-base-content)_4%,transparent)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
