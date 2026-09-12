import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatInteger } from '@/lib/format'
import { DEFAULT_SELECTED_ID, LOAD_PLAN } from '@/lib/load-plan.mock'
import { PLANS } from '@/lib/plan-comparison.mock'
import type { CameraPreset, ColorMode } from '@/types/load-plan'
import { ApprovePlanDialog, type ApprovalCheck } from './ApprovePlanDialog'
import { createColorContext } from './colors'
import { AxleLoadPanel } from './overlays/AxleLoadPanel'
import { SlicePanel } from './overlays/SlicePanel'
import { StopLegend } from './overlays/StopLegend'
import { PackageListPanel } from './panels/PackageListPanel'
import { SelectedPackagePanel } from './panels/SelectedPackagePanel'
import type { PerfSample } from './scene/PerfProbe'
import { Timeline } from './Timeline'
import { useLoadPlanViewer } from './useLoadPlanViewer'
import { ViewerHeader } from './ViewerHeader'
import { usePerformanceFlags } from './usePerformanceFlags'
import { ViewerSkeleton } from './ViewerSkeleton'

/** Three.js là chunk nặng nhất — chỉ tải khi mở màn này, các màn khác không gánh. */
const LoadPlanViewer = lazy(() =>
  import('./LoadPlanViewer').then((module) => ({ default: module.LoadPlanViewer })),
)

const CAMERA_PRESETS: ReadonlyArray<{ value: CameraPreset; label: string }> = [
  { value: 'truoc', label: 'Trước' },
  { value: 'cua-sau', label: 'Cửa sau' },
  { value: 'ben-hong', label: 'Bên hông' },
  { value: 'tren', label: 'Trên' },
  { value: 'goc-cheo', label: 'Góc chéo' },
]

const COLOR_MODES: ReadonlyArray<{ value: ColorMode; label: string }> = [
  { value: 'diem-giao', label: 'Theo điểm giao' },
  { value: 'don-hang', label: 'Theo đơn hàng' },
  { value: 'khoi-luong', label: 'Theo khối lượng' },
]

/**
 * Xem phương án 3D — toàn màn, không có nav rail (theo bản design).
 * Hành động chính duy nhất: "Duyệt phương án".
 * Phím tắt: Space phát/dừng, ←/→ lùi/tiến một bước, Home về đầu.
 */
export function ViewerPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const plan = LOAD_PLAN
  const tripId = params.tripId ?? plan.tripId
  const showPerf = searchParams.has('debug')
  const selectedPlan = PLANS.find((p) => p.key === searchParams.get('plan')) ?? PLANS[2]

  const flags = usePerformanceFlags()
  const state = useLoadPlanViewer(plan, { initialSelectedId: DEFAULT_SELECTED_ID })
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const [perf, setPerf] = useState<PerfSample | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)

  const totalWeightKg = useMemo(
    () => state.placements.reduce((sum, p) => sum + p.weightKg, 0),
    [state.placements],
  )
  const pinned = useMemo(() => state.placements.filter((p) => p.pinned), [state.placements])
  const totalPackages = plan.placements.length + plan.unplaced.length

  const approvalChecks = useMemo<ApprovalCheck[]>(() => {
    const rearPercent = Math.round((plan.vehicle.rearAxle.loadKg / plan.vehicle.rearAxle.capacityKg) * 100)
    const ordered = [...state.placements].sort((a, b) => a.step - b.step)
    const lifo = ordered.every((p, i) => i === 0 || (ordered[i - 1]?.stop ?? 0) >= p.stop)
    const checks: ApprovalCheck[] = [
      lifo
        ? { tone: 'success', text: `Tuân thủ thứ tự dỡ ${formatInteger(plan.stops.length)} điểm giao` }
        : { tone: 'danger', text: 'Chưa tuân thủ thứ tự dỡ hàng' },
      rearPercent <= 100
        ? { tone: 'success', text: `Tải trọng trục trong giới hạn (trục sau ${rearPercent}%)` }
        : { tone: 'danger', text: `Trục sau vượt giới hạn (${rearPercent}%)` },
    ]
    if (pinned.length > 0) {
      checks.push({ tone: 'warning', text: `${formatInteger(pinned.length)} kiện đã ghim thủ công, không được tối ưu lại` })
    }
    return checks
  }, [plan, state.placements, pinned.length])

  const { togglePlaying, stepForward, stepBackward, goToStart } = state
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Không cướp phím khi người dùng đang gõ trong ô nhập hoặc hộp thoại đang mở.
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      switch (event.key) {
        case ' ':
          event.preventDefault()
          togglePlaying()
          break
        case 'ArrowRight':
          stepForward()
          break
        case 'ArrowLeft':
          stepBackward()
          break
        case 'Home':
          goToStart()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlaying, stepForward, stepBackward, goToStart])

  function handleApprove() {
    setApproveOpen(false)
    toast.success(`Đã duyệt ${selectedPlan?.name ?? 'phương án'}`, {
      description: 'Phiếu xếp hàng đã gửi tới máy tính bảng kho Long Bình.',
    })
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <ViewerHeader
        tripId={tripId}
        fillRate={plan.fillRate}
        totalWeightKg={totalWeightKg}
        payloadKg={plan.vehicle.payloadKg}
        placedCount={plan.placements.length}
        totalCount={totalPackages}
        onApprove={() => setApproveOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <PackageListPanel
          unplaced={plan.unplaced}
          pinned={pinned}
          placements={state.placements}
          vehicle={plan.vehicle}
          open={state.leftOpen}
          onToggle={state.toggleLeft}
          tab={state.leftTab}
          onTabChange={state.setLeftTab}
          selectedId={state.selectedId}
          onSelect={state.select}
        />

        <div className="relative min-w-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,var(--canvas-1)_0%,var(--canvas-2)_100%)]">
          <Suspense fallback={<ViewerSkeleton packageCount={plan.placements.length} stopCount={plan.stops.length} />}>
            <LoadPlanViewer plan={plan} state={state} flags={flags} onPerfSample={showPerf ? setPerf : undefined} />
          </Suspense>

          <div className="absolute top-4 left-4">
            <SegmentedControl ariaLabel="Góc nhìn" options={CAMERA_PRESETS} value={state.cameraPreset} onChange={state.setCameraPreset} />
          </div>

          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <SegmentedControl ariaLabel="Chế độ tô màu" options={COLOR_MODES} value={state.colorMode} onChange={state.setColorMode} />
            <StopLegend stops={plan.stops} colorMode={state.colorMode} colorContext={colorContext} />
          </div>

          <div className="absolute bottom-4 left-4">
            <AxleLoadPanel front={plan.vehicle.frontAxle} rear={plan.vehicle.rearAxle} />
          </div>

          <div className="absolute right-4 bottom-4">
            <SlicePanel sliceMm={state.sliceMm} maxMm={plan.vehicle.innerLengthMm} onChange={state.setSliceMm} />
          </div>

          {showPerf && perf ? (
            <output
              title={`${formatInteger(perf.triangles)} tam giác`}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-sm bg-panel-dark px-2 py-1 font-mono text-caption whitespace-nowrap text-white/80"
            >
              {perf.fps} FPS · {perf.drawCalls} draw calls
            </output>
          ) : null}
        </div>

        <SelectedPackagePanel
          placement={state.selected}
          placements={state.placements}
          totalSteps={state.totalSteps}
          stops={plan.stops}
          tripId={tripId}
          onClose={() => state.select(null)}
          onSetOrientation={state.setOrientation}
          onTogglePin={state.togglePinned}
        />
      </div>

      <Timeline
        placements={state.placements}
        step={state.step}
        totalSteps={state.totalSteps}
        playing={state.playing}
        speed={state.speed}
        onStepChange={state.setStep}
        onStepForward={state.stepForward}
        onStepBackward={state.stepBackward}
        onGoToStart={state.goToStart}
        onTogglePlaying={state.togglePlaying}
        onSpeedChange={state.setSpeed}
      />

      <ApprovePlanDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        planLabel={selectedPlan ? `${selectedPlan.name} — ${selectedPlan.algorithm}` : 'Phương án'}
        fillRate={plan.fillRate}
        weightKg={totalWeightKg}
        placedCount={plan.placements.length}
        totalCount={totalPackages}
        checks={approvalChecks}
        onConfirm={handleApprove}
      />
    </div>
  )
}
