import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  /** Unique key per route so AnimatePresence tracks the transition */
  pageKey: string
  children: ReactNode
}

export function PageTransition({ pageKey, children }: Props) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={pageKey}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
