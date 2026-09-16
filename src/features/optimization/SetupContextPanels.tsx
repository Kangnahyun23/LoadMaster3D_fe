import { Link } from 'react-router'
import { useFormat, useT } from '@/lib/i18n'
import type { OptimizationSetup } from './optimization-api'
import { useChangeVehicleMutation } from './useOptimizationSetup'

/** Xe và hàng của chuyến trên màn Thiết lập tối ưu: đổi xe tại chỗ, còn sửa chi tiết thì đi tới trang xe / chi tiết chuyến. */
export function SetupContextPanels({ tripId, setup }: { tripId: string; setup: OptimizationSetup }) {
  const t = useT()
  const format = useFormat()
  const changeVehicle = useChangeVehicleMutation(tripId)
  const { vehicle, trip } = setup
  const instances = trip.packages.reduce((sum, pkg) => sum + pkg.quantity, 0)
  const weightKg = trip.packages.reduce((sum, pkg) => sum + pkg.weightKg * pkg.quantity, 0)
  const volumeCm3 = trip.packages.reduce((sum, pkg) => sum + pkg.lengthCm * pkg.widthCm * pkg.heightCm * pkg.quantity, 0)

  return (
    <>
      <section className="flex flex-col gap-2 rounded-md border border-border p-4">
        <label className="flex flex-col gap-1.5 text-caption font-medium text-text-3">
          {t('optimization.vehicle')}
          <select
            value={vehicle.id}
            disabled={changeVehicle.isPending}
            onChange={(event) => changeVehicle.mutate(event.target.value)}
            className="h-10 rounded-md border border-border bg-bg px-2 text-body text-text focus-visible:outline-2 focus-visible:outline-primary"
          >
            {setup.vehicles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <p className="font-mono text-caption text-text-2">
          {t('optimization.vehicleSummary', {
            size: format.dimensions(vehicle.innerLengthCm, vehicle.innerWidthCm, vehicle.innerHeightCm),
            payload: format.weight(vehicle.maxPayloadKg),
            door: format.widthByHeight(vehicle.doorWidthCm, vehicle.doorHeightCm),
            obstacles: format.integer(vehicle.obstacles.length),
          })}
        </p>
        <Link to={`/doi-xe/${vehicle.id}`} className="self-start text-body text-primary">{t('optimization.editVehicle')}</Link>
      </section>

      <section className="flex flex-col gap-2 rounded-md border border-border p-4">
        <h2 className="text-h3 font-semibold">{t('optimization.packages')}</h2>
        <p className="font-mono text-caption text-text-2">
          {t('optimization.packagesSummary', {
            lines: format.integer(trip.packages.length),
            instances: format.integer(instances),
            weight: format.weight(weightKg),
            volume: format.volumeM3(volumeCm3),
          })}
        </p>
        <Link to={`/chuyen/${tripId}`} className="self-start text-body text-primary">{t('optimization.editPackages')}</Link>
      </section>
    </>
  )
}
