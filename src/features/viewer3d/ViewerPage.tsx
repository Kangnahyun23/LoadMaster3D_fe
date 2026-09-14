import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { notifyPendingFeature } from '@/lib/pending-feature'
import { WorkspaceToolbar, type InspectorTab } from './panels/WorkspaceToolbar'
import { SceneHud } from './operations/SceneHud'
import { DEFAULT_SELECTED_ID, LOAD_PLAN } from '@/lib/load-plan.mock'
import { PLANS } from '@/lib/plan-comparison.mock'
import type { LoadPlan } from '@/types/load-plan'
import { benchmarkCountFromSearch, createBenchmarkPlan } from './benchmark.mock'
import { createPerfStore, DebugOverlay } from './DebugOverlay'
import { debugQualityTier } from './viewer-options'
import { ApprovePlanDialog } from './ApprovePlanDialog'
import { createColorContext } from './colors'
import { SceneInspector } from './panels/SceneInspector'
import { Timeline } from './Timeline'
import { useLoadPlanViewer } from './useLoadPlanViewer'
import { ViewerHeader } from './ViewerHeader'
import { usePerformanceFlags } from './usePerformanceFlags'
import { ViewerSkeleton } from './ViewerSkeleton'
import { useManualEditor } from './editor/useManualEditor'
import { EditorToolbar } from './editor/EditorToolbar'
import { EditorPanel } from './editor/EditorPanel'
import { EditorGestureHud } from './editor/EditorGestureHud'
import { useOperations } from './operations/useOperations'
import { operationApprovalChecks } from './operations/approval-checks'

/** Three.js là chunk nặng nhất — chỉ tải khi mở màn này, các màn khác không gánh. */
const LoadPlanViewer = lazy(() =>
  import('./LoadPlanViewer').then((module) => ({ default: module.LoadPlanViewer })),
)

/**
 * Xem phương án 3D — toàn màn, không có nav rail (theo bản design).
 * Hành động chính duy nhất: "Duyệt phương án".
 * Phím tắt: Space phát/dừng, ←/→ lùi/tiến một bước, Home về đầu.
 */
export function ViewerPage() {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const count = benchmarkCountFromSearch(searchParams.toString())
  const plan = useMemo(() => count ? createBenchmarkPlan(count) : LOAD_PLAN, [count])
  // A new snapshot owns a new draft, selection, slice and playback session.
  return <ViewerSession key={`${params.tripId}:${plan.tripId}`} plan={plan} />
}

function ViewerSession({ plan }: { plan: LoadPlan }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const tripId = params.tripId ?? plan.tripId
  const showPerf = searchParams.has('debug')
  const selectedPlan = PLANS.find((p) => p.key === searchParams.get('plan')) ?? PLANS[2]

  const flags = usePerformanceFlags(debugQualityTier(searchParams))
  const state = useLoadPlanViewer(plan, { initialSelectedId: plan === LOAD_PLAN ? DEFAULT_SELECTED_ID : plan.placements[0]?.id })
  const editor = useManualEditor(state)
  const operations = useOperations(state)
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const perfStore = useMemo(() => createPerfStore(), [])
  const [approveOpen, setApproveOpen] = useState(false)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab | null>(null)
  const { followPlacement } = editor
  const { follow, current: currentOperation } = operations
  useEffect(() => { if (follow === 'on' && currentOperation && editor.mode === 'view') followPlacement(currentOperation) }, [follow, currentOperation, editor.mode, followPlacement])

  const totalWeightKg = useMemo(
    () => state.placements.reduce((sum, p) => sum + p.weightKg, 0),
    [state.placements],
  )
  const totalPackages = plan.placements.length + plan.unplaced.length

  const approvalChecks = useMemo(() => approveOpen
    ? operationApprovalChecks(state.placements, plan.vehicle, state.draft.patches.size > 0) : [],
  [approveOpen, state.placements, plan.vehicle, state.draft.patches.size])

  const { togglePlaying, stepForward, stepBackward, goToStart } = operations
  useEffect(() => {
    if (editor.mode === 'edit') return
    function handleKeyDown(event: KeyboardEvent) {
      // Không cướp phím khi người dùng đang gõ trong ô nhập hoặc hộp thoại đang mở.
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"]')) return
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
  }, [togglePlaying, stepForward, stepBackward, goToStart, editor.mode])

  function handleApprove() {
    setApproveOpen(false)
    notifyPendingFeature('Duyệt phương án và gửi phiếu xếp tới kho')
  }
  function handleModeChange(mode: 'view' | 'edit') { operations.stop(); operations.setFollow('off'); editor.setMode(mode) }

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
      {editor.mode === 'edit' ? <EditorToolbar state={state} editor={editor} onModeChange={handleModeChange} /> :
        <WorkspaceToolbar operations={operations} stops={plan.stops} preset={state.cameraPreset} onPreset={state.setCameraPreset}
          onInspect={setInspectorTab} onEdit={() => handleModeChange('edit')} />}
      <div className={`relative flex min-h-0 flex-1 ${editor.mode === 'edit' ? 'flex-col xl:flex-row' : ''}`}>
        <div className="relative min-h-48 min-w-0 flex-1 overflow-hidden bg-canvas-1">
          <Suspense fallback={<ViewerSkeleton packageCount={plan.placements.length} stopCount={plan.stops.length} />}>
            <LoadPlanViewer state={state} flags={flags} editor={editor} operations={operations} onPerfSample={showPerf ? perfStore.publish : undefined} />
          </Suspense>

          {editor.mode === 'view' ? <SceneHud state={state} operations={operations} onInspect={setInspectorTab}
            onResetFocus={editor.focus ? () => { operations.setFollow('off'); editor.resetFocus() } : undefined}
            onFocus={(p) => { operations.pauseFollow(); if (p) editor.focusPlacement(p); else editor.focusSelected() }} onEdit={() => handleModeChange('edit')} /> : null}
          {showPerf ? <DebugOverlay store={perfStore} /> : null}
          {editor.mode === 'edit' && state.selected ? <EditorGestureHud placement={state.selected} editor={editor} /> : null}
        </div>

        {editor.mode === 'edit' ? <EditorPanel state={state} editor={editor} /> :
          <SceneInspector state={state} operations={operations} tripId={tripId} colorContext={colorContext}
            onEdit={() => handleModeChange('edit')} onFocus={editor.focusSelected}
            onSelect={(p) => { state.select(p.id); operations.pauseFollow(); editor.focusPlacement(p) }}
            tab={inspectorTab} onTab={setInspectorTab} onClose={() => setInspectorTab(null)} />}
      </div>

      {editor.mode === 'view' ? <Timeline
        placements={state.placements}
        kind={operations.kind}
        orderedOverride={operations.kind === 'unloading' ? operations.unload.ordered : undefined}
        step={operations.kind === 'unloading' ? operations.unload.cursor : state.step}
        totalSteps={operations.kind === 'unloading' ? operations.unload.ordered.length : state.totalSteps}
        playing={operations.playing}
        speed={state.speed}
        onStepChange={operations.kind === 'unloading' ? operations.unload.setCursor : state.setStep}
        onStepForward={operations.stepForward}
        onStepBackward={operations.stepBackward}
        onGoToStart={operations.goToStart}
        onTogglePlaying={operations.togglePlaying}
        onSpeedChange={state.setSpeed}
      /> : null}

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
