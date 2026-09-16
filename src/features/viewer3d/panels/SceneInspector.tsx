import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { ConstraintIssue } from '@/domain/constraints'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { useT } from '@/lib/i18n'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { OperationsState } from '../operations/useOperations'
import { OperationsPanel } from '../operations/OperationsPanel'
import { SelectedPackagePanel } from './SelectedPackagePanel'
import { PackageListPanel } from './PackageListPanel'
import { PlanMetricsPanel } from './PlanMetricsPanel'
import { SlicePanel } from '../overlays/SlicePanel'
import { StopLegend } from '../overlays/StopLegend'
import { ObstacleLegend } from '../overlays/ObstacleLegend'
import { COLOR_MODES } from '../viewer-options'
import type { ColorContext } from '../colors'
import type { InspectorTab } from './WorkspaceToolbar'

export function SceneInspector({ state, operations, tripId, colorContext, issues, onEdit, onFocus, onSelect, tab, onTab, onClose }: {
  state: LoadPlanViewerState; operations: OperationsState; tripId: string; colorContext: ColorContext
  /** Lỗi và cảnh báo ràng buộc của phương án đang xem (gồm chỉnh tay), LM-049 */
  issues: readonly ConstraintIssue[]
  onEdit: () => void; onFocus: () => void; onSelect: (p: ScenePlacement) => void
  tab: InspectorTab | null; onTab: (tab: InspectorTab) => void; onClose: () => void
}) {
  const t = useT()
  const metrics = state.sceneModel.metrics
  const tabs = [['operations', t('viewer.inspector.tabs.operations')], ['package', t('viewer.inspector.tabs.package')], ['display', t('viewer.inspector.tabs.display')], ['packages', t('viewer.inspector.tabs.packages')],
    ...(metrics ? [['metrics', t('viewer.plan.metricsTab')] as const] : [])] as const
  return <Dialog open={tab !== null} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="fixed inset-x-0 bottom-0 max-h-[75dvh] w-full rounded-b-none xl:inset-x-auto xl:top-14 xl:right-0 xl:max-h-none xl:w-100 xl:rounded-none">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4">
        <DialogTitle className="text-h3 font-semibold">{t('viewer.inspector.title')}</DialogTitle>
        <Button variant="ghost" className="h-14 text-body-lg xl:h-11 xl:text-body" onClick={onClose}>{t('viewer.inspector.close')}</Button>
      </div>
      <DialogDescription className="sr-only">{t('viewer.inspector.description')}</DialogDescription>
      <div className={`grid shrink-0 gap-1 border-b border-border p-2 ${metrics ? 'grid-cols-3 xl:flex' : 'grid-cols-4'}`} role="group" aria-label={t('viewer.inspector.tabsLabel')}>
        {tabs.map(([value, label]) =>
          <Button key={value} variant="secondary" className="h-14 px-1 text-body-lg aria-pressed:bg-primary-bg xl:h-11 xl:flex-auto xl:px-2 xl:text-body"
            aria-pressed={tab === value} onClick={() => onTab(value)}>{label}</Button>)}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" aria-label={t('viewer.inspector.contentLabel')}>
        {tab === 'operations' ? <OperationsPanel state={state} operations={operations} onSelect={(p) => { onSelect(p); onClose() }} /> : null}
        {tab === 'package' ? <>
          <label className="m-4 flex flex-col gap-2 text-body-lg xl:text-body">{t('viewer.inspector.selectPackage')}
            <select aria-label={t('viewer.inspector.selectPackage')} value={state.selectedId ?? ''} onChange={(e) => state.select(e.target.value || null)}
              className="h-14 min-w-0 rounded-md border border-border bg-bg px-2 font-mono xl:h-11">
              <option value="">{t('viewer.inspector.selectPackage')}</option>{state.placements.map((p) => <option key={p.id} value={p.id}>{t('common.packageAtStop', { id: p.id, stop: p.stop })}</option>)}
            </select>
          </label>
          <SelectedPackagePanel placement={state.selected} placements={state.placements} totalSteps={state.totalSteps}
            orientationRules={state.selected ? state.sceneModel.orientationRulesById.get(state.selected.id) : undefined}
            stops={[...state.sceneModel.stops]} tripId={tripId} issues={issues} onClose={() => state.select(null)}
            onEdit={() => { onClose(); onEdit() }} onFocus={() => { onClose(); onFocus() }} />
        </> : null}
        {tab === 'display' ? <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
          <h2 className="font-medium">{t('viewer.inspector.layers')}</h2>
          <Button variant="secondary" aria-pressed={operations.showMass} onClick={() => operations.setShowMass(!operations.showMass)} className="h-14 xl:h-11">
            {t(operations.showMass ? 'viewer.inspector.hideMass' : 'viewer.inspector.showMass')}</Button>
          <Button variant="secondary" aria-pressed={operations.showDistribution} onClick={() => operations.setShowDistribution(!operations.showDistribution)} className="h-14 xl:h-11">
            {t(operations.showDistribution ? 'viewer.inspector.hideDistribution' : 'viewer.inspector.showDistribution')}</Button>
          <p className="text-text-2">{t('viewer.inspector.stopMapHint')}</p>
          <SegmentedControl ariaLabel={t('viewer.inspector.colorMode')} options={COLOR_MODES.map((mode) => ({ value: mode, label: t(`viewer.colorModes.${mode}`) }))} value={state.colorMode} onChange={state.setColorMode}
            className="flex-col [&_button]:min-h-14 [&_button]:text-body-lg xl:[&_button]:min-h-11 xl:[&_button]:text-body" floating={false} />
          <StopLegend stops={[...state.sceneModel.stops]} colorMode={state.colorMode} colorContext={colorContext} />
          <ObstacleLegend obstacles={state.sceneModel.vehicle.obstacles} />
          <SlicePanel sliceCm={state.sliceCm} maxCm={state.sceneModel.vehicle.innerLengthCm} onChange={state.setSliceCm} />
          <p>{t('viewer.inspector.shortcuts')}</p>
        </div> : null}
        {tab === 'packages' ? <PackageListPanel unplaced={state.sceneModel.unplaced} pinned={state.placements.filter((p) => p.pinned)}
          placements={state.placements} vehicle={state.sceneModel.vehicle} open onToggle={onClose} tab={state.leftTab}
          onTabChange={state.setLeftTab} selectedId={state.selectedId} onSelect={(id) => { state.select(id); onTab('package') }}
          stops={state.sceneModel.stops} issues={issues} tripId={tripId} /> : null}
        {tab === 'metrics' && metrics ? <PlanMetricsPanel metrics={metrics} /> : null}
      </div>
    </DialogContent>
  </Dialog>
}
