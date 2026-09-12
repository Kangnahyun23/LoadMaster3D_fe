import { Check, ChevronLeft, Columns2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { formatDecimal, formatInteger } from '@/lib/format'

/**
 * Thanh trên của màn xem phương án. Cao 56px — bản mỏng dành riêng cho màn
 * 3D, khác 72px của các màn còn lại (mục 5 CLAUDE.md).
 */
export function ViewerHeader({
  tripId,
  fillRate,
  totalWeightKg,
  payloadKg,
  placedCount,
  totalCount,
  onApprove,
}: {
  tripId: string
  fillRate: number
  totalWeightKg: number
  payloadKg: number
  placedCount: number
  totalCount: number
  onApprove: () => void
}) {
  return (
    <header className="flex h-14 flex-none items-center gap-4 border-b border-border bg-bg px-5">
      <Link
        to={`/chuyen/${tripId}`}
        aria-label="Quay lại chuyến"
        className="grid size-9 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
      </Link>

      <div className="flex items-center gap-2.5">
        <h1 className="font-mono text-[18px] leading-6 font-semibold tracking-[-0.02em]">
          {tripId}
        </h1>
        <StatusBadge status="da_toi_uu" />
      </div>

      <span aria-hidden className="h-6 w-px bg-border" />

      <dl className="flex items-center gap-5">
        <Stat label="Lấp đầy">
          <span className="font-semibold text-primary">{formatDecimal(fillRate)}%</span>
        </Stat>
        <span aria-hidden className="h-5 w-px bg-border" />
        <Stat label="Tải trọng">
          {formatInteger(totalWeightKg)}{' '}
          <span className="font-normal text-text-3">/ {formatInteger(payloadKg)} kg</span>
        </Stat>
        <span aria-hidden className="h-5 w-px bg-border" />
        <Stat label="Kiện">
          {formatInteger(placedCount)}{' '}
          <span className="font-normal text-text-3">/ {formatInteger(totalCount)}</span>
        </Stat>
      </dl>

      <div className="flex-1" />

      <div className="flex gap-2">
        <Button variant="secondary" className="h-9 px-3.5" asChild>
          <Link to={`/chuyen/${tripId}/so-sanh`}>
            <Columns2 strokeWidth={1.5} />
            So sánh phương án
          </Link>
        </Button>
        <Button variant="primary" className="h-9 px-3.5" onClick={onApprove}>
          <Check strokeWidth={1.5} />
          Duyệt phương án
        </Button>
      </div>
    </header>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] leading-3.5 text-text-3">{label}</dt>
      <dd className="font-mono text-body leading-4.5 font-medium">{children}</dd>
    </div>
  )
}
