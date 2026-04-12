import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-base-200 bg-base-100 p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
