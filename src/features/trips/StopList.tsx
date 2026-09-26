import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { toast } from 'sonner'
import type { DeliveryStop } from '@/lib/mock-db'
import { useT } from '@/lib/i18n'
import { StopCard } from './StopCard'
import type { StopRow } from './trip-summary'

/**
 * Danh sách điểm giao kéo thả được (LM-046). Thứ tự là nguồn chuẩn của `deliveryStop`: thả xong là lưu ngay qua
 * mutation, kiện được đánh số lại trong kho. Điểm cuối trong danh sách được xếp sâu nhất trong thùng.
 * Kéo bằng bàn phím vẫn dùng được (dnd-kit KeyboardSensor).
 */
export function StopList({ stops, onReorder, onRemove, readOnly = false, selectedStop = null, onSelectStop }: {
  stops: readonly StopRow[]
  onReorder: (stops: readonly DeliveryStop[]) => void
  onRemove: (stop: StopRow) => void
  /** Chỉ xem: không kéo, không xoá, không hiện gợi ý kéo (D-41, D-45). */
  readOnly?: boolean
  /** V2: số điểm đang lọc bảng kiện; bấm điểm đang lọc thì bỏ lọc (`null`). Lọc được cả khi chỉ xem. */
  selectedStop?: number | null
  onSelectStop?: (stopNumber: number | null) => void
}) {
  const t = useT()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = stops.findIndex((stop) => stop.id === active.id)
    const to = stops.findIndex((stop) => stop.id === over.id)
    if (from === -1 || to === -1) return
    // Bỏ các trường tính từ kiện, giữ nguyên dữ liệu điểm giao (kể cả số điện thoại, người liên hệ — D-46)
    onReorder(arrayMove([...stops], from, to).map(({ number: _number, packageCount: _count, weightKg: _weight, ...stop }) => stop))
    toast.success(t('trips.stops.reordered'))
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <h2 className="text-h3 font-semibold">{t('trips.stops.title')}</h2>
          <span className="font-mono text-caption text-text-3">
            {t('trips.stops.count', { count: stops.length })}
          </span>
        </div>
        <span className="text-caption text-ink-3">
          {onSelectStop ? t('trips.stops.filterHint') : null}
          {onSelectStop && !readOnly ? ' ' : null}
          {readOnly ? null : t('trips.stops.hint')}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {stops.map((stop) => (
              <StopCard
                key={stop.id}
                stop={stop}
                readOnly={readOnly}
                onRemove={() => onRemove(stop)}
                selected={selectedStop === stop.number}
                onSelect={onSelectStop ? () => onSelectStop(selectedStop === stop.number ? null : stop.number) : undefined}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
