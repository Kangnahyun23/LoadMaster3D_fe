import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Select theo mục 5 style sheet: cao 40px, viền 1px, radius 8px,
 * mũi tên 16px stroke 1.5. Danh sách thả xuống là lớp nổi nên được
 * dùng bóng (mục 5 AGENTS.md cho phép bóng ở dropdown).
 */
export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-bg px-3',
        'text-body text-text outline-none',
        'focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-disabled',
        'data-[placeholder]:text-text-3',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-text-3" strokeWidth={1.5} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          // Trên lớp phủ hộp thoại (z-300): Select trong Dialog (form người dùng) phải bấm được
          'z-400 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
          'rounded-md border border-border bg-bg shadow-e2',
          position === 'popper' && 'translate-y-1',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-sm px-2 pr-8',
        'text-body text-text outline-none',
        'data-[highlighted]:bg-surface',
        'data-[state=checked]:bg-primary-bg',
        'data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="size-4 text-primary" strokeWidth={1.5} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
