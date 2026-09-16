import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { useT } from '@/lib/i18n'
import { ApprovePlanDialog } from './ApprovePlanDialog'
import { useViewerApproval } from './approval/useViewerApproval'
import { createColorContext } from './colors'
import { createPerfStore, DebugOverlay } from './DebugOverlay'
import { EditorGestureHud } from './editor/EditorGestureHud'
import { EditorPanel } from './editor/EditorPanel'
import { EditorToolbar } from './editor/EditorToolbar'
import { useManualEditor } from './editor/useManualEditor'
import { operationApprovalChecks } from './operations/approval-checks'
import { SceneHud } from './operations/SceneHud'
import { useOperations } from './operations/useOperations'
import { SceneInspector } from './panels/SceneInspector'
import { WorkspaceToolbar, type InspectorTab } from './panels/WorkspaceToolbar'
import type { ViewerSceneModel } from './scene-input'
import { Timeline } from './Timeline'
import { useLoadPlanViewer } from './useLoadPlanViewer'
import { usePerformanceFlags } from './usePerformanceFlags'
import { ViewerHeader } from './ViewerHeader'
import { debugQualityTier } from './viewer-options'
import { ViewerSkeleton } from './ViewerSkeleton'

/** Three.js là chunk nặng nhất — chỉ tải khi mở màn này, các màn khác không gánh. */
const LoadPlanViewer = lazy(() => import('./LoadPlanViewer').then((module) => ({ default: module.LoadPlanViewer })))

/**
 * Một phiên Planner trên một snapshot (LM-049, LM-050): header chỉ số, banner lỗi thời, scene, inspector, timeline và Duyệt.
 * Hành động chính duy nhất: "Duyệt phương án". Phím tắt: Space phát/dừng, ←/→ lùi/tiến một bước, Home về đầu.
 */
export function ViewerSession({ model: plan }: { model: ViewerSceneModel }) {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const tripId = params.tripId ?? plan.tripId
  const showPerf = searchParams.has('debug')
  const t = useT()

  const flags = usePerformanceFlags(debugQualityTier(searchParams))
  const state = useLoadPlanViewer(plan, { initialSelectedId: plan.placements[0]?.id })
  const editor = useManualEditor(state)
  const operations = useOperations(state)
  const approval = useViewerApproval(plan, state)
  const colorContext = useMemo(() => createColorContext(plan), [plan])
  const perfStore = useMemo(() => createPerfStore(), [])
  const [approveOpen, setApproveOpen] = useState(false)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab | null>(null)
  const { followPlacement } = editor
  const { follow, current: currentOperation } = operations
  useEffect(() => { if (follow === 'on' && currentOperation && editor.mode === 'view') followPlacement(currentOperation) }, [follow, currentOperation, editor.mode, followPlacement])

  const totalPackages = plan.placements.length + plan.unplaced.length
  const planIssues = useMemo(() => approval.approval ? [...approval.approval.blockers.issues, ...approval.approval.warnings] : [], [approval.approval])
  const approvalChecks = useMemo(() => approveOpen
    ? operationApprovalChecks(state.placements, state.draft.patches.size > 0, t) : [],
  [approveOpen, state.placements, state.draft.patches.size, t])

  const { togglePlaying, stepForward, stepBackward, goToStart } = operations
  useEffect(() => {
    if (editor.mode === 'edit') return
    function handleKeyDown(event: KeyboardEvent) {
      // Không cướp phím khi người dùng đang gõ trong ô nhập hoặc hộp thoại đang mở.
      const target = event.target instanceof HTMLElement ? event.target : null
      if (target?.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"]')) return
      if (event.key === ' ') { event.preventDefault(); togglePlaying() }
      else if (event.key === 'ArrowRight') stepForward()
      else if (event.key === 'ArrowLeft') stepBackward()
      else if (event.key === 'Home') goToStart()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlaying, stepForward, stepBackward, goToStart, editor.mode])

  function handleModeChange(mode: 'view' | 'edit') { operations.stop(); operations.setFollow('off'); editor.setMode(mode) }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg">
      <ViewerHeader
        tripId={tripId}
        metrics={plan.metrics}
        placedCount={plan.placements.length}
        totalCount={totalPackages}
        isMockResult={plan.isMockResult}
        approved={plan.revision?.approved ?? false}
        manuallyEdited={state.draft.patches.size > 0 || (plan.revision?.manuallyEdited ?? false)}
        blockedReason={approval.blockedReason}
        onApprove={() => setApproveOpen(true)}
      />
      {plan.revision?.stale ? (
        <div role="alert" className="flex flex-none flex-wrap items-center gap-3 border-b border-badge-warning-border bg-badge-warning-bg px-4 py-2 text-body text-badge-warning-fg">
          <span>{t('viewer.plan.staleBanner')}</span>
          <Link to={`/chuyen/${tripId}/toi-uu`} className="font-medium text-primary">{t('viewer.plan.rerun')}</Link>
        </div>
      ) : null}
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
          <SceneInspector state={state} operations={operations} tripId={tripId} colorContext={colorContext} issues={planIssues}
            onEdit={() => handleModeChange('edit')} onFocus={editor.focusSelected}
            onSelect={(p) => { state.select(p.id); operations.pauseFollow(); editor.focusPlacement(p) }}
            tab={inspectorTab} onTab={setInspectorTab} onClose={() => setInspectorTab(null)} />}
      </div>

      {editor.mode === 'view' ? <Timeline
        placements={state.placements}
        kind={operations.kind}
        orderedOverride={operations.kind === 'unloading' ? operations.unload.ordered : undefined}
        suggested={!operations.unload.fromResult}
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

      {plan.metrics && approval.approval ? (
        <ApprovePlanDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          metrics={plan.metrics}
          canSubmit={approval.canSubmit}
          approval={approval.approval}
          checks={approvalChecks}
          pending={approval.pending}
          onConfirm={() => approval.confirm(() => setApproveOpen(false))}
        />
      ) : null}
    </div>
  )
}
