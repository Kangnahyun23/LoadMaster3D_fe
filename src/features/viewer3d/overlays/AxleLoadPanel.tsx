import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatInteger, formatRatioAsPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AxleLoad } from '@/types/load-plan'

/** Từ 90% dung lượng trục trở lên là cảnh báo, vượt 100% là nguy hiểm. */
const WARNING_RATIO = 0.9

function toneOf(axle: AxleLoad): 'primary' | 'warning' | 'danger' {
  if (axle.capacityKg <= 0) return 'primary'
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
  compact = false,
}: {
  front: AxleLoad
  rear: AxleLoad
  compact?: boolean
}) {
  return (
    <div className={cn('flex min-w-64 flex-col gap-2.5 rounded-md border border-border bg-bg p-3', compact ? 'w-70' : 'w-full')}>
      <span className="text-body-lg font-medium xl:text-caption">Tải trục phương án gốc</span>
      <AxleRow label="Trục trước" axle={front} />
      <AxleRow label="Trục sau" axle={rear} />
      {!compact ? <p className="text-body-lg text-text-2 xl:text-caption">Chưa tính lại theo chỉnh sửa hoặc từng bước dỡ.</p> : null}
    </div>
  )
}

function AxleRow({ label, axle }: { label: string; axle: AxleLoad }) {
  const tone = toneOf(axle)
  const ratio = axle.capacityKg > 0 ? axle.loadKg / axle.capacityKg : null
  const percent = ratio === null ? 0 : ratio * 100

  return (
    <div className="flex flex-col gap-1.25">
      <div className="flex justify-between gap-3 text-body-lg xl:text-caption">
        <span>{label}</span>
        <span className="font-mono font-medium">{ratio === null ? '—' : formatRatioAsPercent(ratio)}</span>
      </div>
      <div className="flex justify-between gap-3 text-body-lg xl:text-caption">
        <span>{ratio === null ? 'Chưa có giới hạn' : ratio > 1 ? 'Vượt giới hạn' : ratio >= WARNING_RATIO ? 'Gần giới hạn' : 'Trong giới hạn'}</span>
        <span className={cn('font-mono', VALUE_COLOR[tone])}>
          {formatInteger(axle.loadKg)}{' '}
          <span className="text-text-3">/ {formatInteger(axle.capacityKg)} kg</span>
        </span>
      </div>
      <ProgressBar value={percent} tone={tone} />
    </div>
  )
}
