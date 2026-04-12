import type { ReactNode } from 'react'

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
  return (
    <div className={`flex gap-1 rounded-lg bg-base-300 p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
            active === tab.id
              ? 'bg-base-100 text-base-content shadow-sm'
              : 'text-base-content/50 hover:text-base-content/70'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
