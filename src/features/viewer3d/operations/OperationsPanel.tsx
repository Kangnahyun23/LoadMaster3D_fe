import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { formatInteger, formatWeight } from '@/lib/format'
import type { Placement } from '@/types/load-plan'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import { AxleLoadPanel } from '../overlays/AxleLoadPanel'
import { cargoCenterOfMass, stopOrderConsistent } from './operations-model'
import { BlockerPanel } from './BlockerPanel'
import type { OperationsState } from './useOperations'

export function OperationsPanel({ state, operations, onSelect }: {
  state: LoadPlanViewerState; operations: OperationsState; onSelect: (p: Placement) => void
}) {
  const { current, next, focusStop, semantics } = operations
  const stop = state.sceneModel.stops.find((p) => p.number === focusStop)
  const consistent = useMemo(() => stopOrderConsistent(state.placements), [state.placements])
  const mass = useMemo(() => cargoCenterOfMass(semantics.massPlacements), [semantics.massPlacements])
  const target = state.placements.find((p) => p.id === semantics.inspectionId)
  return <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
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
    {operations.kind === 'unloading' ? <p className="text-text-2">Khung hướng về cửa là vùng kiểm tra đường dỡ. Chuyển động chỉ minh họa; kiện có khả năng bị cản sẽ mờ tại chỗ.</p> : null}
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <Button variant="secondary" aria-pressed={operations.showMass} onClick={() => operations.setShowMass(!operations.showMass)}
        className="h-14 text-body-lg xl:h-11 xl:text-body">{operations.showMass ? 'Ẩn' : 'Hiện'} tâm khối lượng hàng</Button>
      {operations.showMass ? <p>{mass ? `X ${formatInteger(mass.position.x)} · Y ${formatInteger(mass.position.y)} · Z ${formatInteger(mass.position.z)} mm · ${formatWeight(mass.weightKg)}` : 'Chưa có khối lượng hàng để tính.'}</p> : null}
      <p className="text-text-2">Chỉ tính hàng đã xếp/còn lại trong mô phỏng, không phải toàn xe.</p>
      <Button variant="secondary" aria-pressed={operations.showDistribution} onClick={() => operations.setShowDistribution(!operations.showDistribution)}
        className="h-14 text-body-lg xl:h-11 xl:text-body">{operations.showDistribution ? 'Ẩn' : 'Hiện'} phân bố điểm giao</Button>
      <p className="text-text-2">Dải bên sàn biểu diễn hàng đã xếp/còn lại theo từng đoạn thùng; đoạn có nhiều điểm giữ nhiều màu.</p>
      <ul>{state.sceneModel.stops.map((s) => <li key={s.number}>Điểm {s.number} · {s.name}</li>)}</ul>
    </div>
    <AxleLoadPanel front={state.sceneModel.vehicle.frontAxle} rear={state.sceneModel.vehicle.rearAxle} />
  </div>
}
