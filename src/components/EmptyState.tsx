import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Trạng thái rỗng: khung nét đứt trên nền surface, hình minh hoạ nhỏ,
 * tiêu đề, mô tả và đúng một hành động chính.
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-md border border-dashed border-switch-off bg-bg/70 px-6 py-12 text-center',
        className,
      )}
    >
      {illustration}
      <div className="flex flex-col gap-1">
        <span className="text-body-lg font-semibold">{title}</span>
        {description ? (
          <span className="max-w-100 text-body text-pretty text-text-2">{description}</span>
        ) : null}
      </div>
      {action}
    </div>
  )
}
