import { Badge } from '@/components/ui/Badge'
import { useT } from '@/lib/i18n'
import type { TripStatus } from '@/types/trip'

type StatusSpec = {
  tone: 'neutral' | 'info' | 'cyan' | 'success' | 'warning' | 'danger'
  /** Chấm 6px cho trạng thái đang diễn ra */
  dot?: boolean
}

/** Bảng trạng thái lấy nguyên từ mục 4 style sheet. Nhãn nằm ở nhánh `status` của từ điển (LM-070). */
const STATUS: Record<TripStatus, StatusSpec> = {
  nhap: { tone: 'neutral' },
  dang_toi_uu: { tone: 'info', dot: true },
  da_toi_uu: { tone: 'info' },
  da_duyet: { tone: 'success' },
  dang_xep_hang: { tone: 'cyan', dot: true },
  da_xep_xong: { tone: 'success' },
  dang_giao: { tone: 'cyan', dot: true },
  hoan_thanh: { tone: 'success' },
  can_xem_lai: { tone: 'warning' },
  da_huy: { tone: 'danger' },
}

/** `className` đè cỡ của badge, ví dụ bản 16px cho màn cảm ứng kho và tài xế (mục 10). */
export function StatusBadge({ status, className }: { status: TripStatus; className?: string }) {
  const t = useT()
  const spec = STATUS[status]
  return (
    <Badge tone={spec.tone} dot={spec.dot} className={className}>
      {t(`status.${status}`)}
    </Badge>
  )
}

export { STATUS as TRIP_STATUS }
