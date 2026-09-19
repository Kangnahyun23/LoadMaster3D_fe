import type { AuditDirectory } from '@/features/admin/audit-log'
import { getMockDb, vnDate, type AuditEvent } from '@/lib/mock-db'
import { notificationWindowStart, selectNotifications, type NotificationViewer } from './notifications'

/**
 * Lớp gọi API của chuông thông báo (LM-098) — nơi duy nhất của chuông biết về kho. Kho lọc nhật ký theo ngày, phần còn lại lọc ngay
 * sau khi nhận (`selectNotifications`). Nối backend thật chỉ thay thân hàm.
 */
export type NotificationFeed = {
  readonly events: readonly AuditEvent[]
  /** Tên hiện tại của chuyến, người dùng để đọc đối tượng của thông báo; đối tượng đã xoá không có ở đây. */
  readonly directory: AuditDirectory
}

export async function fetchNotifications(viewer: NotificationViewer, now = new Date()): Promise<NotificationFeed> {
  const db = getMockDb()
  const [events, trips, users] = await Promise.all([
    db.listEvents({ from: vnDate(notificationWindowStart(now)) }),
    db.listTrips(),
    db.listUsers(),
  ])
  return {
    events: selectNotifications(events, viewer, now),
    directory: {
      trips: new Map(trips.map((trip) => [trip.id, trip.name])),
      users: new Map(users.map((user) => [user.id, user.fullName])),
      // Không vai trò nào nhận thông báo về xe
      vehicles: new Map(),
    },
  }
}
