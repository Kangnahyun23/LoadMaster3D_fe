import { expandPackages } from '@/domain/cargo'
import type { TripStatus } from '@/types/trip'
import { isStale } from './revisions'
import type { Revision, Trip, TripPhase } from './types'

/** Pha xe đang bận (D-53): kho đang xếp, đã xếp xong chờ chạy, đang giao. */
const ACTIVE_PHASES: readonly TripPhase[] = ['loading', 'loaded', 'delivering']

export function isActivePhase(phase: TripPhase): boolean {
  return ACTIVE_PHASES.includes(phase)
}

/** Từ khi kho bắt đầu xếp, xe, điểm giao và kiện của chuyến bị khoá (D-45). */
export function isLockedPhase(phase: TripPhase): boolean {
  return phase !== 'planning'
}

/** Huỷ được trước khi xe rời kho (D-45). */
export function isCancellablePhase(phase: TripPhase): boolean {
  return phase === 'planning' || phase === 'loading' || phase === 'loaded'
}

/** Bản đã duyệt mới nhất; `revisions` theo thứ tự kho trả (cũ trước). */
export function latestApproved<R extends Pick<Revision, 'approvedAt'>>(revisions: readonly R[]): R | undefined {
  return revisions.findLast((revision) => revision.approvedAt !== undefined)
}

/**
 * Trạng thái hiển thị của chuyến (D-45): pha vận hành do kho lưu; riêng pha `planning` suy từ revision như trước —
 * chưa có revision là Nháp; revision hiển thị (bản duyệt mới nhất, không có thì bản mới nhất) lỗi thời là Cần xem lại;
 * đã duyệt là Đã duyệt; còn lại Đã tối ưu.
 */
export function tripStatus(
  trip: Pick<Trip, 'phase' | 'inputVersion'>,
  revisions: readonly Pick<Revision, 'approvedAt' | 'inputVersion'>[],
): TripStatus {
  switch (trip.phase) {
    case 'cancelled': return 'da_huy'
    case 'completed': return 'hoan_thanh'
    case 'delivering': return 'dang_giao'
    case 'loaded': return 'da_xep_xong'
    case 'loading': return 'dang_xep_hang'
    case 'planning': break
  }
  const shown = latestApproved(revisions) ?? revisions.at(-1)
  if (!shown) return 'nhap'
  if (isStale(shown, trip)) return 'can_xem_lai'
  return shown.approvedAt !== undefined ? 'da_duyet' : 'da_toi_uu'
}

/** Kiện đã xếp trong phương án: mã instance → số điểm giao. */
export function plannedStops(revision: Pick<Revision, 'request' | 'result'>): Map<string, number> {
  const stopById = new Map(expandPackages(revision.request.packages).instances.map((i) => [i.packageInstanceId, i.deliveryStop]))
  const planned = new Map<string, number>()
  for (const { packageInstanceId } of revision.result.placements) {
    const stop = stopById.get(packageInstanceId)
    if (stop !== undefined) planned.set(packageInstanceId, stop)
  }
  return planned
}

/** Kiện kho báo thiếu (không có trên xe). */
export function missingIds(trip: Pick<Trip, 'loading'>): Set<string> {
  return new Set(trip.loading?.steps.filter((step) => step.outcome === 'missing').map((step) => step.packageInstanceId))
}

/** Số kiện của phương án chưa có kết quả xếp ở kho. */
export function loadingRemaining(trip: Pick<Trip, 'loading'>, revision: Pick<Revision, 'request' | 'result'>): number {
  const recorded = new Set(trip.loading?.steps.map((step) => step.packageInstanceId))
  return [...plannedStops(revision).keys()].filter((id) => !recorded.has(id)).length
}

/** Kiện phải dỡ ở điểm `stopNumber`: kiện đã xếp của phương án thuộc điểm đó, trừ kiện kho báo thiếu. */
export function stopItemIds(trip: Pick<Trip, 'loading'>, revision: Pick<Revision, 'request' | 'result'>, stopNumber: number): string[] {
  const missing = missingIds(trip)
  return [...plannedStops(revision)].filter(([id, stop]) => stop === stopNumber && !missing.has(id)).map(([id]) => id)
}
