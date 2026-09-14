import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Placement } from '@/types/load-plan'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { OperationsState } from '../operations/useOperations'
import { OperationsPanel } from '../operations/OperationsPanel'
import { SelectedPackagePanel } from './SelectedPackagePanel'
import { PackageListPanel } from './PackageListPanel'
import { SlicePanel } from '../overlays/SlicePanel'
import { StopLegend } from '../overlays/StopLegend'
import { COLOR_MODES } from '../viewer-options'
import type { ColorContext } from '../colors'
import type { InspectorTab } from './WorkspaceToolbar'

export function SceneInspector({ state, operations, tripId, colorContext, onEdit, onFocus, onSelect, tab, onTab, onClose }: {
  state: LoadPlanViewerState; operations: OperationsState; tripId: string; colorContext: ColorContext
  onEdit: () => void; onFocus: () => void; onSelect: (p: Placement) => void
  tab: InspectorTab | null; onTab: (tab: InspectorTab) => void; onClose: () => void
}) {
  return <Dialog open={tab !== null} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="fixed inset-x-0 bottom-0 max-h-[75dvh] w-full rounded-b-none xl:inset-x-auto xl:top-14 xl:right-0 xl:max-h-none xl:w-100 xl:rounded-none">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4">
        <DialogTitle className="text-h3 font-semibold">Thông tin phương án</DialogTitle>
        <Button variant="ghost" className="h-14 text-body-lg xl:h-11 xl:text-body" onClick={onClose}>Đóng</Button>
      </div>
      <DialogDescription className="sr-only">Thông tin kiện, vận hành và lớp hiển thị. Đóng để trở lại mô hình.</DialogDescription>
      <div className="grid shrink-0 grid-cols-4 gap-1 border-b border-border p-2" role="group" aria-label="Thông tin mô phỏng">
        {([['operations', 'Vận hành'], ['package', 'Kiện'], ['display', 'Hiển thị'], ['packages', 'Danh sách']] as const).map(([value, label]) =>
          <Button key={value} variant="secondary" className="h-14 px-1 text-body-lg aria-pressed:bg-primary-bg xl:h-11 xl:text-body"
            aria-pressed={tab === value} onClick={() => onTab(value)}>{label}</Button>)}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto" aria-label="Thông tin vận hành">
        {tab === 'operations' ? <OperationsPanel state={state} operations={operations} onSelect={(p) => { onSelect(p); onClose() }} /> : null}
        {tab === 'package' ? <>
          <label className="m-4 flex flex-col gap-2 text-body-lg xl:text-body">Chọn kiện
            <select aria-label="Chọn kiện" value={state.selectedId ?? ''} onChange={(e) => state.select(e.target.value || null)}
              className="h-14 min-w-0 rounded-md border border-border bg-bg px-2 font-mono xl:h-11">
              <option value="">Chọn kiện</option>{state.placements.map((p) => <option key={p.id} value={p.id}>{p.id} · Điểm {p.stop}</option>)}
            </select>
          </label>
          <SelectedPackagePanel placement={state.selected} placements={state.placements} totalSteps={state.totalSteps}
            stops={[...state.sceneModel.stops]} tripId={tripId} onClose={() => state.select(null)}
            onEdit={() => { onClose(); onEdit() }} onFocus={() => { onClose(); onFocus() }} />
        </> : null}
        {tab === 'display' ? <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
          <h2 className="font-medium">Lớp hiển thị</h2>
          <Button variant="secondary" aria-pressed={operations.showMass} onClick={() => operations.setShowMass(!operations.showMass)} className="h-14 xl:h-11">
            {operations.showMass ? 'Ẩn' : 'Hiện'} tâm khối lượng hàng</Button>
          <Button variant="secondary" aria-pressed={operations.showDistribution} onClick={() => operations.setShowDistribution(!operations.showDistribution)} className="h-14 xl:h-11">
            {operations.showDistribution ? 'Ẩn' : 'Hiện'} phân bố điểm giao</Button>
          <p className="text-text-2">Bản đồ điểm giao nằm trên mép trong sàn; hàng có thể che bản đồ.</p>
          <SegmentedControl ariaLabel="Chế độ tô màu" options={COLOR_MODES} value={state.colorMode} onChange={state.setColorMode}
            className="flex-col [&_button]:min-h-14 [&_button]:text-body-lg xl:[&_button]:min-h-11 xl:[&_button]:text-body" floating={false} />
          <StopLegend stops={[...state.sceneModel.stops]} colorMode={state.colorMode} colorContext={colorContext} />
          <SlicePanel sliceMm={state.sliceMm} maxMm={state.sceneModel.vehicle.innerLengthMm} onChange={state.setSliceMm} />
          <p>Space: phát/dừng · ←/→: từng bước · Esc: thoát tập trung. Kéo mô hình để xoay, chụm hai ngón để phóng to.</p>
        </div> : null}
        {tab === 'packages' ? <PackageListPanel unplaced={[...state.sceneModel.unplaced]} pinned={state.placements.filter((p) => p.pinned)}
          placements={state.placements} vehicle={state.sceneModel.vehicle} open onToggle={onClose} tab={state.leftTab}
          onTabChange={state.setLeftTab} selectedId={state.selectedId} onSelect={(id) => { state.select(id); onTab('package') }} /> : null}
      </div>
    </DialogContent>
  </Dialog>
}
