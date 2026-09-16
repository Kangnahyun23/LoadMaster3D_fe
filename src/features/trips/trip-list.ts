import { expandPackages } from '@/domain/cargo'
import type { VehicleConfig } from '@/domain/models'
import { isStale, type Revision, type Trip } from '@/lib/mock-db'
import type { TripStatus } from '@/types/trip'

/** Một dòng danh sách chuyến (LM-053): mọi giá trị lấy từ kho, không có ngày hay trạng thái giao hàng bịa ra. */
export type TripRow = {
  readonly id: string
  readonly name: string
  readonly vehicleName: string
  /** Tên điểm giao theo thứ tự giao */
  readonly route: string
  readonly stopCount: number
  /** Số kiện sau khi mở rộng `quantity` */
  readonly packageCount: number
  /** Tỷ lệ thể tích của revision Planner mở mặc định; `null` khi chưa tối ưu */
  readonly volumePercent: number | null
  readonly status: Extract<TripStatus, 'nhap' | 'da_toi_uu' | 'da_duyet' | 'can_xem_lai'>
}

/**
 * `revisions` theo thứ tự kho trả (cũ trước). Revision hiển thị cùng quy tắc Planner: bản đã duyệt mới nhất, rồi bản mới nhất.
 * Trạng thái: chưa có revision → Nháp; revision hiển thị lỗi thời → Cần xem lại; đã duyệt → Đã duyệt; còn lại → Đã tối ưu.
 */
export function tripRow(trip: Trip, vehicle: Pick<VehicleConfig, 'name'> | undefined, revisions: readonly Revision[]): TripRow {
  const newestFirst = revisions.toReversed()
  const shown = newestFirst.find((revision) => revision.approvedAt !== undefined) ?? newestFirst[0]
  const status: TripRow['status'] = !shown ? 'nhap'
    : isStale(shown, trip) ? 'can_xem_lai'
      : shown.approvedAt !== undefined ? 'da_duyet' : 'da_toi_uu'
  return {
    id: trip.id,
    name: trip.name,
    vehicleName: vehicle?.name ?? '',
    route: trip.stops.map((stop) => stop.name).join(' → '),
    stopCount: trip.stops.length,
    packageCount: expandPackages(trip.packages).instances.length,
    volumePercent: shown ? shown.result.metrics.volumeUtilizationPercent : null,
    status,
  }
}
