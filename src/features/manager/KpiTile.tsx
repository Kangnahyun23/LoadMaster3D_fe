import { ArrowUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDecimal, formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Kpi } from './dashboard.mock'

/** Ô KPI: nhãn, số lớn dùng mono, chip chênh lệch, ghi chú kỳ trước. */
export function KpiTile({ kpi }: { kpi: Kpi }) {
  const value = Number.isInteger(kpi.value)
    ? formatInteger(kpi.value)
    : formatDecimal(kpi.value)

  return (
    <Card className="flex flex-col gap-2 px-5 py-4">
      <span className="text-body text-text-2">{kpi.label}</span>

      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[28px] font-semibold leading-8 tracking-[-0.02em]">
          {value}
          <span className="ml-0.5 font-mono text-body-lg font-normal text-text-3">
            {kpi.unit}
          </span>
        </span>

        <span
          className={cn(
            'inline-flex h-[22px] items-center gap-1 rounded-full border px-2',
            'font-mono text-caption font-medium leading-none whitespace-nowrap',
            kpi.tone === 'good'
              ? 'border-badge-success-border bg-badge-success-bg text-badge-success-fg'
              : 'border-badge-danger-border bg-badge-danger-bg text-badge-danger-fg',
          )}
        >
          <ArrowUp
            aria-hidden
            strokeWidth={2.5}
            className={cn('size-3', kpi.direction === 'down' && 'rotate-180')}
          />
          {kpi.delta}
        </span>
      </div>

      <span className="text-caption text-text-3">{kpi.note}</span>
    </Card>
  )
}
