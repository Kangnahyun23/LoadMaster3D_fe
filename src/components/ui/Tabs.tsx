import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Tab gạch chân theo bản design: cao 40px, chữ 14px/500, tab đang chọn
 * đổi màu chữ và có vạch 2px primary sát mép dưới.
 */
export const Tabs = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex gap-3 border-b border-border px-3', className)}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-10 items-center gap-1.5 whitespace-nowrap text-body font-medium text-text-3',
        'transition-colors duration-(--dur-fast) ease-standard',
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
        'data-[state=active]:text-text data-[state=active]:shadow-[inset_0_-2px_0_var(--primary)]',
        className,
      )}
      {...props}
    />
  )
}

/** Số đếm nhỏ cạnh nhãn tab — pill mono 11px. */
export function TabCount({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'danger'
  children: number
}) {
  return (
    <span
      className={cn(
        'rounded-full px-1.5 py-[3px] font-mono text-[11px] leading-none font-medium',
        tone === 'danger'
          ? 'bg-badge-danger-bg text-badge-danger-fg'
          : 'bg-surface text-text-2',
      )}
    >
      {children}
    </span>
  )
}
