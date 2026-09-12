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
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { formatInteger } from '@/lib/format'
import { notifyPendingFeature } from '@/lib/pending-feature'
import { StopCard } from './StopCard'
import { STOPS, type DeliveryStop } from './trip-detail.mock'

/**
 * Danh sách điểm giao kéo thả được.
 * Điểm cuối trong danh sách là điểm được xếp sâu nhất trong thùng,
 * nên thứ tự ở đây quyết định thứ tự xếp hàng.
 */
export function StopList() {
  const [stops, setStops] = useState<DeliveryStop[]>(STOPS)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setStops((current) => {
      const from = current.findIndex((stop) => stop.id === active.id)
      const to = current.findIndex((stop) => stop.id === over.id)
      if (from === -1 || to === -1) return current
      return arrayMove(current, from, to)
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 font-semibold">Thứ tự điểm giao</h2>
          <span className="font-mono text-caption text-text-3">
            {formatInteger(stops.length)} điểm
          </span>
        </div>
        <span className="text-caption text-text-3">
          Kéo để sắp xếp · điểm cuối được xếp sâu nhất
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stops.map((stop) => stop.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {stops.map((stop, index) => (
              <StopCard key={stop.id} stop={stop} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() =>
          notifyPendingFeature('Thêm điểm giao', 'Điểm giao sinh ra từ đơn hàng của chuyến.')
        }
        className="flex h-11 items-center justify-center gap-2 rounded-md border border-dashed border-switch-off bg-transparent text-body font-medium text-text-2 transition-colors duration-(--dur-fast) ease-standard hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Plus className="size-4" strokeWidth={1.5} aria-hidden />
        Thêm điểm giao
      </button>
    </div>
  )
}
