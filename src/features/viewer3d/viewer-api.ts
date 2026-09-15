import { getMockDb, type Revision, type Trip } from '@/lib/mock-db'

export type PlanSource = { readonly trip: Trip; readonly revision: Revision }

/**
 * Lớp dữ liệu của Planner (LM-030): nơi duy nhất trong `viewer3d` biết về kho. Nối backend thật chỉ thay thân hàm.
 *
 * Chọn revision: `jobId` cho trước thì lấy revision mới nhất của job đó (bản đã duyệt dùng chung `jobId` với bản nguồn nên
 * bản đã duyệt thắng); không có thì lấy revision đã duyệt mới nhất, rồi tới revision mới nhất. Chuyến chưa có revision nào
 * trả `revision: undefined` để màn hiện trạng thái rỗng thay vì phương án giả.
 */
export async function fetchPlanSource(tripId: string, jobId?: string): Promise<{ trip: Trip; revision?: Revision }> {
  const db = getMockDb()
  const [trip, revisions] = await Promise.all([db.getTrip(tripId), db.listRevisions(tripId)])
  const newestFirst = revisions.toReversed()
  const revision = jobId
    ? newestFirst.find((item) => item.jobId === jobId)
    : (newestFirst.find((item) => item.approvedAt !== undefined) ?? newestFirst[0])
  return { trip, revision }
}
