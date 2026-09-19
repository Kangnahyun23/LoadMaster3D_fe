import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import type { OperationsState } from '../operations/useOperations'
import type { SceneStop } from '../scene-input'
import type { CameraPreset } from '../viewer-types'
import { CameraSelect, PlannerSelect } from './PlannerSelect'

export type InspectorTab = 'operations' | 'package' | 'display' | 'packages' | 'metrics'

/** Radix Select không nhận `value=""`: dòng "Mọi điểm giao" dùng giá trị riêng rồi đổi về `null`. */
const ALL_STOPS = 'all'

export type SimulationControlsProps = {
  operations: OperationsState
  stops: readonly SceneStop[]
  preset: CameraPreset
  onPreset: (preset: CameraPreset) => void
}

/**
 * Xếp/Dỡ, điểm giao đang tập trung và góc nhìn (LM-094). Từ 1.366 px chúng nằm ngay trong thanh trên (một hàng điều khiển,
 * D-51); hẹp hơn thì ở `WorkspaceToolbar`. Danh sách kiện, vận hành và lớp hiển thị chỉ mở từ nút "Chi tiết / Hiển thị" ở góc
 * khung 3D — thanh công cụ không lặp lại lối vào đó (U-4).
 */
export function SimulationControls({ operations, stops, preset, onPreset }: SimulationControlsProps) {
  const t = useT()
  const stopOptions = [
    ...(operations.kind === 'loading' ? [{ value: ALL_STOPS, label: t('viewer.toolbar.allStops') }] : []),
    ...stops.map((stop) => ({ value: String(stop.number), label: t('common.stopWithName', { number: stop.number, name: stop.name }) })),
  ]
  return (
    <>
      <div className="flex shrink-0 gap-1" role="group" aria-label={t('viewer.toolbar.simulation')}>
        {(['loading', 'unloading'] as const).map((kind) => (
          <Button
            key={kind}
            variant="secondary"
            aria-pressed={operations.kind === kind}
            onClick={() => operations.setKind(kind)}
            className="h-14 px-2.5 text-body-lg aria-pressed:border-primary aria-pressed:bg-primary-bg xl:h-11 xl:text-body"
          >
            {t(kind === 'loading' ? 'viewer.operations.loading' : 'viewer.operations.unloading')}
          </Button>
        ))}
      </div>
      <PlannerSelect
        label={t('viewer.toolbar.focusStop')}
        className="hidden w-48 min-w-28 md:flex xl:w-40"
        value={operations.focusStop === null ? ALL_STOPS : String(operations.focusStop)}
        options={stopOptions}
        onValueChange={(value) => operations.setFocusStop(value === ALL_STOPS ? null : Number(value))}
      />
      <CameraSelect label={t('viewer.toolbar.camera')} preset={preset} onPreset={onPreset} className="flex-1 sm:flex-none" />
    </>
  )
}

/**
 * Thanh công cụ riêng dưới thanh trên khi màn hẹp hơn 1.366 px: tablet giữ hai hàng điều khiển 56px (LM-094). Nút Chỉnh sửa từ
 * `lg`; màn hẹp hơn vào chỉnh sửa bằng nút bút ở thẻ kiện trên khung 3D.
 */
export function WorkspaceToolbar({ onEdit, ...simulation }: SimulationControlsProps & { onEdit?: () => void }) {
  const t = useT()
  return (
    <div className="flex flex-none items-center gap-2 border-b border-border bg-bg px-2 py-1 min-[1366px]:hidden" data-workspace-toolbar>
      <SimulationControls {...simulation} />
      {onEdit ? (
        <Button variant="secondary" className="ml-auto hidden h-14 px-3 text-body-lg lg:flex xl:h-11 xl:text-body" onClick={onEdit}>
          {t('viewer.toolbar.edit')}
        </Button>
      ) : null}
    </div>
  )
}
