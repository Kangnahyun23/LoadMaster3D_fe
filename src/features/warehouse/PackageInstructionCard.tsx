import { ArrowRight, ArrowUp, Package, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDecimal } from '@/lib/format'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { Placement, PlanStop, VehicleSpec } from '@/types/load-plan'
import {
  describeDimensions,
  describeOrientation,
  describePosition,
  stepNote,
} from './describe-step'
import { OrientationFigure } from './OrientationFigure'

/**
 * Thẻ hướng dẫn xếp một kiện: mã kiện cỡ lớn, điểm giao, ba ô thông tin,
 * ghi chú và hình minh hoạ hướng đặt. Chữ tối thiểu 16px trên tablet (mục 10).
 * Lệch có chủ ý: nhãn "Kiện cần xếp" trong design viết hoa — mục 5 cấm.
 */
export function PackageInstructionCard({
  placement,
  placements,
  vehicle,
  stops,
}: {
  placement: Placement
  placements: Placement[]
  vehicle: VehicleSpec
  stops: PlanStop[]
}) {
  const stopName = stops.find((s) => s.number === placement.stop)?.name ?? ''
  const note = stepNote(placement, placements)

  return (
    <Card className="flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden px-7 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-body-lg font-medium text-text-3">Kiện cần xếp</span>
          <h1 className="font-mono text-[40px] leading-12 font-semibold tracking-[-0.02em]">{placement.id}</h1>
        </div>
        <span
          className="inline-flex h-9 flex-none items-center gap-2 rounded-full px-3.5 text-body-lg font-semibold leading-none whitespace-nowrap"
          style={{ background: stopColor(placement.stop), color: stopForeground(placement.stop) }}
        >
          Điểm {placement.stop} · {stopName}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Vị trí">{describePosition(placement, placements, vehicle)}</Tile>
        <Tile label="Hướng đặt">{describeOrientation(placement)}</Tile>
        <Tile label="Khối lượng">
          <span className="font-mono text-[28px] leading-8 tracking-[-0.01em]">
            {formatDecimal(placement.weightKg)}
          </span>{' '}
          <span className="text-body-lg font-normal text-text-3">kg</span>
        </Tile>
      </div>

      <div
        role="note"
        className={cn(
          'flex items-center gap-3 rounded-md border px-4 py-3.5',
          note.tone === 'warning'
            ? 'border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg'
            : 'border-border bg-surface text-text-2',
        )}
      >
        {note.tone === 'warning' ? (
          <TriangleAlert className="size-6 flex-none" strokeWidth={2} aria-hidden />
        ) : (
          <Package className="size-6 flex-none" strokeWidth={2} aria-hidden />
        )}
        <span className="text-[18px] leading-6 font-semibold">{note.text}</span>
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-6 px-2 pt-1">
        <OrientationFigure placement={placement} />
        <ul className="flex min-w-0 flex-col gap-2 text-body-lg text-text-2">
          <li className="flex items-center gap-2.5">
            <span aria-hidden className="size-3 flex-none rounded-[3px]" style={{ background: stopColor(placement.stop) }} />
            {describeDimensions(placement)}
          </li>
          <li className="flex items-center gap-2.5">
            <ArrowRight className="size-4 flex-none" strokeWidth={2} aria-hidden />
            Mũi tên: mặt hướng ra cửa
          </li>
          <li className="flex items-center gap-2.5 text-text-3">
            <ArrowUp className="size-4 flex-none" strokeWidth={2} aria-hidden />
            Mặt có nhãn hướng lên
          </li>
        </ul>
      </div>
    </Card>
  )
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-surface p-4">
      <span className="text-body-lg text-text-3">{label}</span>
      <span className="text-h2 leading-[26px] font-semibold text-pretty">{children}</span>
    </div>
  )
}
