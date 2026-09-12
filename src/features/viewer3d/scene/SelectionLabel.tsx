import { Html } from '@react-three/drei'
import type { Placement } from '@/types/load-plan'
import { boxCenter, boxSize } from './units'

/**
 * Nhãn mã kiện neo trên đỉnh kiện đang chọn — trường hợp duy nhất mục 7
 * cho phép dùng `<Html>` của drei, vì nhãn phải bám theo vật thể 3D.
 */
export function SelectionLabel({ placement }: { placement: Placement }) {
  const [cx, cy, cz] = boxCenter(placement)
  const [, height] = boxSize(placement)

  return (
    <Html
      position={[cx, cy + height / 2, cz]}
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center">
        <span className="rounded-sm bg-bg px-2 py-1 font-mono text-[11px] leading-3.5 font-semibold whitespace-nowrap text-text">
          {placement.id}
        </span>
        <span aria-hidden className="h-[34px] w-px bg-bg" />
      </div>
    </Html>
  )
}
