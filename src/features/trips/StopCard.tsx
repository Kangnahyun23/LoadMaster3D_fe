import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useFormat, useT } from '@/lib/i18n'
import { stopColor, stopForeground } from '@/lib/stops'
import { cn } from '@/lib/utils'
import type { StopRow } from './trip-summary'

/**
 * Thẻ một điểm giao, kéo được để đổi thứ tự.
 *
 * Lệch có chủ ý khỏi mục 5 AGENTS.md: thẻ đang kéo dùng bóng `--e3`.
 * Luật cấm bóng áp cho thẻ ở trạng thái nghỉ; thẻ đang kéo là lớp đang
 * nhấc khỏi mặt phẳng nên xử lý như lớp nổi, đúng như bản design.
 */
export function StopCard({ stop, onRemove, readOnly = false, selected = false, onSelect }: {
  stop: StopRow
  onRemove: () => void
  /** Không kéo, không xoá: người chỉ xem hoặc chuyến đã khoá (D-41, D-45). */
  readOnly?: boolean
  /** V2: điểm này đang lọc bảng kiện. */
  selected?: boolean
  /** V2: bấm vào số và tên điểm để lọc bảng kiện theo điểm này (nút `aria-pressed`, tách khỏi nút kéo và nút xoá). */
  onSelect?: () => void
}) {
  const t = useT()
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
        'relative flex items-start gap-3 rounded-md border bg-bg py-3 pr-2 pl-3',
        isDragging
          ? 'z-2 border-primary shadow-e3'
          : selected ? 'z-1 border-primary bg-primary-bg shadow-none' : 'z-1 border-border shadow-none',
      )}
    >
      {readOnly ? null : <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t('trips.stops.dragHandle', { name: stop.name })}
        className={cn(
          'mt-1.5 grid size-5 flex-none place-items-center text-text-disabled',
          'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>}

      {onSelect ? (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={t('trips.stops.filter', { number: stopNumber, name: stop.name })}
          onClick={onSelect}
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <StopBody stop={stop} />
        </button>
      ) : (
        <span className="flex min-w-0 flex-1 items-start gap-3"><StopBody stop={stop} /></span>
      )}

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

/** Số màu định danh, tên, địa chỉ và số kiện · khối lượng của điểm — thân thẻ, nằm trong nút lọc khi có. */
function StopBody({ stop }: { stop: StopRow }) {
  const t = useT()
  const format = useFormat()
  const stopNumber = stop.number
  return (
    <>
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

      {/* Tên và địa chỉ xuống tối đa hai dòng, không cắt ngang ở cột thông tin hẹp (LM-095) */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-2 text-body font-medium">
          <span className="sr-only">{t('trips.stops.numberLabel', { number: stopNumber })} </span>
          {stop.name}
        </span>
        <span className="line-clamp-2 text-caption text-text-3">{stop.address}</span>
        <span className="font-mono text-caption text-text-2">
          <span className="font-medium text-text">{format.integer(stop.packageCount)}</span>{' '}
          <span className="font-sans">{t('trips.stops.packagesUnit')}</span> · {format.weight(stop.weightKg)}
        </span>
      </span>
    </>
  )
}
