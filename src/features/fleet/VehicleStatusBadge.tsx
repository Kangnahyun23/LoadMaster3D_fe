import type { MouseEvent } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { useT } from '@/lib/i18n'
import type { VehicleState, VehicleStatus } from '@/lib/mock-db'

type BadgeTone = 'success' | 'cyan' | 'warning'

/** Tông badge theo trạng thái xe; chấm cho trạng thái đang diễn ra (mục 4 style sheet, như trạng thái chuyến). */
const TONE: Record<VehicleStatus, { tone: BadgeTone; dot?: boolean }> = {
  available: { tone: 'success' },
  in_use: { tone: 'cyan', dot: true },
  maintenance: { tone: 'warning' },
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const t = useT()
  const spec = TONE[status]
  return <Badge tone={spec.tone} dot={spec.dot}>{t(`fleet.status.${status}`)}</Badge>
}

/** Liên kết trong dòng bảng: không để cú bấm lan lên dòng (dòng cũng mở trang khi bấm). */
function stopRowClick(event: MouseEvent) {
  event.stopPropagation()
}

/**
 * Ô trạng thái ở danh sách đội xe (LM-089): badge, kèm mã chuyến đang chạy (liên kết tới chuyến) hoặc ghi chú bảo dưỡng
 * (cắt bớt, đủ câu ở `title` và ở trang cấu hình xe).
 */
export function VehicleStatusCell({ state }: { state: VehicleState }) {
  const note = state.maintenance?.note
  return (
    <span className="flex min-w-0 items-center gap-2">
      <VehicleStatusBadge status={state.status} />
      {state.status === 'in_use' && state.tripId ? (
        <Link
          to={`/chuyen/${state.tripId}`}
          onClick={stopRowClick}
          className="rounded-sm font-mono text-caption font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {state.tripId}
        </Link>
      ) : null}
      {state.status === 'maintenance' && note ? (
        <span className="min-w-0 truncate text-caption text-text-2" title={note}>{note}</span>
      ) : null}
    </span>
  )
}
