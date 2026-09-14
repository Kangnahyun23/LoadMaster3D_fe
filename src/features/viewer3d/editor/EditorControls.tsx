import { Focus, Pin, PinOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ORIENTATION_LABELS } from '@/types/load-plan'
import { formatInteger } from '@/lib/format'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { AXES } from './geometry'
import type { DragPlane, ManualEditor } from './useManualEditor'

const controlClass = 'h-14 px-2 text-body-lg xl:h-11 xl:text-body'
export function EditorControls({ state, editor }: { state: LoadPlanViewerState; editor: ManualEditor }) {
  const p = state.selected
  if (!p) return null
  return <div className="flex flex-col gap-4">
    <div className="flex gap-2">
      <Button variant="secondary" className={`${controlClass} flex-1`} onClick={editor.focusSelected}><Focus strokeWidth={1.5} />Tập trung vào kiện</Button>
      <Button variant="secondary" className={controlClass} onClick={editor.togglePin}>
        {p.pinned ? <PinOff strokeWidth={1.5} /> : <Pin strokeWidth={1.5} />}{p.pinned ? 'Bỏ ghim' : 'Ghim'}
      </Button>
    </div>
    {p.pinned ? <p>Đã ghim: bỏ ghim trước khi di chuyển hoặc xoay.</p> : null}
    <fieldset disabled={p.pinned} className="flex min-w-0 flex-col gap-4 disabled:cursor-not-allowed">
      <div>
        <span className="mb-2 block">Dịch chuyển theo trục</span>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Bước dịch chuyển">
          {[10, 50, 100].map((mm) => <Button key={mm} variant="secondary" className={controlClass}
            aria-pressed={editor.nudgeMm === mm} onClick={() => editor.setNudgeMm(mm)}
            style={editor.nudgeMm === mm ? { borderColor: 'var(--primary)', background: 'var(--primary-bg)' } : undefined}>{formatInteger(mm)} mm</Button>)}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Dịch chuyển kiện">
          {AXES.map((axis) => <div key={axis} className="flex flex-col gap-2">
            <Button variant="secondary" className={controlClass} onClick={() => editor.nudge(axis, -1)} aria-label={`Giảm ${axis.toUpperCase()}`}>{axis.toUpperCase()} −</Button>
            <Button variant="secondary" className={controlClass} onClick={() => editor.nudge(axis, 1)} aria-label={`Tăng ${axis.toUpperCase()}`}>{axis.toUpperCase()} +</Button>
          </div>)}
        </div>
        <p className="mt-2 text-text-2">X: dọc thùng · Y: ngang thùng · Z: chiều cao. Nút dịch chuyển đi đúng bước mm, không tự hút.</p>
      </div>
      <div role="group" aria-label="Hướng xoay" className="grid grid-cols-3 gap-2">
        {([0, 1, 2] as const).map((orientation) => <Button key={orientation} variant="secondary" className={controlClass}
          aria-pressed={p.orientation === orientation} onClick={() => editor.rotate(orientation)}
          style={p.orientation === orientation ? { borderColor: 'var(--primary)', background: 'var(--primary-bg)' } : undefined}>{ORIENTATION_LABELS[orientation]}</Button>)}
      </div>
      <label className="flex flex-col gap-2">Mặt phẳng kéo
        <select value={editor.plane} onChange={(e) => editor.setPlane(e.target.value as DragPlane)}
          className="h-14 rounded-md border border-border bg-bg px-2 focus-visible:outline-2 focus-visible:outline-primary xl:h-11">
          <option value="xy">X–Y · Song song sàn</option>
          <option value="xz">X–Z · Dọc thùng và chiều cao</option>
          <option value="yz">Y–Z · Ngang thùng và chiều cao</option>
        </select>
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" className={`${controlClass} flex-1`} aria-pressed={editor.snapping} onClick={() => editor.setSnapping(!editor.snapping)}>
          Hút khi kéo: {editor.snapping ? 'Bật' : 'Tắt'}
        </Button>
        <Button variant="secondary" className={controlClass} onClick={editor.snap}>Căn vị trí</Button>
      </div>
    </fieldset>
    <Button variant="ghost" className={controlClass} disabled={!state.draft.patches.has(p.id)} onClick={editor.resetPlacement}>
      <RotateCcw strokeWidth={1.5} />Khôi phục kiện này
    </Button>
  </div>
}
