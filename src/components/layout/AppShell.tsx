import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { CommandPalette } from './CommandPalette'
import { RouteTracker } from './RouteTracker'
import { AnalyticsTracker } from './AnalyticsTracker'
import { SeoHead } from './SeoHead'
import { useDirection } from '../../hooks/useDirection'
import { useCommandPalette } from '../../hooks/useCommandPalette'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useDirection()
  const { open, closePalette } = useCommandPalette()

  return (
    <div className="flex min-h-screen bg-base-100">
      <SeoHead />
      <RouteTracker />
      <AnalyticsTracker />
      <CommandPalette open={open} onClose={closePalette} />
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
