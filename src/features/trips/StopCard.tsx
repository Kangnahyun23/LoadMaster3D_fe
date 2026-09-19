import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Trash2 } from 'lucide-react'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { StopRow } from './trip-summary'

/**
 * Thẻ một điểm giao, kéo được để đổi thứ tự.
 *
 * Lệch có chủ ý khỏi mục 5 CLAUDE.md: thẻ đang kéo dùng bóng `--e3`.
 * Luật cấm bóng áp cho thẻ ở trạng thái nghỉ; thẻ đang kéo là lớp đang
 * nhấc khỏi mặt phẳng nên xử lý như lớp nổi, đúng như bản design.
 */
export function StopCard({ stop, onRemove, readOnly = false }: {
  stop: StopRow
  onRemove: () => void
  /** Không kéo, không xoá: người chỉ xem hoặc chuyến đã khoá (D-41, D-45). */
  readOnly?: boolean
}) {
  const t = useT()
  const format = useFormat()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id, disabled: readOnly })

  const stopNumber = stop.number

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
      className={cn(
        'relative flex items-center gap-4 rounded-md border bg-bg py-3.5 pr-4 pl-3',
        isDragging
          ? 'z-2 border-primary shadow-e3'
          : 'z-1 border-border shadow-none',
      )}
    >
      {readOnly ? null : <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t('trips.stops.dragHandle', { name: stop.name })}
        className={cn(
          'grid size-5 flex-none place-items-center text-text-disabled',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>}

      <span
        aria-hidden
        className="grid size-8 flex-none place-items-center rounded-full font-mono text-body font-semibold leading-none"
        style={{
          background: stopColor(stopNumber),
          color: stopForeground(stopNumber),
        }}
      >
        {stopNumber}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-body font-medium">
          <span className="sr-only">{t('trips.stops.numberLabel', { number: stopNumber })} </span>
          {stop.name}
        </span>
        <span className="inline-flex items-center gap-1.5 truncate text-caption text-text-3">
          <MapPin className="size-3.5 flex-none" strokeWidth={1.5} aria-hidden />
          {stop.address}
        </span>
      </div>

      <div className="flex flex-none flex-col items-end gap-0.5">
        <span className="font-mono text-body font-medium">
          {format.integer(stop.packageCount)}{' '}
          <span className="font-sans text-caption font-normal text-text-3">
            {t('trips.stops.packagesUnit')}
          </span>
        </span>
        <span className="font-mono text-caption text-text-3">
          {format.weight(stop.weightKg)}
        </span>
      </div>

      {readOnly ? null : <button
        type="button"
        aria-label={t('trips.stops.remove', { name: stop.name })}
        onClick={onRemove}
        className={cn(
          'grid size-8 flex-none place-items-center rounded-md text-text-3',
          'transition-colors duration-(--dur-fast) ease-standard hover:bg-surface',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>}
    </li>
  )
}
