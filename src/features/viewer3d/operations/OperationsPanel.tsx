import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { AxleLoadPanel } from '../overlays/AxleLoadPanel'
import { stopOrderConsistent } from './operations-model'
import { BlockerPanel } from './BlockerPanel'
import type { OperationsState } from './useOperations'

export function OperationsPanel({ state, operations, onSelect }: {
  state: LoadPlanViewerState; operations: OperationsState; onSelect: (p: ScenePlacement) => void
}) {
  const { current, next, focusStop, semantics } = operations
  const stop = state.sceneModel.stops.find((p) => p.number === focusStop)
  const consistent = useMemo(() => stopOrderConsistent(state.placements), [state.placements])
  const target = state.placements.find((p) => p.id === semantics.inspectionId)
  return <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
    <label className="flex flex-col gap-2 md:hidden">Điểm giao
      <select aria-label="Tập trung điểm giao" value={focusStop ?? ''} onChange={(e) => operations.setFocusStop(e.target.value ? Number(e.target.value) : null)} className="h-14 rounded-md border border-border bg-bg px-2">
        {operations.kind === 'loading' ? <option value="">Tất cả điểm giao</option> : null}
        {state.sceneModel.stops.map((s) => <option key={s.number} value={s.number}>Điểm {s.number} · {s.name}</option>)}
      </select>
    </label>
    <div>
      <h2 className="text-h3 font-semibold">{stop ? `Điểm ${stop.number} / ${state.sceneModel.stops.length}` : 'Toàn bộ điểm giao'}</h2>
      <p>{stop?.name ?? 'Phương án đang mô phỏng'}</p>
      {stop ? <p className="mt-1 text-text-2">Các điểm trước được ẩn trong mô phỏng.</p> : null}
    </div>
    {operations.kind === 'loading' ? <p className="text-text-2">Trầm: đã xếp · Nổi bật: hiện tại · Mờ: tiếp theo · Chưa tới: ẩn</p> : null}
    <div className="rounded-md border border-border bg-surface p-3">
      <p className="font-medium">{operations.kind === 'unloading' ? 'Thứ tự dỡ gợi ý' : 'Theo bước xếp của phương án'}</p>
      {current ? <Button variant="ghost" className="h-14 w-full justify-start px-0 text-body-lg xl:h-11 xl:text-body" onClick={() => onSelect(current)}>
        Hiện tại: {current.id} · Điểm {current.stop}
      </Button> : <p className="mt-2">Đã hoàn tất mô phỏng.</p>}
      {next ? <p>Tiếp theo: {next.id} · Điểm {next.stop}</p> : null}
    </div>
    <p>{consistent ? 'Thứ tự xếp phù hợp thứ tự điểm giao.' : 'Thứ tự xếp chưa phù hợp thứ tự điểm giao.'} Đây là kiểm tra thứ tự, chưa chứng minh khả năng dỡ.</p>
    <Button variant="secondary" aria-pressed={operations.inspectBlockers} onClick={() => operations.setInspectBlockers(!operations.inspectBlockers)}
      className="h-14 text-body-lg xl:h-11 xl:text-body">{operations.inspectBlockers ? 'Ẩn' : 'Xem'} kiện có thể cản đường</Button>
    {operations.inspectBlockers ? <BlockerPanel target={target} blockers={semantics.blockers} onSelect={onSelect} /> : null}
    {operations.kind === 'unloading' ? <p className="text-text-2">Mũi tên về cửa biểu diễn hành lang dỡ thẳng. Cảnh báo chỉ mang tính hỗ trợ; mô phỏng tạm dừng để xem kiện có khả năng cản đường.</p> : null}
    <AxleLoadPanel axles={state.sceneModel.vehicle.axles} />
  </div>
}
