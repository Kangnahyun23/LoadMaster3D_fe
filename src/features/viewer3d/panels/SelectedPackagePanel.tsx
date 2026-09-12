import { AlertCircle, Pin, PinOff, X } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDecimal, formatDimensions, formatInteger } from '@/lib/format'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import { findAbove, findBelow, layerOf, PACKAGING_LABELS } from '@/lib/placement'
import { ORIENTATION_LABELS, type Orientation, type Placement, type PlanStop } from '@/types/load-plan'

/** Ba hướng đặt, kèm hình chữ nhật minh hoạ tỉ lệ (rộng × cao, px). */
const ORIENTATIONS: Array<{ value: Orientation; glyph: [number, number] }> = [
  { value: 0, glyph: [28, 18] },
  { value: 1, glyph: [18, 24] },
  { value: 2, glyph: [14, 28] },
]

/** Panel phải: chi tiết kiện đang chọn, hướng xoay, vị trí, ghim. */
export function SelectedPackagePanel({
  placement,
  placements,
  totalSteps,
  stops,
  tripId,
  onClose,
  onSetOrientation,
  onTogglePin,
}: {
  placement: Placement | undefined
  placements: Placement[]
  totalSteps: number
  stops: PlanStop[]
  tripId: string
  onClose: () => void
  onSetOrientation: (id: string, orientation: Orientation) => void
  onTogglePin: (id: string) => void
}) {
  return (
    <aside
      aria-label="Kiện đang chọn"
      className="flex w-90 flex-none flex-col overflow-hidden border-l border-border bg-bg"
    >
      <div className="flex h-11 flex-none items-center justify-between border-b border-border pr-2 pl-4">
        <span className="text-body font-medium">Kiện đang chọn</span>
        {placement ? (
          <button
            type="button"
            aria-label="Bỏ chọn"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-md text-text-3 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      {placement ? (
        <PackageDetails
          placement={placement}
          placements={placements}
          totalSteps={totalSteps}
          stops={stops}
          tripId={tripId}
          onSetOrientation={onSetOrientation}
          onTogglePin={onTogglePin}
        />
      ) : (
        <p className="p-4 text-body text-text-3">
          Bấm vào một kiện trong khung 3D để xem chi tiết.
        </p>
      )}
    </aside>
  )
}

function PackageDetails({
  placement,
  placements,
  totalSteps,
  stops,
  tripId,
  onSetOrientation,
  onTogglePin,
}: {
  placement: Placement
  placements: Placement[]
  totalSteps: number
  stops: PlanStop[]
  tripId: string
  onSetOrientation: (id: string, orientation: Orientation) => void
  onTogglePin: (id: string) => void
}) {
  const stopName = stops.find((s) => s.number === placement.stop)?.name ?? ''
  const layer = layerOf(placement, placements)
  const below = findBelow(placement, placements)
  const above = findAbove(placement, placements)

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex items-start gap-3">
          <span
            className="grid size-11 flex-none place-items-center rounded-md font-mono text-body font-semibold leading-none"
            style={{ background: stopColor(placement.stop), color: stopForeground(placement.stop) }}
          >
            <span className="sr-only">Điểm giao </span>
            {placement.stop}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="font-mono text-h2 font-semibold tracking-[-0.02em]">{placement.id}</h2>
            <div className="flex flex-wrap gap-1.5">
              {placement.fragile ? (
                <Badge tone="warning">
                  <AlertCircle className="size-3" strokeWidth={2} aria-hidden />
                  Dễ vỡ
                </Badge>
              ) : null}
              <Badge tone="neutral">{PACKAGING_LABELS[placement.packaging]}</Badge>
            </div>
          </div>
        </div>

        <dl className="flex flex-col border-t border-border">
          <Row label="Kích thước (D × R × C)">
            <span className="font-mono font-medium">
              {formatDimensions(placement.lengthMm, placement.widthMm, placement.heightMm).replace(' mm', '')}{' '}
              <span className="font-normal text-text-3">mm</span>
            </span>
          </Row>
          <Row label="Khối lượng">
            <span className="font-mono font-medium">
              {formatDecimal(placement.weightKg)} <span className="font-normal text-text-3">kg</span>
            </span>
          </Row>
          <Row label="Đơn hàng">
            <Link to={`/chuyen/${tripId}`} className="font-mono font-medium text-primary">
              {placement.orderId}
            </Link>
          </Row>
          <Row label="Điểm giao">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: stopColor(placement.stop) }} />
              {placement.stop} · {stopName}
            </span>
          </Row>
          <Row label="Xếp ở bước" last>
            <span className="font-mono font-medium">
              {formatInteger(placement.step)}{' '}
              <span className="font-normal text-text-3">/ {formatInteger(totalSteps)}</span>
            </span>
          </Row>
        </dl>

        <div className="flex flex-col gap-2">
          <span className="text-caption font-medium text-text-3">Hướng xoay</span>
          <div role="group" aria-label="Hướng xoay" className="grid grid-cols-3 gap-1.5">
            {ORIENTATIONS.map(({ value, glyph: [w, h] }) => {
              const active = placement.orientation === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSetOrientation(placement.id, value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-md border px-1 py-2 transition-colors duration-(--dur-fast) ease-standard',
                    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    active ? 'border-primary bg-primary-bg text-primary-hover' : 'border-border bg-bg text-text-2 hover:bg-surface',
                  )}
                >
                  <span aria-hidden className="block rounded-xs bg-current opacity-85" style={{ width: w, height: h }} />
                  <span className="font-mono text-[11px] leading-3.5 font-medium">{ORIENTATION_LABELS[value]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-caption font-medium text-text-3">Vị trí (từ vách trước · vách trái · sàn)</span>
          <div className="grid grid-cols-3 gap-1.5">
            <Coordinate axis="X" value={placement.position.x} />
            <Coordinate axis="Y" value={placement.position.y} />
            <Coordinate axis="Z" value={placement.position.z} />
          </div>
          <span className="text-caption text-text-3">
            Lớp {layer} · {below ? `đặt trên ${below.id}` : 'nằm trên sàn'}
            {above ? ` · phía trên: ${above.id} (${formatDecimal(above.weightKg)} kg)` : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-4 pt-3 pb-4">
        <Button variant="secondary" block onClick={() => onTogglePin(placement.id)}>
          {placement.pinned ? <PinOff strokeWidth={1.5} /> : <Pin strokeWidth={1.5} />}
          {placement.pinned ? 'Bỏ ghim vị trí' : 'Ghim vị trí này'}
        </Button>
      </div>
    </>
  )
}

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-3 py-2.5 text-body', !last && 'border-b border-border')}>
      <dt className="text-text-2">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

function Coordinate({ axis, value }: { axis: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-surface px-2.5 py-2">
      <span className="text-[11px] leading-3.5 text-text-3">{axis}</span>
      <span className="font-mono text-body font-medium">{formatInteger(value)}</span>
    </div>
  )
}
