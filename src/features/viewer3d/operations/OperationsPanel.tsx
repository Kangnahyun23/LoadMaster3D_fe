import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { AxleLoadPanel } from '../overlays/AxleLoadPanel'
import { stopOrderConsistent } from './operations-model'
import { BlockerPanel } from './BlockerPanel'
import type { OperationsState } from './useOperations'

export function OperationsPanel({ state, operations, onSelect }: {
  state: LoadPlanViewerState; operations: OperationsState; onSelect: (p: ScenePlacement) => void
}) {
  const t = useT()
  const { current, next, focusStop, semantics } = operations
  const stop = state.sceneModel.stops.find((p) => p.number === focusStop)
  const consistent = useMemo(() => stopOrderConsistent(state.placements), [state.placements])
  const target = state.placements.find((p) => p.id === semantics.inspectionId)
  const unloadingTitle = operations.unload.fromResult ? t('viewer.operations.unloadingOrder') : t('viewer.operations.suggestedUnloadingOrder')
  return <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
    <label className="flex flex-col gap-2 md:hidden">{t('viewer.operations.stop')}
      <select aria-label={t('viewer.toolbar.focusStop')} value={focusStop ?? ''} onChange={(e) => operations.setFocusStop(e.target.value ? Number(e.target.value) : null)} className="h-14 rounded-md border border-border bg-bg px-2">
        {operations.kind === 'loading' ? <option value="">{t('viewer.toolbar.allStops')}</option> : null}
        {state.sceneModel.stops.map((s) => <option key={s.number} value={s.number}>{t('common.stopWithName', { number: s.number, name: s.name })}</option>)}
      </select>
    </label>
    <div>
      <h2 className="text-h3 font-semibold">{stop ? t('viewer.operations.stopOf', { number: stop.number, total: state.sceneModel.stops.length }) : t('viewer.operations.allStops')}</h2>
      <p>{stop?.name ?? t('viewer.operations.simulatedPlan')}</p>
      {stop ? <p className="mt-1 text-text-2">{t('viewer.operations.earlierHidden')}</p> : null}
    </div>
    {operations.kind === 'loading' ? <p className="text-text-2">{t('viewer.operations.loadingLegend')}</p> : null}
    <div className="rounded-md border border-border bg-surface p-3">
      <p className="font-medium">{operations.kind === 'unloading' ? unloadingTitle : t('viewer.operations.loadingOrder')}</p>
      {state.sceneModel.ordersRecomputed ? <p className="text-text-2">{t('viewer.operations.ordersRecomputed')}</p> : null}
      {current ? <Button variant="ghost" className="h-14 w-full justify-start px-0 text-body-lg xl:h-11 xl:text-body" onClick={() => onSelect(current)}>
        {t('viewer.operations.current', { id: current.id, stop: current.stop })}
      </Button> : <p className="mt-2">{t('viewer.operations.done')}</p>}
      {next ? <p>{t('viewer.operations.next', { id: next.id, stop: next.stop })}</p> : null}
    </div>
    <p>{t(consistent ? 'viewer.operations.orderConsistent' : 'viewer.operations.orderInconsistent')}. {t('viewer.operations.orderScope')}</p>
    <Button variant="secondary" aria-pressed={operations.inspectBlockers} onClick={() => operations.setInspectBlockers(!operations.inspectBlockers)}
      className="h-14 text-body-lg xl:h-11 xl:text-body">{t(operations.inspectBlockers ? 'viewer.operations.blockers.toggleHide' : 'viewer.operations.blockers.toggleShow')}</Button>
    {operations.inspectBlockers ? <BlockerPanel target={target} lifo={semantics.lifo} onSelect={onSelect} /> : null}
    {operations.kind === 'unloading' ? <p className="text-text-2">{t('viewer.operations.blockers.corridor')}</p> : null}
    <AxleLoadPanel axles={state.sceneModel.vehicle.axles} />
  </div>
}
