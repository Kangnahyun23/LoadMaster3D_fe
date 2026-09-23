import { Activity, ClipboardCheck, Truck } from 'lucide-react'
import { KpiTile } from '@/components/KpiTile'
import { useFormat, useT } from '@/lib/i18n'
import { TRIP_STATUS_GROUP_SLUGS, tripStatusGroupCounts, type TripRow, type TripStatusGroup } from './trip-list'

/**
 * Ba ô số liệu trên đầu Danh sách chuyến (V2), đếm trên cả danh sách (không theo ô tìm). Hai ô nhóm là công tắc lọc: đi qua cùng
 * tham số `trang-thai` với ô chọn trạng thái (giá trị là slug nhóm), bấm lại ô đang lọc thì bỏ lọc. Tint theo nghĩa cố định:
 * ngữ cảnh → xám xanh, vận hành → xanh dương, cần chú ý → hổ phách (AGENTS mục 4).
 */
export function TripSummary({ trips, status, onStatusChange }: {
  trips: readonly TripRow[]
  status: string
  onStatusChange: (value: string) => void
}) {
  const t = useT()
  const format = useFormat()
  const counts = tripStatusGroupCounts(trips)
  const groupTile = (group: TripStatusGroup) => {
    const slug = TRIP_STATUS_GROUP_SLUGS[group]
    const pressed = status === slug
    return { pressed, onPress: () => onStatusChange(pressed ? '' : slug), value: format.integer(counts[group]) }
  }

  return (
    <div className="grid flex-none grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiTile icon={Truck} tone="slate" label={t('trips.list.summary.total')} value={format.integer(counts.total)} note={t('trips.list.summary.totalNote')} />
      <KpiTile icon={Activity} tone="blue" label={t('trips.list.summary.active')} note={t('trips.list.summary.activeNote')} {...groupTile('active')} />
      <KpiTile icon={ClipboardCheck} tone="amber" label={t('trips.list.summary.review')} note={t('trips.list.summary.reviewNote')} {...groupTile('review')} />
    </div>
  )
}
