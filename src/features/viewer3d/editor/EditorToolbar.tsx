import { useSyncExternalStore } from 'react'
import { Redo2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { ManualEditor } from './useManualEditor'
import { CAMERA_PRESETS } from '../viewer-options'
import type { CameraPreset } from '@/types/load-plan'

export function EditorToolbar({ state, editor, onModeChange = editor.setMode }: {
  state: LoadPlanViewerState; editor: ManualEditor; onModeChange?: ManualEditor['setMode']
}) {
  const preview = useSyncExternalStore(editor.preview.subscribe, editor.preview.getSnapshot, editor.preview.getSnapshot)
  const dragging = Boolean(preview?.dragging)
  return (
    <div className="flex flex-none flex-wrap items-center gap-2 border-b border-border bg-bg px-2 py-1 sm:flex-nowrap" aria-label="Chế độ phương án">
      <div role="group" aria-label="Chế độ thao tác" className="flex gap-1">
        {(['view', 'edit'] as const).map((mode) => (
          <Button key={mode} variant="secondary" aria-pressed={editor.mode === mode} onClick={() => onModeChange(mode)}
            className="h-14 px-3 text-body-lg aria-pressed:border-primary aria-pressed:bg-primary-bg xl:h-11 xl:text-body">
            {mode === 'view' ? 'Xem' : 'Chỉnh sửa'}
          </Button>
        ))}
      </div>
      {editor.mode === 'edit' ? <>
        <Button variant="ghost" aria-label="Hoàn tác" disabled={!state.canUndo || dragging} onClick={editor.undo} className="size-14 p-0 xl:size-11">
          <Undo2 strokeWidth={1.5} />
        </Button>
        <Button variant="ghost" aria-label="Làm lại" disabled={!state.canRedo || dragging} onClick={editor.redo} className="size-14 p-0 xl:size-11">
          <Redo2 strokeWidth={1.5} />
        </Button>
      </> : null}
      <select aria-label="Góc nhìn" value={state.cameraPreset} onChange={(e) => state.setCameraPreset(e.target.value as CameraPreset)}
        className="h-14 min-w-0 rounded-md border border-border bg-bg px-2 text-body-lg xl:h-11 xl:text-body">
        {CAMERA_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <label className="ml-auto flex min-w-0 basis-full items-center gap-2 text-body-lg sm:basis-auto xl:text-body">
        <span className="shrink-0 sm:hidden xl:inline">Chọn kiện</span>
        <select aria-label="Chọn kiện" value={state.selectedId ?? ''} disabled={dragging}
          onChange={(e) => { editor.preview.publish(null, true); state.select(e.target.value || null) }}
          className="h-14 min-w-0 flex-1 rounded-md border border-border bg-bg px-2 font-mono focus-visible:outline-2 focus-visible:outline-primary xl:h-11">
          <option value="">Chọn kiện</option>
          {state.placements.map((p) => <option key={p.id} value={p.id}>{p.id} · Điểm {p.stop}</option>)}
        </select>
      </label>
    </div>
  )
}
