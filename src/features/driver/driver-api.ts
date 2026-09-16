import { getMockDb } from '@/lib/mock-db'
import { pickDriverPlan, type DriverPlan } from './driver-plan'

/**
 * Lớp dữ liệu của màn tài xế (LM-061): nơi duy nhất trong `features/driver` biết về kho. Nối backend thật chỉ thay thân hàm.
 * Tài xế chỉ đọc revision đã duyệt (D-14); `null` khi chuyến được chọn (hoặc mọi chuyến) chưa có bản duyệt.
 */
export async function fetchDriverPlan(tripId?: string): Promise<DriverPlan | null> {
  const db = getMockDb()
  const trips = (await db.listTrips()).filter((trip) => tripId === undefined || trip.id === tripId)
  const plans = await Promise.all(trips.map(async (trip) => ({ trip, revisions: await db.listRevisions(trip.id) })))
  return pickDriverPlan(plans, tripId) ?? null
}
