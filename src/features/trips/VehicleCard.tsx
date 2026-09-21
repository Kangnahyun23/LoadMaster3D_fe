import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/Card'
import type { VehicleConfig } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'

/**
 * Thẻ phương tiện ở cột trái.
 *
 * Lệch có chủ ý khỏi design: nhãn mục trong bản design viết hoa toàn bộ
 * kèm letter-spacing, AGENTS.md mục 5 cấm cả hai — ở đây viết thường.
 */
export function VehicleCard({ vehicle, tripId }: { vehicle: VehicleConfig; tripId: string }) {
  const t = useT()
  const format = useFormat()
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption font-medium text-text-3">{t('trips.vehicle')}</span>
        <Link to={`/chuyen/${tripId}/sua`} className="text-caption text-primary">
          {t('trips.changeVehicle')}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid size-10 flex-none place-items-center rounded-md bg-primary-bg text-primary-hover">
          <Truck className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body-lg font-medium">{vehicle.name}</span>
          <span className="font-mono text-caption text-text-3">
            {t('fields.maxPayloadKg')}: {format.weight(vehicle.maxPayloadKg)}
          </span>
        </div>
      </div>

      <dl className="border-t border-border">
        <div className="flex flex-col gap-0.5 border-b border-border py-2.5">
          <dt className="text-body text-text-2">{t('trips.vehicleCard.cargoSpace')}</dt>
          <dd className="font-mono text-body font-medium whitespace-nowrap">
            {format.dimensions(vehicle.innerLengthCm, vehicle.innerWidthCm, vehicle.innerHeightCm)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
          <dt className="text-body text-text-2">{t('trips.vehicleCard.door')}</dt>
          <dd className="font-mono text-body font-medium whitespace-nowrap">
            {format.widthByHeight(vehicle.doorWidthCm, vehicle.doorHeightCm)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3 py-2.5">
          <dt className="text-body text-text-2">{t('trips.vehicleCard.obstacles')}</dt>
          <dd className="font-mono text-body font-medium">{format.integer(vehicle.obstacles.length)}</dd>
        </div>
      </dl>
    </Card>
  )
}
