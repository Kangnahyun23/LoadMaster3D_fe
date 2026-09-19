import { useMemo } from 'react'
import { Focus, Pencil, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useFormat, useT } from '@/lib/i18n'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { OperationsState } from './useOperations'
import { cargoCenterOfMass } from './operations-model'
import type { InspectorTab } from '../panels/WorkspaceToolbar'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'

/** Context at screen edges; spatial facts stay on the selected/current objects. */
export function SceneHud({ state, operations, onInspect, onFocus, onEdit, onResetFocus }: {
  state: LoadPlanViewerState; operations: OperationsState; onInspect: (tab: InspectorTab) => void
  onFocus: (p?: ScenePlacement) => void; onEdit?: () => void; onResetFocus?: () => void
}) {
  const p = operations.current, stopNumber = operations.focusStop ?? p?.stop
  const stop = state.sceneModel.stops.find((s) => s.number === stopNumber)
  const count = state.placements.filter((p) => p.stop === stopNumber).length
  const format = useFormat()
  const t = useT()
  const mass = useMemo(() => operations.showMass ? cargoCenterOfMass(operations.semantics.massPlacements) : null, [operations.showMass, operations.semantics.massPlacements])
  return <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 xl:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 max-w-80 text-body-lg text-bg xl:text-body">
        <div key={stopNumber} className="animate-[lm-fade-in_150ms_var(--ease-standard)]">
          <p className="font-medium">{t('viewer.hud.stopOf', { kind: t(operations.kind === 'loading' ? 'viewer.operations.loading' : operations.unload.fromResult ? 'viewer.operations.unloading' : 'viewer.operations.suggestedUnloading'), number: stopNumber ?? '', total: state.sceneModel.stops.length })}</p>
          <p className="truncate text-body-lg xl:text-h3">{stop?.name}</p>
          <p className="hidden text-caption text-bg/80 sm:block">{t('viewer.hud.packagesHere', { count })} · {t(operations.kind === 'loading' ? 'viewer.hud.loadingHint' : 'viewer.hud.unloadingHint')}</p>
        </div>
        <Button variant="ghost" className="pointer-events-auto mt-2 h-14 border border-border-dark bg-panel-dark px-3 text-body-lg text-bg hover:bg-border-dark xl:h-11 xl:text-body"
          aria-pressed={operations.follow === 'on'} onClick={() => operations.setFollow(operations.follow === 'on' ? 'off' : 'on')}>
          <Focus strokeWidth={1.5} />{operations.follow === 'paused' ? t('viewer.hud.resumeFollow') : t('viewer.hud.follow', { state: t(operations.follow === 'on' ? 'common.on' : 'common.off') })}
        </Button>
        {onResetFocus ? <Button variant="ghost" className="pointer-events-auto ml-2 h-14 border border-border-dark bg-panel-dark px-3 text-bg hover:bg-border-dark xl:h-11" onClick={onResetFocus}>{t('viewer.hud.overview')}</Button> : null}
        {operations.kind === 'unloading' && p && state.selectedId !== p.id ? <Button variant="secondary" className="pointer-events-auto mt-2 h-14 text-text xl:h-11" onClick={() => { state.select(p.id); onFocus(p) }}>{t('viewer.hud.backToTarget')}</Button> : null}
        {operations.kind === 'unloading' && operations.unload.warning ? <div className="mt-2 max-w-72 rounded-md border border-warning bg-panel-dark p-2">
          <p>{t('viewer.operations.blockers.paused')}</p>
          <Button variant="ghost" className="pointer-events-auto h-14 text-bg hover:bg-border-dark xl:h-11" onClick={() => operations.unload.setCursor(operations.unload.cursor + 1)}>{t('viewer.hud.skipStep')}</Button>
        </div> : null}
      </div>
      {mass ? <div className="max-w-60 rounded-md border border-border-dark bg-panel-dark p-3 text-body text-bg" data-mass-hud>
        <p className="font-medium">{t('viewer.cues.centerOfMass')}</p>
        <p className="font-mono">X {format.length(mass.position.x)} · Y {format.length(mass.position.y)} · Z {format.length(mass.position.z)}</p>
        <p>{t('viewer.hud.lateralOffset', { value: format.length(Math.abs(mass.position.y - state.sceneModel.vehicle.innerWidthCm / 2)) })}</p>
      </div> : null}
    </div>
    <div className="flex items-end justify-between gap-2">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-md border border-border bg-bg p-1">
        <Button variant="ghost" aria-label={t('viewer.hud.selectPackage')} className="h-14 min-w-0 px-2 text-body-lg xl:h-11 xl:text-body" onClick={() => onInspect('package')}>
          <span className="max-w-32 truncate font-mono xl:max-w-48">{state.selected?.id ?? t('viewer.hud.selectPackage')}</span>
        </Button>
        <Button variant="ghost" className="size-14 p-0 xl:size-11" aria-label={t('viewer.hud.focus')} disabled={!state.selected} onClick={() => onFocus()}><Focus strokeWidth={1.5} /></Button>
        {onEdit ? <Button variant="ghost" className="size-14 p-0 xl:size-11" aria-label={t('viewer.hud.edit')} disabled={!state.selected} onClick={onEdit}><Pencil strokeWidth={1.5} /></Button> : null}
      </div>
      <Button variant="secondary" className="pointer-events-auto size-14 shrink-0 p-0 xl:h-11 xl:w-auto xl:px-3" aria-label={t('viewer.hud.detailsLabel')} onClick={() => onInspect('operations')}>
        <Settings2 strokeWidth={1.5} /><span className="hidden xl:inline">{t('viewer.hud.detailsLabel')}</span>
      </Button>
    </div>
  </div>
}
