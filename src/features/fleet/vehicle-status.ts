import type { VehicleConfig } from '@/domain/models'
import { matchesQuery } from '@/lib/list-filter'
import type { VehicleState, VehicleStatus } from '@/lib/mock-db'

/** Thứ tự hiển thị và thứ tự khi sắp xếp theo trạng thái: sẵn sàng trước, bảo dưỡng sau cùng. */
export const VEHICLE_STATUSES = ['available', 'in_use', 'maintenance'] as const satisfies readonly VehicleStatus[]

/** Giá trị bộ lọc `trang-thai` trên URL, tiếng Việt không dấu như mọi tham số của màn danh sách (D-52). */
export const VEHICLE_STATUS_SLUGS = {
  available: 'san-sang',
  in_use: 'dang-chay',
  maintenance: 'bao-duong',
} as const satisfies Record<VehicleStatus, string>

/** Một dòng của bảng đội xe: cấu hình xe kèm trạng thái của kho (D-53, trạng thái lưu ngoài `VehicleConfig` theo D-04). */
export type VehicleRow = VehicleConfig & { readonly state: VehicleState }

export function statusFromSlug(slug: string): VehicleStatus | null {
  return VEHICLE_STATUSES.find((status) => VEHICLE_STATUS_SLUGS[status] === slug) ?? null
}

export function statusRank(status: VehicleStatus): number {
  return VEHICLE_STATUSES.indexOf(status)
}

/**
 * Ghép xe với trạng thái theo mã. Xe không có trong danh sách trạng thái (vừa tạo, trạng thái chưa đọc lại) là Sẵn sàng:
 * xe mới chưa chạy chuyến nào và chưa ai đặt bảo dưỡng.
 */
export function vehicleRows(vehicles: readonly VehicleConfig[], states: readonly VehicleState[]): VehicleRow[] {
  const byId = new Map(states.map((state) => [state.vehicleId, state]))
  return vehicles.map((vehicle) => ({
    ...vehicle,
    state: byId.get(vehicle.id) ?? { vehicleId: vehicle.id, status: 'available' },
  }))
}

/**
 * Tìm bỏ dấu theo tên xe (có biển số), mã xe, chuyến đang chạy và ghi chú bảo dưỡng; lọc theo slug trạng thái. Slug rỗng
 * hoặc lạ (URL sửa tay) là không lọc.
 */
export function filterVehicleRows(rows: readonly VehicleRow[], query: string, statusSlug: string): VehicleRow[] {
  const status = statusFromSlug(statusSlug)
  return rows.filter((row) => (status === null || row.state.status === status)
    && matchesQuery([row.name, row.id, row.state.tripId, row.state.maintenance?.note], query))
}
