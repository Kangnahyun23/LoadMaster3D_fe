import { isStale, type Revision, type Trip } from '@/lib/mock-db'

type TripLike = Pick<Trip, 'id' | 'inputVersion'>
type RevisionLike = Pick<Revision, 'inputVersion' | 'approvedAt'>

/** Một chuyến và các revision của nó theo thứ tự tạo của kho (cũ trước). */
export type TripRevisions<T extends TripLike, R extends RevisionLike> = { trip: T; revisions: readonly R[] }

export type WarehousePlanSelection<T extends TripLike, R extends RevisionLike> = {
  trip: T
  revision: R
  /** Xe hoặc kiện đã đổi sau lần tối ưu (D-31): vẫn hiện, kèm cảnh báo. */
  stale: boolean
}

/**
 * Phương án kho làm theo (LM-060): bản đã duyệt mới nhất của chuyến `tripId`; không chỉ định thì chuyến đầu tiên theo thứ tự
 * kho có bản đã duyệt. Chuyến chỉ định chưa có bản duyệt thì `null` — không lấy chuyến khác thay, kẻo xếp nhầm chuyến.
 */
export function selectWarehousePlan<T extends TripLike, R extends RevisionLike>(
  entries: readonly TripRevisions<T, R>[],
  tripId?: string,
): WarehousePlanSelection<T, R> | null {
  const candidates = tripId === undefined ? entries : entries.filter(({ trip }) => trip.id === tripId)
  for (const { trip, revisions } of candidates) {
    const revision = revisions.findLast((item) => item.approvedAt !== undefined)
    if (revision) return { trip, revision, stale: isStale(revision, trip) }
  }
  return null
}
