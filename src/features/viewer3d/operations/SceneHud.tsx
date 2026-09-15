import { useMemo } from 'react'
import { Focus, Pencil, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatInteger } from '@/lib/format'
import { useFormat } from '@/lib/i18n'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { OperationsState } from './useOperations'
import { cargoCenterOfMass } from './operations-model'
import type { InspectorTab } from '../panels/WorkspaceToolbar'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'

/** Context at screen edges; spatial facts stay on the selected/current objects. */
export function SceneHud({ state, operations, onInspect, onFocus, onEdit, onResetFocus }: {
  state: LoadPlanViewerState; operations: OperationsState; onInspect: (tab: InspectorTab) => void
  onFocus: (p?: ScenePlacement) => void; onEdit: () => void; onResetFocus?: () => void
}) {
  const p = operations.current, stopNumber = operations.focusStop ?? p?.stop
  const stop = state.sceneModel.stops.find((s) => s.number === stopNumber)
  const count = state.placements.filter((p) => p.stop === stopNumber).length
  const format = useFormat()
  const mass = useMemo(() => operations.showMass ? cargoCenterOfMass(operations.semantics.massPlacements) : null, [operations.showMass, operations.semantics.massPlacements])
  return <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 xl:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 max-w-80 text-body-lg text-bg xl:text-body">
        <div key={stopNumber} className="animate-[lm-fade-in_150ms_var(--ease-standard)]">
          <p className="font-medium">{operations.kind === 'loading' ? 'Xếp hàng' : 'Dỡ hàng gợi ý'} · Điểm {stopNumber} / {state.sceneModel.stops.length}</p>
          <p className="truncate text-body-lg xl:text-h3">{stop?.name}</p>
          <p className="hidden text-caption text-bg/80 sm:block">{formatInteger(count)} kiện tại điểm này · {operations.kind === 'loading' ? 'Theo bước phương án' : 'Hướng ra cửa sau'}</p>
        </div>
        <Button variant="ghost" className="pointer-events-auto mt-2 h-14 border border-border-dark bg-panel-dark px-3 text-body-lg text-bg hover:bg-border-dark xl:h-11 xl:text-body"
          aria-pressed={operations.follow === 'on'} onClick={() => operations.setFollow(operations.follow === 'on' ? 'off' : 'on')}>
          <Focus strokeWidth={1.5} />{operations.follow === 'paused' ? 'Tiếp tục theo bước' : `Theo bước: ${operations.follow === 'on' ? 'Bật' : 'Tắt'}`}
        </Button>
        {onResetFocus ? <Button variant="ghost" className="pointer-events-auto ml-2 h-14 border border-border-dark bg-panel-dark px-3 text-bg hover:bg-border-dark xl:h-11" onClick={onResetFocus}>Xem toàn xe</Button> : null}
        {operations.kind === 'unloading' && p && state.selectedId !== p.id ? <Button variant="secondary" className="pointer-events-auto mt-2 h-14 text-text xl:h-11" onClick={() => { state.select(p.id); onFocus(p) }}>Quay lại kiện cần dỡ</Button> : null}
        {operations.kind === 'unloading' && operations.unload.warning ? <div className="mt-2 max-w-72 rounded-md border border-warning bg-panel-dark p-2">
          <p>Có khả năng cản đường · Đã tạm dừng</p>
          <Button variant="ghost" className="pointer-events-auto h-14 text-bg hover:bg-border-dark xl:h-11" onClick={() => operations.unload.setCursor(operations.unload.cursor + 1)}>Bỏ qua bước trong mô phỏng</Button>
        </div> : null}
      </div>
      {mass ? <div className="max-w-60 rounded-md border border-border-dark bg-panel-dark p-3 text-body text-bg" data-mass-hud>
        <p className="font-medium">Tâm khối lượng hàng</p>
        <p className="font-mono">X {format.length(mass.position.x)} · Y {format.length(mass.position.y)} · Z {format.length(mass.position.z)}</p>
        <p>Lệch ngang {format.length(Math.abs(mass.position.y - state.sceneModel.vehicle.innerWidthCm / 2))}</p>
      </div> : null}
    </div>
    <div className="flex items-end justify-between gap-2">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-md border border-border bg-bg p-1">
        <Button variant="ghost" aria-label="Chọn kiện" className="h-14 min-w-0 px-2 text-body-lg xl:h-11 xl:text-body" onClick={() => onInspect('package')}>
          <span className="max-w-32 truncate font-mono xl:max-w-48">{state.selected?.id ?? 'Chọn kiện'}</span>
        </Button>
        <Button variant="ghost" className="size-14 p-0 xl:size-11" aria-label="Tập trung vào kiện" disabled={!state.selected} onClick={() => onFocus()}><Focus strokeWidth={1.5} /></Button>
        <Button variant="ghost" className="size-14 p-0 xl:size-11" aria-label="Chỉnh sửa kiện" disabled={!state.selected} onClick={onEdit}><Pencil strokeWidth={1.5} /></Button>
      </div>
      <Button variant="secondary" className="pointer-events-auto size-14 shrink-0 p-0 xl:h-11 xl:w-auto xl:px-3" aria-label="Chi tiết / Hiển thị" onClick={() => onInspect('operations')}>
        <Settings2 strokeWidth={1.5} /><span className="hidden xl:inline">Chi tiết</span>
      </Button>
    </div>
  </div>
}
