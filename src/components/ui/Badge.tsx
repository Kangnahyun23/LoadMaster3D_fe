import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Badge trạng thái theo mục 4 style sheet.
 * Cao 22px, pill, chữ 12px/500, nền nhạt + viền cùng tông.
 * Chấm 6px đánh dấu trạng thái đang diễn ra.
 */
const badgeVariants = cva(
  [
    'inline-flex h-[22px] shrink-0 items-center gap-1.5 whitespace-nowrap',
    'rounded-full border px-2.5',
    'text-caption font-medium leading-none',
  ],
  {
    variants: {
      tone: {
        neutral:
          'border-badge-neutral-border bg-badge-neutral-bg text-badge-neutral-fg',
        info: 'border-badge-info-border bg-badge-info-bg text-badge-info-fg',
        cyan: 'border-badge-cyan-border bg-badge-cyan-bg text-badge-cyan-fg',
        success:
          'border-badge-success-border bg-badge-success-bg text-badge-success-fg',
        warning:
          'border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg',
        danger:
          'border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Chấm 6px cho trạng thái đang diễn ra */
    dot?: boolean
  }

export function Badge({
  className,
  tone,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden
          className="size-1.5 flex-none rounded-full bg-current"
        />
      ) : null}
      {children}
    </span>
  )
}

export { badgeVariants }
