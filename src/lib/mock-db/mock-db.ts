import { MockDbError, type MockDbCollection } from './errors'
import { approvedResult, isStale } from './revisions'
import { seedRevisions } from './seed-revisions'
import { seedTrip } from './seed-trip'
import { seedVehicles } from './seed-vehicles'
import type { MockDb, MockDbOptions, Revision } from './types'

/** Bản ghi `id`, hoặc lỗi `NOT_FOUND`. */
function found<T>(table: ReadonlyMap<string, T>, collection: MockDbCollection, id: string): T {
  const record = table.get(id)
  if (record === undefined) throw new MockDbError('NOT_FOUND', { collection, id })
  return record
}

/** Ghi bản sao của `record`: nơi gọi sửa object của mình sau đó không đổi dữ liệu trong kho. */
function put<T extends { id: string }>(table: Map<string, T>, record: T): T {
  const stored = structuredClone(record)
  table.set(stored.id, stored)
  return stored
}

/**
 * Mã mới dạng `PREFIX-NNN` (tối thiểu 3 chữ số): số lớn nhất trong các mã cùng dạng cộng 1, tất định. Mã khác dạng
 * (`TRIP-2026-0914`) không được tính và cũng không bao giờ trùng mã sinh ra.
 */
function nextId(prefix: string, ids: Iterable<string>): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  const numbers = [...ids].map((id) => Number(pattern.exec(id)?.[1] ?? 0))
  return `${prefix}-${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`
}

/** JSON với khoá object sắp theo tên: hai dữ liệu cùng nội dung cho cùng chuỗi dù khoá khác thứ tự; khoá mang `undefined` coi như vắng. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, field: unknown) =>
    field !== null && typeof field === 'object' && !Array.isArray(field)
      ? Object.fromEntries(Object.entries(field).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : field,
  )
}

/** Cùng nội dung: lưu lại form không đổi gì thì không làm revision lỗi thời. */
function sameData(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b)
}

/** Tạo một kho mới đã nạp seed. Mỗi kho giữ dữ liệu riêng. */
export function createMockDb({ latencyMs = 0 }: MockDbOptions = {}): MockDb {
  const vehicles = new Map(seedVehicles().map((vehicle) => [vehicle.id, vehicle]))
  const trips = new Map([seedTrip()].map((trip) => [trip.id, trip]))
  const revisions = new Map<string, Revision>(seedRevisions().map((revision) => [revision.id, revision]))

  /**
   * Một lượt gọi như qua mạng: chờ `latencyMs` rồi mới đọc/ghi. Kết quả luôn là bản sao, nên nơi gọi không sửa được dữ liệu
   * trong kho; lỗi của `operation` thành promise bị từ chối.
   */
  async function respond<T>(operation: () => T): Promise<T> {
    if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
    return structuredClone(operation())
  }

  return {
    listVehicles: () => respond(() => [...vehicles.values()]),
    getVehicle: (id) => respond(() => found(vehicles, 'vehicles', id)),
    createVehicle: (input) => respond(() => put(vehicles, { ...input, id: nextId('VEHICLE', vehicles.keys()) })),
    updateVehicle: (vehicle) =>
      respond(() => {
        if (!sameData(vehicle, found(vehicles, 'vehicles', vehicle.id))) {
          // Xe là một phần đầu vào tối ưu của mọi chuyến đang dùng nó
          for (const trip of trips.values()) {
            if (trip.vehicleId === vehicle.id) put(trips, { ...trip, inputVersion: trip.inputVersion + 1 })
          }
        }
        return put(vehicles, vehicle)
      }),
    deleteVehicle: (id) =>
      respond(() => {
        found(vehicles, 'vehicles', id)
        const tripIds = [...trips.values()].filter((trip) => trip.vehicleId === id).map((trip) => trip.id)
        if (tripIds.length > 0) throw new MockDbError('VEHICLE_IN_USE', { vehicleId: id, tripIds })
        vehicles.delete(id)
      }),

    listTrips: () => respond(() => [...trips.values()]),
    getTrip: (id) => respond(() => found(trips, 'trips', id)),
    createTrip: ({ name, vehicleId, stops, packages }) =>
      respond(() => {
        found(vehicles, 'vehicles', vehicleId)
        return put(trips, { id: nextId('TRIP', trips.keys()), name, vehicleId, stops, packages, inputVersion: 1 })
      }),
    updateTrip: (id, changes) =>
      respond(() => {
        const current = found(trips, 'trips', id)
        // Chỉ nhận các trường sửa được: `id` và `inputVersion` trong một bản sao cũ bị trải vào `changes` không được ghi đè
        const { name = current.name, vehicleId = current.vehicleId, stops = current.stops, packages = current.packages } = changes
        found(vehicles, 'vehicles', vehicleId)
        const inputChanged = vehicleId !== current.vehicleId || !sameData(packages, current.packages)
        const inputVersion = current.inputVersion + (inputChanged ? 1 : 0)
        return put(trips, { id, name, vehicleId, stops, packages, inputVersion })
      }),

    listRevisions: (tripId) =>
      respond(() => {
        found(trips, 'trips', tripId)
        return [...revisions.values()].filter((revision) => revision.tripId === tripId)
      }),
    getRevision: (id) => respond(() => found(revisions, 'revisions', id)),
    addRevision: ({ tripId, request, result }) =>
      respond(() => {
        const trip = found(trips, 'trips', tripId)
        return put(revisions, {
          id: nextId('REV', revisions.keys()),
          jobId: result.jobId,
          tripId,
          request,
          result,
          inputVersion: trip.inputVersion,
          createdAt: new Date().toISOString(),
          manuallyEdited: false,
          ordersRecomputed: false,
        })
      }),
    approveRevision: (revisionId, patches) =>
      respond(() => {
        const source = found(revisions, 'revisions', revisionId)
        if (isStale(source, found(trips, 'trips', source.tripId))) throw new MockDbError('REVISION_STALE', { revisionId })
        if (source.result.status !== 'COMPLETED') throw new MockDbError('REVISION_NOT_COMPLETED', { revisionId })
        const approvedAt = new Date().toISOString()
        return put(revisions, {
          ...source,
          id: nextId('REV', revisions.keys()),
          result: approvedResult(source.request, source.result, patches),
          createdAt: approvedAt,
          draftPatches: [...patches],
          approvedAt,
          sourceRevisionId: source.id,
          // Duyệt lại một bản đã chỉnh tay mà không có draft mới vẫn là kết quả đã chỉnh tay
          manuallyEdited: source.manuallyEdited || patches.length > 0,
          ordersRecomputed: true,
        })
      }),
  }
}
