import { latestApproved, missingIds, plannedStops, tripStatus, type Revision, type Trip } from '@/lib/mock-db'
import type { TripStatus } from '@/types/trip'

/** Trạng thái chuyến hiện ở danh sách kho (D-46): đang xếp, chờ xếp, và bản duyệt lỗi thời chờ điều phối viên duyệt lại. */
export type WarehouseTripStatus = Extract<TripStatus, 'dang_xep_hang' | 'da_duyet' | 'can_xem_lai'>

/** Một chuyến và các revision của nó theo thứ tự kho trả (cũ trước). */
export type TripRevisions = { readonly trip: Trip; readonly revisions: readonly Revision[] }

export type WarehouseTripRow = {
  readonly id: string
  readonly name: string
  /** Ngày chạy `YYYY-MM-DD`. */
  readonly scheduledDate: string
  /** Tên xe (có biển số); xe không còn trong kho thì là mã xe. */
  readonly vehicleName: string
  readonly status: WarehouseTripStatus
  /** Kiện của phương án kho xếp theo. */
  readonly total: number
  /** Kiện đã có kết quả ở kho: đã xếp hoặc báo thiếu. */
  readonly recorded: number
  readonly missing: number
}

/**
 * Đường dẫn phiên xếp của một chuyến. Nút thoát của phiên truyền nó làm `screenHome`: khác màn chính `/kho` nên nhân viên kho thoát
 * là về danh sách chuyến, không đăng xuất (`exitAction`).
 */
export function loadingSessionPath(tripId: string): string {
  return `/kho?chuyen=${encodeURIComponent(tripId)}`
}

/** Đang xếp trước (làm tiếp cho xong), rồi chờ xếp, cuối cùng chuyến đang chặn chờ duyệt lại. */
const STATUS_ORDER: Readonly<Record<WarehouseTripStatus, number>> = { dang_xep_hang: 0, da_duyet: 1, can_xem_lai: 2 }

function isWarehouseStatus(status: TripStatus): status is WarehouseTripStatus {
  return status in STATUS_ORDER
}

/**
 * Phương án kho xếp theo (D-47): bản duyệt được ghi lúc bắt đầu xếp; chưa bắt đầu thì bản duyệt mới nhất. Không có bản duyệt
 * thì `undefined` — kho không xếp theo bản chưa duyệt.
 */
export function warehousePlan<R extends Pick<Revision, 'id' | 'approvedAt'>>(trip: Pick<Trip, 'loading'>, revisions: readonly R[]): R | undefined {
  const startedWith = trip.loading?.revisionId
  return startedWith === undefined ? latestApproved(revisions) : revisions.find((revision) => revision.id === startedWith)
}

/**
 * Danh sách chuyến của màn kho (LM-086, D-46): chuyến đã duyệt chờ xếp, đang xếp, và chuyến có bản duyệt lỗi thời (hiện để kho biết
 * nhưng không bắt đầu được). Chuyến lỗi thời mà chưa từng có bản duyệt thì không có gì để xếp nên không hiện.
 */
export function warehouseTripRows(entries: readonly TripRevisions[], vehicleNames: ReadonlyMap<string, string>): WarehouseTripRow[] {
  const rows: WarehouseTripRow[] = []
  for (const { trip, revisions } of entries) {
    const status = tripStatus(trip, revisions)
    const plan = warehousePlan(trip, revisions)
    if (!plan || !isWarehouseStatus(status)) continue
    rows.push({
      id: trip.id,
      name: trip.name,
      scheduledDate: trip.scheduledDate,
      vehicleName: vehicleNames.get(trip.vehicleId) ?? trip.vehicleId,
      status,
      total: plannedStops(plan).size,
      recorded: trip.loading?.steps.length ?? 0,
      missing: missingIds(trip).size,
    })
  }
  return rows.toSorted((a, b) =>
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.scheduledDate.localeCompare(b.scheduledDate) || a.id.localeCompare(b.id))
}
