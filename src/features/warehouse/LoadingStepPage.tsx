import { Check, PackageX, TriangleAlert } from 'lucide-react'
import { lazy, Suspense, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { LOAD_PLAN } from '@/lib/load-plan.mock'
import { ConfirmedOverlay } from './ConfirmedOverlay'
import { PackageInstructionCard } from './PackageInstructionCard'
import { StepHeader } from './StepHeader'
import { useLoadingSession } from './useLoadingSession'
import { benchmarkCountFromSearch, createBenchmarkPlan } from '@/features/viewer3d/benchmark.mock'
import type { LoadPlan } from '@/types/load-plan'

/** Three.js nặng — chỉ tải khi màn kho thực sự hiển thị ô vị trí 3D. */
const PositionViewer = lazy(() =>
  import('@/features/viewer3d/PositionViewer').then((m) => ({ default: m.PositionViewer })),
)

/** Bước mở màn, khớp bản design (PKG-00147). */
const INITIAL_STEP = 47

/**
 * Máy tính bảng kho — một thao tác mỗi màn: xác nhận đã xếp kiện hiện tại.
 * Toàn màn, không nav rail. Vùng chạm ≥56px, chữ ≥16px (mục 10).
 *
 * Lệch có chủ ý khỏi design: nút xác nhận trong design màu xanh lá và viết
 * hoa toàn bộ; mục 5 chỉ định nghĩa nút chính nền `--primary` và cấm viết hoa,
 * nên ở đây là nút primary "Xác nhận đã xếp".
 */
export function LoadingStepPage() {
  const [search] = useSearchParams()
  const count = benchmarkCountFromSearch(search.toString())
  const plan = useMemo(() => count ? createBenchmarkPlan(count) : LOAD_PLAN, [count])
  return <LoadingSessionPage key={plan.tripId} plan={plan} />
}

function LoadingSessionPage({ plan }: { plan: LoadPlan }) {
  const session = useLoadingSession(plan, INITIAL_STEP)
  const exitTo = `/chuyen/${plan.tripId}`

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-body-lg">
      <StepHeader
        step={session.step}
        totalSteps={session.totalSteps}
        tripId={plan.tripId}
        exitTo={exitTo}
      />

      <div className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {session.current ? (
          <>
            <PackageInstructionCard
              placement={session.current}
              placements={plan.placements}
              vehicle={plan.vehicle}
              stops={plan.stops}
            />
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-label="Đang dựng sơ đồ thùng xe"
                  className="grid min-h-80 place-items-center rounded-md bg-canvas-1"
                >
                  <Spinner tone="light" />
                </div>
              }
            >
              <div className="order-first min-h-96 lg:order-last lg:min-h-0"><PositionViewer plan={plan} current={session.current} /></div>
            </Suspense>
          </>
        ) : (
          <div className="col-span-2 flex flex-col items-start justify-center gap-3 rounded-md border border-border p-8">
            <span className="text-h1 font-semibold">Đã xếp xong toàn bộ {session.totalSteps} kiện</span>
            <span className="text-text-2">Đóng cửa thùng và bàn giao cho tài xế.</span>
            <Button variant="secondary" size="touch" asChild>
              <Link to={exitTo}>Về chi tiết chuyến</Link>
            </Button>
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
            Xác nhận đã xếp
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="ghost" size="touch" className="font-medium text-text-2 hover:text-text" onClick={session.reportDeviation}>
              <TriangleAlert className="size-4.5" strokeWidth={2} />
              Ghi nhận sai lệch
            </Button>
            <Button variant="ghost" size="touch" className="font-medium text-text-2 hover:text-text" onClick={session.reportMissing}>
              <PackageX className="size-4.5" strokeWidth={2} />
              Kiện này không có ở kho
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
