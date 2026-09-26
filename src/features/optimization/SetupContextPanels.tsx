import { Link } from 'react-router'
import { toast } from 'sonner'
import { dataErrorMessage, useFormat, useT } from '@/lib/i18n'
import type { OptimizationSetup } from './optimization-api'
import { useChangeVehicleMutation } from './useOptimizationSetup'

const LINK = 'self-start rounded-sm text-body font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * Phần "Kiểm tra đầu vào" của Thiết lập tối ưu (V2): ba số lớn của hàng (kiện, khối lượng, điểm giao — từ chuyến), xe chở chuyến
 * đổi được tại chỗ, còn sửa chi tiết thì đi tới trang xe / chi tiết chuyến. Xe bảo dưỡng hiện kèm lý do nhưng không chọn được
 * (D-53); chuyến đã khoá (`locked`, D-45) thì không đổi xe. Nằm trong một `FormSection` nên không tự dựng thẻ.
 */
export function SetupContextPanels({ tripId, setup, locked = false }: { tripId: string; setup: OptimizationSetup; locked?: boolean }) {
  const t = useT()
  const format = useFormat()
  const changeVehicle = useChangeVehicleMutation(tripId)
  const { vehicle, trip } = setup
  const instances = trip.packages.reduce((sum, pkg) => sum + pkg.quantity, 0)
  const weightKg = trip.packages.reduce((sum, pkg) => sum + pkg.weightKg * pkg.quantity, 0)
  const stats = [
    { label: t('optimization.stats.packages'), value: format.integer(instances), unit: t('optimization.stats.packagesUnit', { lines: format.integer(trip.packages.length) }) },
    // Số lớn làm tròn kg như ô số liệu của bảng điều khiển; khối lượng chính xác nằm ở panel "Hai giới hạn"
    { label: t('optimization.stats.weight'), value: format.integer(Math.round(weightKg)), unit: 'kg' },
    { label: t('optimization.stats.stops'), value: format.integer(trip.stops.length) },
  ]

  function handleVehicleChange(vehicleId: string) {
    changeVehicle.mutate(vehicleId, { onError: (error) => toast.error(dataErrorMessage(error, t)) })
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="m-0 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 border-b border-border pb-3">
            <dt className="text-caption text-ink-2">{stat.label}</dt>
            <dd className="m-0 text-[26px] leading-[1.1] font-semibold text-ink-strong tabular-nums">
              {stat.value}
              {/* Khoảng trắng thật thay cho lề: tên truy cập đọc "192 / 7 dòng", không dính "192/" */}
              {stat.unit ? <>{' '}<span className="text-body font-normal text-ink-2">{stat.unit}</span></> : null}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-caption font-medium text-ink-2">
          {t('optimization.vehicle')}
          <select
            value={vehicle.id}
            disabled={locked || changeVehicle.isPending}
            onChange={(event) => handleVehicleChange(event.target.value)}
            className="h-10 rounded-md border border-border bg-bg px-2 text-body text-text focus-visible:outline-2 focus-visible:outline-primary disabled:bg-surface disabled:text-text-disabled"
          >
            {setup.vehicles.map((item) => {
              const maintenance = setup.vehicleStatus[item.id] === 'maintenance'
              return (
                <option key={item.id} value={item.id} disabled={maintenance && item.id !== vehicle.id}>
                  {maintenance ? t('trips.create.vehicleMaintenance', { name: item.name }) : item.name}
                </option>
              )
            })}
          </select>
        </label>
        <p className="font-mono text-caption text-ink-2">
          {t('optimization.vehicleSummary', {
            size: format.dimensions(vehicle.innerLengthCm, vehicle.innerWidthCm, vehicle.innerHeightCm),
            payload: format.weight(vehicle.maxPayloadKg),
            door: format.widthByHeight(vehicle.doorWidthCm, vehicle.doorHeightCm),
            obstacles: format.integer(vehicle.obstacles.length),
          })}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Link to={`/doi-xe/${vehicle.id}`} className={LINK}>{t('optimization.editVehicle')}</Link>
          <Link to={`/chuyen/${tripId}`} className={LINK}>{t('optimization.editPackages')}</Link>
        </div>
      </div>
    </div>
  )
}
