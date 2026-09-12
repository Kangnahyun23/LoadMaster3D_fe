import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/Card'
import { formatDimensions, formatInteger } from '@/lib/format'
import type { Vehicle } from './trip-detail.mock'

/**
 * Thẻ phương tiện ở cột trái.
 *
 * Lệch có chủ ý khỏi design: nhãn mục trong bản design viết hoa toàn bộ
 * kèm letter-spacing, CLAUDE.md mục 5 cấm cả hai — ở đây viết thường.
 */
export function VehicleCard({
  vehicle,
  tripId,
}: {
  vehicle: Vehicle
  tripId: string
}) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption font-medium text-text-3">Phương tiện</span>
        <Link to={`/chuyen/${tripId}/sua`} className="text-caption text-primary">
          Đổi xe
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid size-10 flex-none place-items-center rounded-md bg-primary-bg text-primary-hover">
          <Truck className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body-lg font-medium">{vehicle.name}</span>
          <span className="font-mono text-caption text-text-3">
            {vehicle.plate}
          </span>
        </div>
      </div>

      <dl className="border-t border-border">
        <div className="flex flex-col gap-0.5 border-b border-border py-2.5">
          <dt className="text-body text-text-2">Lòng thùng (D × R × C)</dt>
          <dd className="font-mono text-body font-medium whitespace-nowrap">
            {formatDimensions(
              vehicle.innerLengthMm,
              vehicle.innerWidthMm,
              vehicle.innerHeightMm,
            ).replace(' mm', '')}{' '}
            <span className="font-normal text-text-3">mm</span>
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
          <dt className="text-body text-text-2">Tải trọng</dt>
          <dd className="font-mono text-body font-medium">
            {formatInteger(vehicle.payloadKg)}{' '}
            <span className="font-normal text-text-3">kg</span>
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-body text-text-2">Cửa xếp dỡ</dt>
          <dd className="text-body">{vehicle.loadingDoor}</dd>
        </div>
      </dl>
    </Card>
  )
}
