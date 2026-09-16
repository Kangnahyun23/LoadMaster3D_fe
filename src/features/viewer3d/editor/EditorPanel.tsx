import { useState, useSyncExternalStore } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { useFormat, useT } from '@/lib/i18n'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { EditorControls } from './EditorControls'
import { formatSnapSource } from './snapping'
import type { ManualEditor } from './useManualEditor'

export function EditorPanel({ state, editor }: { state: LoadPlanViewerState; editor: ManualEditor }) {
  const preview = useSyncExternalStore(editor.preview.subscribe, editor.preview.getSnapshot, editor.preview.getSnapshot)
  const [resetOpen, setResetOpen] = useState(false)
  const format = useFormat()
  const t = useT()
  const p = state.selected
  const active = preview?.id === p?.id ? preview : null
  const result = active?.result ?? editor.validation
  const position = active?.dragging ? active.position : p?.position
  const dragging = Boolean(active?.dragging)
  const warning = Boolean(result?.advisories.length)
  return <aside aria-label={t('viewer.editor.panelLabel')} className="flex max-h-[45dvh] w-full shrink-0 flex-col overflow-hidden border-t border-border bg-bg text-body-lg xl:max-h-none xl:w-90 xl:border-t-0 xl:border-l xl:text-body">
    <div className="shrink-0 px-4 pt-4">
    {p && result ? <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-h3 font-semibold">{t('common.packageAtStop', { id: p.id, stop: p.stop })}</h2>
        <span>{t(state.draft.patches.has(p.id) ? 'viewer.editor.manual' : 'viewer.editor.original')}{p.pinned ? ` · ${t('viewer.editor.pinned')}` : ''}</span>
      </div>
      <div role="status" aria-live="polite" data-editor-status data-valid={result.valid} data-dragging={dragging}
        data-x={position?.x} data-y={position?.y} data-z={position?.z} data-orientation={p.orientation}
        className="mb-4 max-h-40 overflow-y-auto rounded-md border border-border bg-surface p-3">
        <div className="flex items-center gap-2 font-medium">
          {!result.valid || warning ? <AlertCircle className={`size-5 ${result.valid ? 'text-warning' : 'text-danger'}`} strokeWidth={1.5} />
            : <CheckCircle2 className="size-5 text-success" strokeWidth={1.5} />}
          {t(result.valid ? warning ? 'viewer.editor.canPlaceWarning' : 'viewer.editor.canPlace' : 'viewer.editor.cannotPlace')}
        </div>
        {active?.message ? <p className="mt-1">{active.message}</p> : null}
        {[...result.errors, ...result.advisories].map((reason) => <p key={reason} className="mt-1">{reason}</p>)}
        {position ? <p className="mt-2 font-mono">X {format.length(position.x)} · Y {format.length(position.y)} · Z {format.length(position.z)}</p> : null}
        {active?.sources.length ? <p className="mt-1">{active.sources.map((s) => formatSnapSource(s, t)).join(' · ')}</p> : null}
      </div>
    </> : <p className="mb-4">{t('viewer.editor.empty')}</p>}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
    <fieldset disabled={dragging}><EditorControls state={state} editor={editor} /></fieldset>
    <p className="my-4 text-text-2">{t('viewer.editor.keyboard')}</p>
    <p className="mb-4 text-text-2">{t('viewer.editor.disclaimer')}</p>
    <Button variant="secondary" className="h-14 w-full text-body-lg xl:h-11 xl:text-body" disabled={!state.draft.patches.size || dragging} onClick={() => setResetOpen(true)}>
      {t('viewer.editor.resetAll')}
    </Button>
    </div>
    <Dialog open={resetOpen} onOpenChange={setResetOpen}>
      <DialogContent>
        <div className="p-6">
          <DialogTitle className="text-h2 font-semibold">{t('viewer.editor.resetTitle')}</DialogTitle>
          <DialogDescription className="mt-2 text-body-lg">{t('viewer.editor.resetDescription')}</DialogDescription>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="touch" onClick={() => setResetOpen(false)}>{t('viewer.editor.keepEdits')}</Button>
          <Button variant="secondary" size="touch" onClick={() => { editor.resetDraft(); setResetOpen(false) }}>{t('viewer.editor.resetConfirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </aside>
}
