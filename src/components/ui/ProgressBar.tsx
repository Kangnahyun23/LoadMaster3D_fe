import { formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Thanh tiến độ 8px, bo tròn hoàn toàn, viền 1px, nền surface.
 * Dạng viên thuốc ở đây là thanh chỉ báo chứ không phải nút, nên không
 * vướng luật "không bo tròn hoàn toàn cho nút hành động" (mục 5).
 */
export function ProgressBar({
  label,
  /** 0–100 */
  value,
  className,
  tone = 'primary',
}: {
  label?: string
  value: number
  className?: string
  tone?: 'primary' | 'warning' | 'danger'
}) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex justify-between gap-3">
          <span className="text-caption text-text-2">{label}</span>
          <span className="font-mono text-caption font-medium">
            {formatInteger(clamped)}%
          </span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 overflow-hidden rounded-full border border-border bg-surface"
      >
        <div
          className={cn(
            'h-full transition-[width] duration-(--dur-md) ease-decelerate',
            tone === 'primary' && 'bg-primary',
            tone === 'warning' && 'bg-warning',
            tone === 'danger' && 'bg-danger',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
