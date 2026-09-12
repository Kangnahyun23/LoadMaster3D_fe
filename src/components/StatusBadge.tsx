import { Badge } from '@/components/ui/Badge'
import type { TripStatus } from '@/types/trip'

type StatusSpec = {
  label: string
  tone: 'neutral' | 'info' | 'cyan' | 'success' | 'warning' | 'danger'
  /** Chấm 6px cho trạng thái đang diễn ra */
  dot?: boolean
}

/** Bảng trạng thái lấy nguyên từ mục 4 style sheet. */
const STATUS: Record<TripStatus, StatusSpec> = {
  nhap: { label: 'Nháp', tone: 'neutral' },
  dang_toi_uu: { label: 'Đang tối ưu', tone: 'info', dot: true },
  da_toi_uu: { label: 'Đã tối ưu', tone: 'info' },
  da_duyet: { label: 'Đã duyệt', tone: 'success' },
  dang_xep_hang: { label: 'Đang xếp hàng', tone: 'cyan', dot: true },
  da_xep_xong: { label: 'Đã xếp xong', tone: 'success' },
  dang_giao: { label: 'Đang giao', tone: 'cyan', dot: true },
  hoan_thanh: { label: 'Hoàn thành', tone: 'success' },
  can_xem_lai: { label: 'Cần xem lại', tone: 'warning' },
  da_huy: { label: 'Đã huỷ', tone: 'danger' },
}

export function StatusBadge({ status }: { status: TripStatus }) {
  const spec = STATUS[status]
  return (
    <Badge tone={spec.tone} dot={spec.dot}>
      {spec.label}
    </Badge>
  )
}

export { STATUS as TRIP_STATUS }
