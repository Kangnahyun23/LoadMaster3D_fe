import { getMockDb } from '@/lib/mock-db'
import type { Revision } from '@/lib/mock-db'
import { deriveDashboardSummary, type DashboardSummary } from './dashboard-summary'

/**
 * Lớp dữ liệu của bảng điều khiển (mục 9): nơi duy nhất trong `manager` biết về kho. Nối backend thật chỉ thay
 * thân hàm — hook và component giữ nguyên.
 *
 * Kho chưa có hàm liệt kê revision toàn hệ thống nên đọc theo từng chuyến rồi gộp lại; backend thật sẽ trả sẵn.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const db = getMockDb()
  const [vehicles, trips] = await Promise.all([db.listVehicles(), db.listTrips()])
  const revisions: Revision[] = (await Promise.all(trips.map((trip) => db.listRevisions(trip.id)))).flat()
  return deriveDashboardSummary({ vehicles, trips, revisions })
}
