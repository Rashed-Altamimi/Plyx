import { useId, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  children?: ReactNode
  className?: string
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  const layoutId = useId()
  const reduce = useReducedMotion()

  return (
    <div className={`flex gap-1 rounded-lg bg-base-300 p-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
              isActive ? 'text-base-content' : 'text-base-content/50 hover:text-base-content/70'
            }`}
          >
            {isActive && !reduce && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-base-100 shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.8 }}
              />
            )}
            {isActive && reduce && (
              <span className="absolute inset-0 rounded-md bg-base-100 shadow-sm" />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
