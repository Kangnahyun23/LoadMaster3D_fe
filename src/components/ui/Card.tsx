import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Card: viền 1px, radius 8px, padding 20px.
 *
 * Lệch có chủ ý khỏi style sheet: bản design đặt `box-shadow: 0 1px 2px`
 * lên card, nhưng CLAUDE.md mục 5 cấm đổ bóng lên card — bóng chỉ dành cho
 * dropdown, modal, toast, popover. Ở đây theo CLAUDE.md.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-md border border-border bg-bg', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-border px-5 py-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('text-h3 font-medium text-text', className)}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}
