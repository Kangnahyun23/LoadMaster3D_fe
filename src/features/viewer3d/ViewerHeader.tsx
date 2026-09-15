import { Check, ChevronLeft, Columns2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/Badge'
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
  isMockResult,
  placedCount,
  totalCount,
  onApprove,
}: {
  tripId: string
  fillRate: number
  totalWeightKg: number
  payloadKg: number
  /** Spec: mọi kết quả từ mock mang nhãn MOCK RESULT, không dịch. */
  isMockResult: boolean
  placedCount: number
  totalCount: number
  onApprove: () => void
}) {
  return (
    <header className="flex h-14 flex-none items-center gap-2 border-b border-border bg-bg px-2 xl:gap-4 xl:px-5">
      <Link
        to={`/chuyen/${tripId}`}
        aria-label="Quay lại chuyến"
        className="grid size-14 shrink-0 place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:size-11"
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
      </Link>

      <div className="hidden items-center gap-2.5 xl:flex">
        <h1 className="font-mono text-[18px] leading-6 font-semibold tracking-[-0.02em]">
          {tripId}
        </h1>
        <StatusBadge status="da_toi_uu" />
      </div>
      {isMockResult ? <Badge tone="warning">MOCK RESULT</Badge> : null}

      <span aria-hidden className="hidden h-6 w-px bg-border xl:block" />

      <dl className="hidden items-center gap-5 xl:flex">
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
        <Button variant="secondary" className="hidden h-10 px-3.5 xl:flex" asChild>
          <Link to={`/chuyen/${tripId}/so-sanh`}>
            <Columns2 strokeWidth={1.5} />
            So sánh phương án
          </Link>
        </Button>
        <Button variant="primary" className="h-14 px-4 text-body-lg xl:h-10 xl:text-body" onClick={onApprove}>
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
