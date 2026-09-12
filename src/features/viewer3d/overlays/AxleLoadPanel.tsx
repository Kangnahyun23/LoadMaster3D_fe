import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AxleLoad } from '@/types/load-plan'

/** Từ 90% dung lượng trục trở lên là cảnh báo, vượt 100% là nguy hiểm. */
const WARNING_RATIO = 0.9

function toneOf(axle: AxleLoad): 'primary' | 'warning' | 'danger' {
  const ratio = axle.loadKg / axle.capacityKg
  if (ratio > 1) return 'danger'
  if (ratio >= WARNING_RATIO) return 'warning'
  return 'primary'
}

const VALUE_COLOR = {
  primary: 'text-text',
  warning: 'text-badge-warning-fg',
  danger: 'text-badge-danger-fg',
} as const

/** Panel nổi góc dưới trái: tải trọng hai trục so với dung lượng cho phép. */
export function AxleLoadPanel({
  front,
  rear,
}: {
  front: AxleLoad
  rear: AxleLoad
}) {
  return (
    <div className="flex w-70 flex-col gap-2.5 rounded-md border border-border bg-bg p-3 shadow-e2">
      <span className="text-caption font-medium text-text-3">Tải trọng trục</span>
      <AxleRow label="Trục trước" axle={front} />
      <AxleRow label="Trục sau" axle={rear} />
    </div>
  )
}

function AxleRow({ label, axle }: { label: string; axle: AxleLoad }) {
  const tone = toneOf(axle)
  const percent = (axle.loadKg / axle.capacityKg) * 100

  return (
    <div className="flex flex-col gap-1.25">
      <div className="flex justify-between gap-3 text-caption">
        <span>{label}</span>
        <span className={cn('font-mono', VALUE_COLOR[tone])}>
          {formatInteger(axle.loadKg)}{' '}
          <span className="text-text-3">/ {formatInteger(axle.capacityKg)} kg</span>
        </span>
      </div>
      <ProgressBar value={percent} tone={tone} />
    </div>
  )
}
