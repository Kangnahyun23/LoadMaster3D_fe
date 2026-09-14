import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Placement } from '@/types/load-plan'
import type { LoadPlanViewerState } from '../useLoadPlanViewer'
import type { OperationsState } from '../operations/useOperations'
import { OperationsPanel } from '../operations/OperationsPanel'
import { SelectedPackagePanel } from './SelectedPackagePanel'
import { SlicePanel } from '../overlays/SlicePanel'
import { StopLegend } from '../overlays/StopLegend'
import { COLOR_MODES } from '../viewer-options'
import type { ColorContext } from '../colors'

export function SceneInspector({ state, operations, tripId, colorContext, onEdit, onFocus, onSelect }: {
  state: LoadPlanViewerState; operations: OperationsState; tripId: string; colorContext: ColorContext
  onEdit: () => void; onFocus: () => void; onSelect: (p: Placement) => void
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'operations' | 'package' | 'display'>('operations')
  const content = <>
    <div className="flex shrink-0 gap-1 border-b border-border p-2" role="group" aria-label="Thông tin mô phỏng">
      {([['operations', 'Vận hành'], ['package', 'Kiện'], ['display', 'Hiển thị']] as const).map(([value, label]) =>
        <Button key={value} variant="secondary" className="h-14 flex-1 px-2 text-body-lg aria-pressed:bg-primary-bg xl:h-11 xl:text-body"
          aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</Button>)}
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {tab === 'operations' ? <OperationsPanel state={state} operations={operations} onSelect={onSelect} /> : null}
      {tab === 'package' ? <SelectedPackagePanel placement={state.selected} placements={state.placements}
        totalSteps={state.totalSteps} stops={[...state.sceneModel.stops]} tripId={tripId} onClose={() => state.select(null)}
        onEdit={() => { setOpen(false); onEdit() }} onFocus={onFocus} /> : null}
      {tab === 'display' ? <div className="flex flex-col gap-4 p-4 text-body-lg xl:text-body">
        <SegmentedControl ariaLabel="Chế độ tô màu" options={COLOR_MODES} value={state.colorMode} onChange={state.setColorMode}
          className="flex-col [&_button]:min-h-14 [&_button]:text-body-lg xl:[&_button]:min-h-11 xl:[&_button]:text-body" floating={false} />
        <StopLegend stops={[...state.sceneModel.stops]} colorMode={state.colorMode} colorContext={colorContext} />
        <SlicePanel sliceMm={state.sliceMm} maxMm={state.sceneModel.vehicle.innerLengthMm} onChange={state.setSliceMm} />
        <p>Phát lại: Space · Mũi tên trái/phải · Home. Kéo mô hình để xoay, chụm hai ngón để phóng to.</p>
      </div> : null}
    </div>
  </>
  return <>
    <aside className="hidden w-90 shrink-0 flex-col overflow-hidden border-l border-border bg-bg xl:flex" aria-label="Thông tin vận hành">{content}</aside>
    <Button variant="secondary" className="absolute right-2 bottom-2 z-30 h-14 text-body-lg xl:hidden" onClick={() => setOpen(true)}>Chi tiết / Hiển thị</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="fixed inset-x-0 bottom-0 max-h-[80dvh] w-full rounded-b-none">
        <div className="flex shrink-0 items-center justify-between px-4 pt-2">
          <DialogTitle className="text-h3 font-semibold">Thông tin phương án</DialogTitle>
          <Button variant="ghost" className="h-14 text-body-lg" onClick={() => setOpen(false)}>Đóng</Button>
        </div>
        <DialogDescription className="sr-only">Thông tin kiện, vận hành và điều khiển hiển thị</DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  </>
}
