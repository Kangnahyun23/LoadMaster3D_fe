import { Box, ChevronLeft, Play } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useCan } from '@/features/auth/useCan'
import { useFormat, useT } from '@/lib/i18n'
import { plannerPath } from '@/lib/planner-path'
import { dateOnly } from './trip-dates'
import { TripActionsMenu } from './TripActionsMenu'
import type { TripDetail } from './trips-api'

/**
 * Header Chi tiết chuyến (LM-088): mã, trạng thái, tên, ngày chạy; menu thao tác phụ; đúng một nút primary — "Chạy tối ưu" khi chuyến
 * còn lập kế hoạch và người xem được chạy tối ưu, còn lại "Xem phương án 3D" nếu chuyến đã có phương án (AGENTS mục 5).
 */
export function TripDetailHeader({ tripId, detail }: { tripId: string; detail: TripDetail | undefined }) {
  const t = useT()
  const format = useFormat()
  const can = useCan()
  const [searchParams] = useSearchParams()
  const trip = detail?.trip
  const runnable = trip?.phase === 'planning' && can('optimization.run')
  const plan = !runnable && can('plans.view') ? detail?.plan : null

  return (
    <header className="flex h-18 flex-none items-center gap-4 border-b border-border bg-bg px-8">
      <Link
        to="/chuyen"
        aria-label={t('trips.detail.back')}
        className="grid size-9 flex-none place-items-center rounded-md text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
      </Link>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="font-mono text-[22px] leading-8 font-semibold tracking-[-0.02em] whitespace-nowrap">{tripId}</h1>
        {detail ? <StatusBadge status={detail.status} /> : null}
        {trip ? (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-body text-text-2">{trip.name}</span>
            <span className="truncate font-mono text-caption text-text-3">
              {t('trips.detail.scheduledDate', { date: format.date(dateOnly(trip.scheduledDate)) })}
            </span>
          </span>
        ) : null}
      </div>

      {trip && can('trips.edit') ? <TripActionsMenu trip={trip} /> : null}

      {runnable ? (
        <Button variant="primary" asChild>
          <Link to={`/chuyen/${tripId}/toi-uu${searchParams.get('mo-phong') === 'loi' ? '?mo-phong=loi' : ''}`}>
            <Play strokeWidth={1.5} />
            {t('trips.detail.runOptimization')}
          </Link>
        </Button>
      ) : plan ? (
        <Button variant="primary" asChild>
          <Link to={plannerPath({ tripId, jobId: plan.jobId, revisionId: plan.revisionId })}>
            <Box strokeWidth={1.5} />
            {t('trips.detail.openPlan')}
          </Link>
        </Button>
      ) : null}
    </header>
  )
}
