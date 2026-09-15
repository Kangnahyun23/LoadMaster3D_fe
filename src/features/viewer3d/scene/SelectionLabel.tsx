import { SceneCallout } from './SceneCallout'
import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import { boxCenter, boxSize } from './units'

/**
 * Nhãn mã kiện neo trên đỉnh kiện đang chọn — trường hợp duy nhất mục 7
 * cho phép dùng `<Html>` của drei, vì nhãn phải bám theo vật thể 3D.
 */
export function SelectionLabel({ placement, role = 'selected' }: { placement: ScenePlacement; role?: 'selected' | 'current' | 'next' }) {
  const [cx, cy, cz] = boxCenter(placement)
  const [, height] = boxSize(placement)

  return (
    <SceneCallout
      position={[cx, cy + height / 2, cz]}
      offset={role === 'next' ? [110, -24] : role === 'current' ? [-90, -80] : [0, -100]}
      width={role === 'next' ? 180 : 168}
    >
        <span className={`inline-block rounded-sm border px-2 py-1 text-body-lg font-medium whitespace-nowrap xl:text-caption ${role === 'next' ? 'border-info bg-panel-dark text-bg' : 'border-border bg-bg text-text'}`}>
          <span className="block">{role === 'current' ? 'Hiện tại' : role === 'next' ? 'Tiếp theo' : 'Đã chọn'} · Điểm {placement.stop}</span>
          {role !== 'next' ? <span className="font-mono">{placement.id}</span> : null}
        </span>
    </SceneCallout>
  )
}
