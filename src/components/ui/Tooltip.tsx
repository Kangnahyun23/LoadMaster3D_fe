import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tooltip nền tối, chữ trắng 12px, radius 6px.
 * Là lớp nổi nên được dùng bóng (mục 5 CLAUDE.md).
 */
export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
  className,
  sideOffset = 10,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-100 rounded-sm bg-text px-2 py-1.5',
          'text-caption text-white shadow-e2',
          'select-none',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}
