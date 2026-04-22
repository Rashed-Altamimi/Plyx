import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }: ButtonProps) {
  const reduce = useReducedMotion()
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  }
  const variants = {
    primary: 'bg-primary text-primary-content hover:bg-primary/90 active:bg-primary/80',
    outline: 'border border-base-300 text-base-content/70 hover:bg-base-200 active:bg-base-300',
    ghost: 'text-base-content/60 hover:bg-base-300 hover:text-base-content',
  }
  const tap = reduce || disabled ? undefined : { scale: 0.97 }

  return (
    // Cast via any to bridge HTML button event types (React synthetic events) with motion's
    // custom animation event types — the runtime behavior is identical.
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
