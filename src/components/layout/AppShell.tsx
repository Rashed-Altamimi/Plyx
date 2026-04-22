import type { ReactNode } from 'react'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
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
    <div className="flex flex-col min-h-screen bg-base-100">
      <SeoHead />
      <RouteTracker />
      <AnalyticsTracker />
      <CommandPalette open={open} onClose={closePalette} />
      <TopNav />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
