import { Check, PackageX } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { dataErrorMessage, useT } from '@/lib/i18n'
import type { Revision, Trip } from '@/lib/mock-db'
import { ConfirmedOverlay } from './ConfirmedOverlay'
import { MissingPackageDialog } from './MissingPackageDialog'
import { PackageInstructionCard } from './PackageInstructionCard'
import { PlanNotices } from './PlanNotices'
import { StepHeader } from './StepHeader'
import { useLoadingSession } from './useLoadingSession'
import { useSessionModel } from './useSessionModel'
import { useCompleteLoadingMutation } from './useWarehouseQueries'

/** Three.js nặng — chỉ tải khi màn kho thực sự hiển thị ô vị trí 3D. */
const PositionViewer = lazy(() =>
  import('@/features/viewer3d/PositionViewer').then((m) => ({ default: m.PositionViewer })),
)

/**
 * Phiên xếp đang chạy (LM-060, LM-086) — một thao tác mỗi màn: xác nhận đã xếp kiện hiện tại. Toàn màn, không nav rail, vùng chạm
 * ≥ 56px, chữ ≥ 16px (mục 10). Bước đi theo `loadingOrder` của bản duyệt đã chốt lúc bắt đầu; tiến độ và kiện thiếu ghi vào kho.
 *
 * Lệch có chủ ý khỏi design: nút xác nhận trong design màu xanh lá và viết hoa toàn bộ; mục 5 chỉ định nghĩa nút chính nền
 * `--primary` và cấm viết hoa, nên ở đây là nút primary "Xác nhận đã xếp".
 */
export function LoadingSessionView({ trip, plan }: { trip: Trip; plan: Revision }) {
  const t = useT()
  const model = useSessionModel(trip, plan)
  const session = useLoadingSession(trip.id, model.placements, trip.loading)
  const [missingTarget, setMissingTarget] = useState<ScenePlacement | null>(null)
  const current = session.current
  // Kiện báo thiếu không lên xe: khung 3D không vẽ chúng như đã xếp
  const missingIds = useMemo(() => new Set(session.missing.map((placement) => placement.id)), [session.missing])

  async function handleMissing(id: string) {
    if (await session.reportMissing(id)) setMissingTarget(null)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-body-lg">
      <StepHeader step={current?.step ?? session.total} totalSteps={session.total} recorded={session.recorded} tripId={trip.id} />
      <PlanNotices model={model} />

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {current ? (
          <>
            <PackageInstructionCard placement={current} placements={model.placements} vehicle={model.vehicle} stops={model.stops} />
            {/* Khung giữ chỗ nằm đúng ô của khung 3D để lúc tải xong bố cục không nhảy */}
            <div className="order-first min-h-96 lg:order-last lg:min-h-0">
              <Suspense
                fallback={
                  <div role="status" aria-label={t('warehouse.viewerLoading')} className="grid h-full min-h-80 place-items-center rounded-md bg-canvas-1">
                    <Spinner tone="light" />
                  </div>
                }
              >
                <PositionViewer model={model} current={current} missingIds={missingIds} />
              </Suspense>
            </div>
          </>
        ) : (
          <AllRecorded tripId={trip.id} />
        )}

        {session.overlay ? <ConfirmedOverlay confirmedId={session.overlay.id} nextStep={session.overlay.nextStep} /> : null}
      </div>

      {current ? (
        <div className="flex flex-none flex-col gap-2 px-3 pb-3">
          <Button variant="primary" block className="h-14 gap-3 text-body-lg [&_svg]:size-6" onClick={session.confirm} disabled={session.busy}>
            <Check strokeWidth={2.5} />
            {t('warehouse.confirm')}
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              size="touch"
              className="font-medium text-text-2 hover:text-text"
              disabled={session.busy}
              onClick={() => setMissingTarget(current)}
            >
              <PackageX className="size-4.5" strokeWidth={2} />
              {t('warehouse.missing')}
            </Button>
          </div>
        </div>
      ) : null}

      <MissingPackageDialog
        placement={missingTarget}
        onOpenChange={(open) => { if (!open) setMissingTarget(null) }}
        onConfirm={(id) => void handleMissing(id)}
        pending={session.recording}
      />
    </div>
  )
}

/**
 * Mọi kiện đã có kết quả nhưng chuyến chưa sang Đã xếp xong: bước cuối tự hoàn tất, nên chỉ gặp khi lần hoàn tất đó không thành
 * (ví dụ mất kết nối). Cho bấm hoàn tất lại, không bịa là đã xong.
 */
function AllRecorded({ tripId }: { tripId: string }) {
  const t = useT()
  const complete = useCompleteLoadingMutation(tripId)
  return (
    <div className="col-span-full flex flex-col items-start justify-center gap-3 rounded-md border border-border p-8">
      <p className="m-0">{t('warehouse.allRecorded')}</p>
      <Button
        variant="primary"
        size="touch"
        loading={complete.isPending}
        onClick={() => complete.mutate(undefined, { onError: (error) => toast.error(dataErrorMessage(error, t)) })}
      >
        {t('warehouse.complete')}
      </Button>
    </div>
  )
}
