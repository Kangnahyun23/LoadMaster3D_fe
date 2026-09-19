import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/Card'
import { VehicleName } from '@/components/VehicleName'
import type { VehicleConfig } from '@/domain/models'
import { useFormat, useT } from '@/lib/i18n'
import type { User } from '@/types/user'

/**
 * Thẻ phương tiện ở cột trái, kèm tài xế chạy chuyến (LM-088).
 *
 * Lệch có chủ ý khỏi design: nhãn mục trong bản design viết hoa toàn bộ
 * kèm letter-spacing, CLAUDE.md mục 5 cấm cả hai — ở đây viết thường.
 */
export function VehicleCard({ vehicle, tripId, driverId = null, driver = null, canChange = true }: {
  vehicle: VehicleConfig
  tripId: string
  driverId?: string | null
  /** Tài khoản của `driverId`; `null` khi chưa gán hoặc tài khoản không còn trong kho (khi đó hiện mã). */
  driver?: Pick<User, 'fullName' | 'phone'> | null
  canChange?: boolean
}) {
  const t = useT()
  const format = useFormat()
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption font-medium text-text-3">{t('trips.vehicle')}</span>
        {canChange ? (
          <Link to={`/chuyen/${tripId}/sua`} className="text-caption text-primary">
            {t('trips.changeVehicle')}
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="grid size-10 flex-none place-items-center rounded-md bg-primary-bg text-primary-hover">
          <Truck className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <VehicleName name={vehicle.name} className="text-body-lg font-medium" />
          <span className="font-mono text-caption text-text-3">
            {t('fields.maxPayloadKg')}: {format.weight(vehicle.maxPayloadKg)}
          </span>
        </div>
      </div>

      <dl className="border-t border-border">
        <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
          <dt className="text-body text-text-2">{t('trips.vehicleCard.driver')}</dt>
          <dd className="flex min-w-0 flex-col items-end text-right">
            {driverId === null ? (
              <span className="text-body text-text-3">{t('trips.vehicleCard.unassigned')}</span>
            ) : (
              <>
                <span className="text-body font-medium">{driver?.fullName ?? driverId}</span>
                {driver?.phone ? <span className="font-mono text-caption text-text-3">{driver.phone}</span> : null}
              </>
            )}
          </dd>
        </div>

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
