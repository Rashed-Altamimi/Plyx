import * as RT from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const TooltipProvider = RT.Provider

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  /** Keyboard shortcut hint rendered in a kbd tag */
  shortcut?: string
}

export function Tooltip({ content, children, side = 'top', shortcut }: TooltipProps) {
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-base-content text-base-100 px-2 py-1 text-xs shadow-lg"
        >
          <span className="flex items-center gap-1.5">
            {content}
            {shortcut && (
              <kbd className="font-mono bg-base-100/20 px-1 rounded text-[10px]">
                {shortcut}
              </kbd>
            )}
          </span>
          <RT.Arrow className="fill-base-content" width={10} height={5} />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  )
}
