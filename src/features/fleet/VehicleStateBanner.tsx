import { Lock, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { useFormat, useT } from '@/lib/i18n'
import type { VehicleState } from '@/lib/mock-db'
import { cn } from '@/lib/utils'

const BOX = 'flex max-w-400 items-start gap-3 rounded-md border px-4 py-3 text-body'

/**
 * Thông báo trạng thái ở trang cấu hình xe (LM-089): xe đang chạy chuyến thì nói chuyến nào và vì sao form bị khoá; xe bảo
 * dưỡng thì nói từ lúc nào và ghi chú. Xe sẵn sàng không có thông báo.
 */
export function VehicleStateBanner({ state }: { state: VehicleState }) {
  const t = useT()
  const format = useFormat()

  if (state.status === 'in_use' && state.tripId) {
    return (
      <div role="status" className={cn(BOX, 'border-badge-cyan-border bg-badge-cyan-bg text-badge-cyan-fg')}>
        <Lock className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden />
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span>{t('fleet.banner.inUse', { tripId: state.tripId })}</span>
          <Link to={`/chuyen/${state.tripId}`} className="font-medium text-primary hover:text-primary-hover">
            {t('fleet.banner.openTrip', { tripId: state.tripId })}
          </Link>
        </p>
      </div>
    )
  }

  if (state.status === 'maintenance' && state.maintenance) {
    const { since, note } = state.maintenance
    return (
      <div role="status" className={cn(BOX, 'border-badge-warning-border bg-badge-warning-bg text-badge-warning-fg')}>
        <Wrench className="mt-0.5 size-4 flex-none" strokeWidth={1.5} aria-hidden />
        <div className="flex flex-col gap-1">
          <p>{t('fleet.banner.maintenance', { time: format.time(since), date: format.date(since) })}</p>
          {note ? <p className="text-text-2">{t('fleet.banner.maintenanceNote', { note })}</p> : null}
        </div>
      </div>
    )
  }

  return null
}
