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
export function StopList({ stops, onReorder, onRemove }: {
  stops: readonly StopRow[]
  onReorder: (stops: readonly DeliveryStop[]) => void
  onRemove: (stop: StopRow) => void
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
    onReorder(arrayMove([...stops], from, to).map(({ id, name, address }) => ({ id, name, address })))
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
        <span className="text-caption text-text-3">{t('trips.stops.hint')}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {stops.map((stop) => <StopCard key={stop.id} stop={stop} onRemove={() => onRemove(stop)} />)}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
