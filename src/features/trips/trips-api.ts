import type { CargoPackage, VehicleConfig } from '@/domain/models'
import { getMockDb, type DeliveryStop, type Revision, type Trip } from '@/lib/mock-db'
import { tripRow, type TripRow } from './trip-list'
import { duplicatePackage, renumberDeliveryStops, stopRemoval, type StopRemoval } from './trip-packages'

/**
 * Lớp gọi API cho chuyến hàng và kiện (LM-043). Chi tiết chuyến, điểm giao và kiện đọc/ghi qua mock repository
 * (`@/lib/mock-db`, D-06); nối backend thật chỉ thay thân hàm, hook và component giữ nguyên.
 */

/** Danh sách chuyến (LM-053): mỗi dòng dựng từ chuyến, xe và revision trong kho. */
export async function fetchTrips(): Promise<TripRow[]> {
  const db = getMockDb()
  const [trips, vehicles] = await Promise.all([db.listTrips(), db.listVehicles()])
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]))
  const revisions = await Promise.all(trips.map((trip) => db.listRevisions(trip.id)))
  return trips.map((trip, index) => tripRow(trip, vehicleById.get(trip.vehicleId), revisions[index] ?? []))
}

export type TripFrame = { readonly name: string; readonly vehicleId: string; readonly stops: readonly Pick<DeliveryStop, 'name' | 'address'>[] }

/** Tạo chuyến: kho cấp mã chuyến; điểm giao nhận mã `STOP-NN` theo thứ tự nhập, chưa có kiện. */
export async function createTrip({ name, vehicleId, stops }: TripFrame): Promise<Trip> {
  return getMockDb().createTrip({
    name, vehicleId, packages: [],
    stops: stops.map((stop, index) => ({ id: `STOP-${String(index + 1).padStart(2, '0')}`, name: stop.name, address: stop.address })),
  })
}

/** Sửa khung chuyến: tên và xe. Đổi xe làm revision cũ lỗi thời (D-31). */
export async function updateTripFrame(tripId: string, { name, vehicleId }: Pick<TripFrame, 'name' | 'vehicleId'>): Promise<Trip> {
  return getMockDb().updateTrip(tripId, { name, vehicleId })
}

/** Xe chọn được khi tạo/sửa chuyến. */
export async function fetchVehicleOptions(): Promise<VehicleConfig[]> {
  return getMockDb().listVehicles()
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

export type TripRevisions = { readonly trip: Trip; readonly revisions: Revision[] }

/** Chuyến kèm mọi revision đã lưu, cũ trước — màn So sánh phương án cần `inputVersion` của chuyến để biết bản lỗi thời (LM-051). */
export async function fetchTripRevisions(tripId: string): Promise<TripRevisions> {
  const db = getMockDb()
  const [trip, revisions] = await Promise.all([db.getTrip(tripId), db.listRevisions(tripId)])
  return { trip, revisions }
}
