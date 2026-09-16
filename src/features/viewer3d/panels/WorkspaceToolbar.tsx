import { Button } from '@/components/ui/Button'
import type { CameraPreset, PlanStop } from '@/types/load-plan'
import { CAMERA_PRESETS } from '../viewer-options'
import type { OperationsState } from '../operations/useOperations'
export type InspectorTab = 'operations' | 'package' | 'display' | 'packages' | 'metrics'

/** One workspace bar. Less-used controls live in a labelled inspector. */
export function WorkspaceToolbar({ operations, stops, preset, onPreset, onInspect, onEdit }: {
  operations: OperationsState; stops: readonly PlanStop[]; preset: CameraPreset
  onPreset: (p: CameraPreset) => void; onInspect: (tab: InspectorTab) => void; onEdit: () => void
}) {
  const control = 'h-14 rounded-md border border-border bg-bg px-2 text-body-lg focus-visible:outline-2 focus-visible:outline-primary xl:h-11 xl:text-body'
  return <div className="flex flex-none items-center gap-2 border-b border-border bg-bg px-2 py-1" data-workspace-toolbar>
    <div className="flex gap-1" role="group" aria-label="Mô phỏng vận hành">
      {(['loading', 'unloading'] as const).map((kind) => <Button key={kind} variant="secondary" className={`${control} px-2 aria-pressed:border-primary aria-pressed:bg-primary-bg`}
        aria-pressed={operations.kind === kind} onClick={() => operations.setKind(kind)}>{kind === 'loading' ? 'Xếp hàng' : 'Dỡ hàng'}</Button>)}
    </div>
    <select aria-label="Tập trung điểm giao" value={operations.focusStop ?? ''} onChange={(e) => operations.setFocusStop(e.target.value ? Number(e.target.value) : null)}
      className={`${control} hidden min-w-0 max-w-64 md:block`}>
      {operations.kind === 'loading' ? <option value="">Tất cả điểm giao</option> : null}
      {stops.map((s) => <option key={s.number} value={s.number}>Điểm {s.number} · {s.name}</option>)}
    </select>
    <select aria-label="Góc nhìn" value={preset} onChange={(e) => onPreset(e.target.value as CameraPreset)} className={`${control} min-w-0 flex-1 sm:max-w-40 sm:flex-none`}>
      {CAMERA_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
    </select>
    <div className="ml-auto hidden gap-2 lg:flex">
      <Button variant="ghost" className={control} onClick={() => onInspect('packages')}>Danh sách kiện</Button>
      <Button variant="ghost" className={control} onClick={() => onInspect('operations')}>Vận hành</Button>
      <Button variant="secondary" className={control} onClick={onEdit}>Chỉnh sửa</Button>
    </div>
    <Button variant="secondary" className={`${control} shrink-0`} onClick={() => onInspect('display')}>Hiển thị</Button>
  </div>
}
