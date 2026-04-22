import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }: ButtonProps) {
  const reduce = useReducedMotion()
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium cursor-pointer transition-[background-color,border-color,box-shadow,color] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  }
  const variants = {
    primary:
      'bg-primary text-primary-content hover:bg-primary/90 active:bg-primary/80 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.15)] hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2),0_0_24px_-4px_var(--primary-50)]',
    outline:
      'border border-base-content/10 bg-base-100/30 text-base-content/80 hover:bg-base-200 hover:text-base-content hover:border-base-content/20 active:bg-base-300',
    ghost:
      'text-base-content/60 hover:bg-base-content/5 hover:text-base-content',
  }
  const tap = reduce || disabled ? undefined : { scale: 0.97 }

  return (
    <motion.button
      whileTap={tap}
      transition={{ duration: 0.08 }}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}
