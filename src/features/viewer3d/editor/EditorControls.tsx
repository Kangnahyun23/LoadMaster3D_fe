import { Focus, Pin, PinOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { effectiveOrientations } from '@/domain/geometry'
import { useFormat, useT } from '@/lib/i18n'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { AXES, EDITOR_NUDGE_STEPS_CM } from './geometry'
import type { DragPlane, ManualEditor } from './useManualEditor'

const controlClass = 'h-14 px-2 text-body-lg xl:h-11 xl:text-body'
const PLANES: readonly DragPlane[] = ['xy', 'xz', 'yz']
export function EditorControls({ state, editor }: { state: LoadPlanViewerState; editor: ManualEditor }) {
  const t = useT()
  const format = useFormat()
  const p = state.selected
  if (!p) return null
  return <div className="flex flex-col gap-4">
    <div className="flex gap-2">
      <Button variant="secondary" className={`${controlClass} flex-1`} onClick={editor.focusSelected}><Focus strokeWidth={1.5} />{t('viewer.editor.focus')}</Button>
      <Button variant="secondary" className={controlClass} onClick={editor.togglePin}>
        {p.pinned ? <PinOff strokeWidth={1.5} /> : <Pin strokeWidth={1.5} />}{p.pinned ? t('viewer.editor.unpin') : t('viewer.editor.pin')}
      </Button>
    </div>
    {p.pinned ? <p>{t('viewer.editor.pinnedHint')}</p> : null}
    <fieldset disabled={p.pinned} className="flex min-w-0 flex-col gap-4 disabled:cursor-not-allowed">
      <div>
        <span className="mb-2 block">{t('viewer.editor.nudgeTitle')}</span>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('viewer.editor.nudgeStep')}>
          {EDITOR_NUDGE_STEPS_CM.map((cm) => <Button key={cm} variant="secondary" className={controlClass}
            aria-pressed={editor.nudgeCm === cm} onClick={() => editor.setNudgeCm(cm)}
            style={editor.nudgeCm === cm ? { borderColor: 'var(--primary)', background: 'var(--primary-bg)' } : undefined}>{format.length(cm)}</Button>)}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label={t('viewer.editor.nudgeGroup')}>
          {AXES.map((axis) => <div key={axis} className="flex flex-col gap-2">
            <Button variant="secondary" className={controlClass} onClick={() => editor.nudge(axis, -1)} aria-label={t('viewer.editor.decrease', { axis: axis.toUpperCase() })}>{axis.toUpperCase()} −</Button>
            <Button variant="secondary" className={controlClass} onClick={() => editor.nudge(axis, 1)} aria-label={t('viewer.editor.increase', { axis: axis.toUpperCase() })}>{axis.toUpperCase()} +</Button>
          </div>)}
        </div>
        <p className="mt-2 text-text-2">{t('viewer.editor.axesHint')}</p>
      </div>
      <div role="group" aria-label={t('viewer.editor.rotation')} className="grid grid-cols-3 gap-2">
        {effectiveOrientations(state.sceneModel.orientationRulesById.get(p.id) ?? { allowedOrientations: [p.orientation], keepUpright: false }).map((orientation) => <Button key={orientation} variant="secondary" className={controlClass}
          aria-pressed={p.orientation === orientation} onClick={() => editor.rotate(orientation)}
          style={p.orientation === orientation ? { borderColor: 'var(--primary)', background: 'var(--primary-bg)' } : undefined}><span className="font-mono">{orientation}</span></Button>)}
      </div>
      <label className="flex flex-col gap-2">{t('viewer.editor.plane')}
        <select value={editor.plane} onChange={(e) => editor.setPlane(e.target.value as DragPlane)}
          className="h-14 rounded-md border border-border bg-bg px-2 focus-visible:outline-2 focus-visible:outline-primary xl:h-11">
          {PLANES.map((plane) => <option key={plane} value={plane}>{t(`viewer.editor.planes.${plane}`)}</option>)}
        </select>
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" className={`${controlClass} flex-1`} aria-pressed={editor.snapping} onClick={() => editor.setSnapping(!editor.snapping)}>
          {t('viewer.editor.snapping', { state: t(editor.snapping ? 'common.on' : 'common.off') })}
        </Button>
        <Button variant="secondary" className={controlClass} onClick={editor.snap}>{t('viewer.editor.snap')}</Button>
      </div>
    </fieldset>
    <Button variant="ghost" className={controlClass} disabled={!state.draft.patches.has(p.id)} onClick={editor.resetPlacement}>
      <RotateCcw strokeWidth={1.5} />{t('viewer.editor.resetOne')}
    </Button>
  </div>
}
