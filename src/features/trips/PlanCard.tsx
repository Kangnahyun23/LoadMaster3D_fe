import { Check, CircleCheck, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { formatDecimal, formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PlanThumbnail } from './PlanThumbnail'
import {
  PAYLOAD_KG,
  type PlanSummary,
  type bestValues,
} from '@/lib/plan-comparison.mock'

type Best = ReturnType<typeof bestValues>

/** Chiều cao từng khối trong thẻ — cột nhãn bên trái dùng đúng các số này. */
export const CARD_HEIGHTS = {
  thumbnail: 190,
  title: 84,
  metric: 48,
  footer: 72,
} as const

export const METRIC_LABELS = [
  'Tỷ lệ lấp đầy',
  'Tải trọng đã dùng',
  'Số kiện chưa xếp',
  'Thời gian chạy',
  'Tuân thủ thứ tự dỡ',
] as const

/**
 * Một cột phương án. Thẻ đang chọn nổi bằng viền primary + vòng 1px,
 * không dùng bóng (mục 5). Giá trị tốt nhất mỗi hàng nền primary-bg + dấu tích.
 */
export function PlanCard({
  plan,
  best,
  selected,
  onSelect,
}: {
  plan: PlanSummary
  best: Best
  selected: boolean
  onSelect: (key: PlanSummary['key']) => void
}) {
  return (
    <article
      aria-label={plan.name}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-md border bg-bg',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border',
      )}
    >
      {selected ? (
        <span className="absolute top-3 left-3 z-1 inline-flex h-[22px] items-center gap-1.5 rounded-full bg-primary px-2.5 text-caption font-medium leading-none text-white">
          <Check className="size-3" strokeWidth={2.5} aria-hidden />
          Đang chọn
        </span>
      ) : null}

      <PlanThumbnail style={plan.style} placedCount={plan.placedCount} totalCount={plan.totalCount} />

      <div className="flex flex-col gap-0.5 px-5 pt-4" style={{ height: CARD_HEIGHTS.title }}>
        <span className="text-body-lg font-semibold">{plan.name}</span>
        <span className="text-body text-text-3">{plan.algorithm}</span>
      </div>

      <Metric label={METRIC_LABELS[0]} best={plan.fillRate === best.fillRate}>
        <span className={cn(plan.fillRate === best.fillRate ? 'text-primary-hover' : 'text-text')}>
          {formatDecimal(plan.fillRate)}
        </span>{' '}
        <Unit>%</Unit>
      </Metric>
      <Metric label={METRIC_LABELS[1]} best={plan.weightKg === best.weightKg}>
        {formatInteger(plan.weightKg)} <Unit>/ {formatInteger(PAYLOAD_KG)} kg</Unit>
      </Metric>
      <Metric label={METRIC_LABELS[2]} best={plan.unplacedCount === best.unplacedCount}>
        <span className={cn(plan.unplacedCount > 0 ? 'text-badge-warning-fg' : 'text-text')}>
          {formatInteger(plan.unplacedCount)}
        </span>{' '}
        <Unit>kiện</Unit>
      </Metric>
      <Metric label={METRIC_LABELS[3]} best={plan.runtimeSeconds === best.runtimeSeconds}>
        {formatInteger(plan.runtimeSeconds)} <Unit>giây</Unit>
      </Metric>
      <Metric label={METRIC_LABELS[4]} best={plan.lifoCompliant} mono={false}>
        {plan.lifoCompliant ? (
          <span className="text-badge-success-fg">Có</span>
        ) : (
          <span className="inline-flex items-center gap-2 text-text-3">
            <X className="size-3.5 text-text-disabled" strokeWidth={2} aria-hidden />
            Không
          </span>
        )}
      </Metric>

      <div className="border-t border-border px-5 py-4" style={{ height: CARD_HEIGHTS.footer }}>
        <Button
          variant={selected ? 'primary' : 'secondary'}
          block
          aria-pressed={selected}
          onClick={() => onSelect(plan.key)}
        >
          {selected ? <Check strokeWidth={2} /> : null}
          {selected ? 'Phương án đang chọn' : 'Chọn phương án này'}
        </Button>
      </div>
    </article>
  )
}

function Metric({
  label,
  best,
  mono = true,
  children,
}: {
  label: string
  best: boolean
  mono?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border px-5',
        best && 'bg-primary-bg',
      )}
      style={{ height: CARD_HEIGHTS.metric }}
    >
      <span className="text-caption text-text-3">{label}</span>
      <span className={cn('inline-flex items-center gap-2 font-medium', mono ? 'font-mono text-body-lg' : 'text-body')}>
        {best ? (
          <CircleCheck className="size-3.5 text-primary" strokeWidth={2} aria-label="Tốt nhất" />
        ) : null}
        <span>{children}</span>
      </span>
    </div>
  )
}

function Unit({ children }: { children: ReactNode }) {
  return <span className="font-normal text-text-3">{children}</span>
}
