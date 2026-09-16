import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { adaptResult } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'
import { DeliveryStopView } from './DeliveryStopView'
import { stopDeliveries, type DriverPlan } from './driver-plan'
import { useDriverPlanQuery } from './useDriverPlanQuery'

/**
 * Màn tài xế (LM-061): revision đã duyệt mới nhất của chuyến `?chuyen=<tripId>`, hoặc của chuyến đầu tiên có bản duyệt.
 * Chưa có bản duyệt thì nói rõ cần duyệt trước, không dựng phương án giả.
 */
export function DriverStopPage() {
  const t = useT()
  const [search] = useSearchParams()
  const tripId = search.get('chuyen') ?? undefined
  const query = useDriverPlanQuery(tripId)

  if (query.isPending) {
    return (
      <div className="grid h-dvh place-items-center bg-bg text-body-lg text-text-2">
        <span className="inline-flex items-center gap-2"><Spinner />{t('driver.loading')}</span>
      </div>
    )
  }
  if (!query.data) {
    return (
      <div className="flex h-dvh flex-col justify-center bg-bg p-4 text-body-lg">
        <EmptyState
          title={query.isError ? t('driver.loadErrorTitle') : t('driver.emptyTitle')}
          description={query.isError ? t('driver.loadErrorDescription')
            : tripId ? t('driver.emptyTripDescription', { tripId }) : t('driver.emptyDescription')}
          action={<Button variant="primary" size="touch" asChild><Link to="/chuyen">{t('driver.toTrips')}</Link></Button>}
        />
      </div>
    )
  }
  // Bản duyệt mới là một phiên giao mới: điểm hiện tại và kiện đã dỡ không mang sang.
  return <LoadedPlan key={query.data.revision.id} plan={query.data} />
}

function LoadedPlan({ plan }: { plan: DriverPlan }) {
  const model = useMemo(() => adaptResult(plan), [plan])
  const stops = useMemo(() => stopDeliveries(plan.trip.stops, model), [plan, model])
  return <DeliveryStopView model={model} stops={stops} />
}
