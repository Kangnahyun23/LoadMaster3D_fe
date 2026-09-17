import { Check, PackageX } from 'lucide-react'
import { lazy, Suspense, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ExitActionButton } from '@/features/auth/ExitControl'
import { adaptResult } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'
import { ConfirmedOverlay } from './ConfirmedOverlay'
import { PackageInstructionCard } from './PackageInstructionCard'
import { PlanNotices } from './PlanNotices'
import { StepHeader } from './StepHeader'
import { useLoadingSession } from './useLoadingSession'
import { useWarehousePlanQuery } from './useWarehousePlanQuery'
import type { WarehousePlan } from './warehouse-api'
import { WarehouseEmpty } from './WarehouseEmpty'

/** Three.js nặng — chỉ tải khi màn kho thực sự hiển thị ô vị trí 3D. */
const PositionViewer = lazy(() =>
  import('@/features/viewer3d/PositionViewer').then((m) => ({ default: m.PositionViewer })),
)

/**
 * Máy tính bảng kho — một thao tác mỗi màn: xác nhận đã xếp kiện hiện tại.
 * Toàn màn, không nav rail. Vùng chạm ≥56px, chữ ≥16px (mục 10).
 *
 * Dữ liệu (LM-060): revision **đã duyệt** mới nhất của chuyến `?chuyen=<mã>`, không có tham số thì chuyến đầu tiên có bản duyệt.
 * Bước đi theo `loadingOrder` của kết quả, bắt đầu từ 1.
 *
 * Lệch có chủ ý khỏi design: nút xác nhận trong design màu xanh lá và viết
 * hoa toàn bộ; mục 5 chỉ định nghĩa nút chính nền `--primary` và cấm viết hoa,
 * nên ở đây là nút primary "Xác nhận đã xếp".
 */
export function LoadingStepPage() {
  const t = useT()
  const [search] = useSearchParams()
  const tripId = search.get('chuyen') ?? undefined
  const query = useWarehousePlanQuery(tripId)

  if (query.isPending) {
    return (
      <div role="status" aria-label={t('warehouse.loading')} className="grid h-dvh place-items-center bg-bg">
        <Spinner />
      </div>
    )
  }
  if (query.isError || !query.data) return <WarehouseEmpty tripId={tripId} failed={query.isError} />
  return <LoadingSessionPage key={query.data.revision.id} plan={query.data} />
}

function LoadingSessionPage({ plan }: { plan: WarehousePlan }) {
  const t = useT()
  const model = useMemo(() => adaptResult(plan), [plan])
  const session = useLoadingSession(model.placements)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-body-lg">
      <StepHeader
        step={session.step}
        totalSteps={session.totalSteps}
        tripId={plan.trip.id}
      />
      <PlanNotices model={model} stale={plan.stale} />

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {session.current ? (
          <>
            <PackageInstructionCard
              placement={session.current}
              placements={model.placements}
              vehicle={model.vehicle}
              stops={model.stops}
            />
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-label={t('warehouse.viewerLoading')}
                  className="grid min-h-80 place-items-center rounded-md bg-canvas-1"
                >
                  <Spinner tone="light" />
                </div>
              }
            >
              <div className="order-first min-h-96 lg:order-last lg:min-h-0"><PositionViewer model={model} current={session.current} /></div>
            </Suspense>
          </>
        ) : (
          <div className="col-span-2 flex flex-col items-start justify-center gap-3 rounded-md border border-border p-8">
            <span className="text-h1 font-semibold">{t('warehouse.finished.title', { count: session.totalSteps })}</span>
            <span className="text-text-2">{t('warehouse.finished.description')}</span>
            <ExitActionButton screenHome="/kho" contextual={`/chuyen/${plan.trip.id}`} label={t('warehouse.finished.backToTrip')} variant="secondary" />
          </div>
        )}

        {session.confirmedId ? (
          <ConfirmedOverlay confirmedId={session.confirmedId} nextStep={session.step + 1} />
        ) : null}
      </div>

      {session.current ? (
        <div className="flex flex-none flex-col gap-2 px-3 pb-3">
          <Button
            variant="primary"
            block
            className="h-14 gap-3 text-body-lg [&_svg]:size-6"
            onClick={session.confirm}
            disabled={Boolean(session.confirmedId)}
          >
            <Check strokeWidth={2.5} />
            {t('warehouse.confirm')}
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="ghost" size="touch" className="font-medium text-text-2 hover:text-text" onClick={session.reportMissing}>
              <PackageX className="size-4.5" strokeWidth={2} />
              {t('warehouse.missing')}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
