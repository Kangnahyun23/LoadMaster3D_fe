import type { CargoPackage, VehicleConfig } from '@/domain/models'
import { getMockDb, type DeliveryStop, type Trip } from '@/lib/mock-db'
import { TRIPS, type TripSummary } from './trip-list.mock'
import { duplicatePackage, renumberDeliveryStops, stopRemoval, type StopRemoval } from './trip-packages'

/**
 * Lớp gọi API cho chuyến hàng và kiện (LM-043). Chi tiết chuyến, điểm giao và kiện đọc/ghi qua mock repository
 * (`@/lib/mock-db`, D-06); nối backend thật chỉ thay thân hàm, hook và component giữ nguyên.
 *
 * Danh sách chuyến vẫn là dữ liệu mẫu của màn danh sách (trạng thái, ngày, kho) — kho chưa lưu các trường đó.
 */

const NETWORK_DELAY_MS = 900

export async function fetchTrips({ empty = false }: { empty?: boolean } = {}): Promise<TripSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return empty ? [] : TRIPS
}

export type TripDetail = { readonly trip: Trip; readonly vehicle: VehicleConfig }

/** Chuyến kèm cấu hình xe đang gán — hai thứ luôn đi cùng nhau ở màn chi tiết và màn thiết lập tối ưu. */
export async function fetchTripDetail(tripId: string): Promise<TripDetail> {
  const db = getMockDb()
  const trip = await db.getTrip(tripId)
  return { trip, vehicle: await db.getVehicle(trip.vehicleId) }
}

export async function fetchPackages(tripId: string): Promise<CargoPackage[]> {
  return (await getMockDb().getTrip(tripId)).packages
}

/** Đổi thứ tự điểm giao: kiện được đánh số `deliveryStop` lại theo vị trí mới (LM-046). */
export async function updateTripStops(tripId: string, stops: readonly DeliveryStop[]): Promise<Trip> {
  const db = getMockDb()
  const current = await db.getTrip(tripId)
  const packages = renumberDeliveryStops(current.packages, current.stops, stops)
  return db.updateTrip(tripId, { stops: [...stops], packages: [...packages] })
}

/** Xoá điểm giao; còn kiện thì không ghi gì và trả về số kiện bị ảnh hưởng để UI báo. */
export async function removeTripStop(tripId: string, stopId: string): Promise<StopRemoval> {
  const db = getMockDb()
  const current = await db.getTrip(tripId)
  const removal = stopRemoval(current.packages, current.stops, stopId)
  if (!removal.allowed) return removal
  await db.updateTrip(tripId, { stops: [...removal.stops], packages: [...removal.packages] })
  return removal
}

export async function setTripVehicle(tripId: string, vehicleId: string): Promise<Trip> {
  return getMockDb().updateTrip(tripId, { vehicleId })
}

/** Thêm kiện mới hoặc thay kiện cùng mã; kiện đổi thì `inputVersion` tăng và revision cũ thành lỗi thời (D-31). */
export async function savePackage(tripId: string, pkg: CargoPackage): Promise<Trip> {
  const db = getMockDb()
  const { packages } = await db.getTrip(tripId)
  const index = packages.findIndex((item) => item.id === pkg.id)
  const next = index === -1 ? [...packages, pkg] : packages.with(index, pkg)
  return db.updateTrip(tripId, { packages: next })
}

export async function deletePackage(tripId: string, packageId: string): Promise<Trip> {
  const db = getMockDb()
  const { packages } = await db.getTrip(tripId)
  return db.updateTrip(tripId, { packages: packages.filter((item) => item.id !== packageId) })
}

/** Nhân bản kiện (D-33): mã mới lấy theo mã lớn nhất đang có, bản sao nằm ngay sau bản gốc. */
export async function duplicateTripPackage(tripId: string, packageId: string): Promise<CargoPackage> {
  const db = getMockDb()
  const { packages } = await db.getTrip(tripId)
  const index = packages.findIndex((item) => item.id === packageId)
  const source = packages[index]
  if (!source) throw new Error(`Chuyến ${tripId} không có kiện ${packageId}`)
  const copy = duplicatePackage(source, packages.map((item) => item.id))
  await db.updateTrip(tripId, { packages: packages.toSpliced(index + 1, 0, copy) })
  return copy
}
