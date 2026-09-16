import { getMockDb, type Revision, type Trip } from '@/lib/mock-db'
import { selectWarehousePlan, type WarehousePlanSelection } from './select-plan'

export type WarehousePlan = WarehousePlanSelection<Trip, Revision>

/**
 * Lớp dữ liệu của màn kho (LM-060): nơi duy nhất trong `warehouse` biết về kho dữ liệu. Nối backend thật chỉ thay thân hàm.
 * Kho chỉ đọc revision **đã duyệt** (D-31); chưa có thì `null` để màn hiện trạng thái rỗng, không dựng phương án giả.
 */
export async function fetchWarehousePlan(tripId?: string): Promise<WarehousePlan | null> {
  const db = getMockDb()
  const trips = await db.listTrips()
  const wanted = tripId === undefined ? trips : trips.filter((trip) => trip.id === tripId)
  const entries = await Promise.all(wanted.map(async (trip) => ({ trip, revisions: await db.listRevisions(trip.id) })))
  return selectWarehousePlan(entries, tripId)
}
