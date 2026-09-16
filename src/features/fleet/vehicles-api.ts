import type { VehicleConfig } from '@/domain/models'
import { getMockDb } from '@/lib/mock-db'

/**
 * Lớp gọi API cho Đội xe (D-06). Backend Spring Boot chưa có nên mọi lượt đọc/ghi đi qua kho mock
 * dùng chung (`@/lib/mock-db`), đã có độ trễ giả và trả `MockDbError` cho lỗi nghiệp vụ. Khi nối API
 * thật chỉ thay thân các hàm ở đây; hook Query và component không đổi.
 *
 * Component không gọi trực tiếp file này (AGENTS mục 9) — đi qua `useVehiclesQuery` và các hook cùng thư mục.
 */

export function fetchVehicles(): Promise<VehicleConfig[]> {
  return getMockDb().listVehicles()
}

export function fetchVehicle(id: string): Promise<VehicleConfig> {
  return getMockDb().getVehicle(id)
}

/** Xe chưa có mã (`id` rỗng) là xe mới: kho cấp mã `VEHICLE-NNN` kế tiếp. */
export function saveVehicle(vehicle: VehicleConfig): Promise<VehicleConfig> {
  const { id, ...input } = vehicle
  return id === '' ? getMockDb().createVehicle(input) : getMockDb().updateVehicle(vehicle)
}

export function deleteVehicle(id: string): Promise<void> {
  return getMockDb().deleteVehicle(id)
}
