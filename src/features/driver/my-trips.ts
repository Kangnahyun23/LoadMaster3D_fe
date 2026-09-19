import { latestApproved, missingIds, plannedStops, tripStatus, type Revision, type Trip } from '@/lib/mock-db'
import type { TripStatus } from '@/types/trip'
import type { User } from '@/types/user'

/** Một chuyến và các revision của nó theo thứ tự kho trả (cũ trước). */
export type TripRevisions = { readonly trip: Trip; readonly revisions: readonly Revision[] }

export type MyTripRow = {
  readonly id: string
  readonly name: string
  /** Ngày chạy `YYYY-MM-DD`. */
  readonly scheduledDate: string
  /** Tên xe (có biển số); xe không còn trong kho thì là mã xe. */
  readonly vehicleName: string
  readonly status: TripStatus
  readonly stopCount: number
  /** Kiện của phương án trừ kiện kho báo thiếu — số kiện trên xe (hoặc sẽ lên xe). */
  readonly packageCount: number
  /** Kiện kho đã có kết quả xếp (đã xếp hoặc thiếu) và tổng kiện của phương án. */
  readonly loadingRecorded: number
  readonly loadingTotal: number
  /** Đang giao: điểm chưa hoàn tất đầu tiên. */
  readonly currentStop: number | undefined
  /** Hoàn thành: thời điểm giao xong (ISO 8601). */
  readonly completedAt: string | undefined
  readonly issueCount: number
}

export type MyTrips = {
  /** Đã xếp xong hoặc đang giao — tài xế mở được. */
  readonly ready: readonly MyTripRow[]
  /** Đã duyệt hoặc kho đang xếp — hiện để tài xế biết, chưa mở được. */
  readonly preparing: readonly MyTripRow[]
  /** Hoàn thành gần đây, mới nhất trước. */
  readonly recent: readonly MyTripRow[]
}

/** Số chuyến hoàn thành gần đây hiện ở danh sách. */
export const RECENT_LIMIT = 5

/** Tài xế chỉ thấy chuyến gán cho mình; quản trị viên (vai trò khác có quyền mở màn tài xế) thấy mọi chuyến (D-46). */
export function isVisibleTo(trip: Pick<Trip, 'driverId'>, viewer: Pick<User, 'id' | 'role'>): boolean {
  return viewer.role !== 'driver' || trip.driverId === viewer.id
}

/** Phương án tài xế làm theo: bản kho đã xếp (chốt lúc bắt đầu xếp); kho chưa bắt đầu thì bản duyệt mới nhất. */
export function driverPlan<R extends Pick<Revision, 'id' | 'approvedAt'>>(trip: Pick<Trip, 'loading'>, revisions: readonly R[]): R | undefined {
  const loadedWith = trip.loading?.revisionId
  return loadedWith === undefined ? latestApproved(revisions) : revisions.find((revision) => revision.id === loadedWith)
}

const READY: readonly TripStatus[] = ['dang_giao', 'da_xep_xong']
const PREPARING: readonly TripStatus[] = ['dang_xep_hang', 'da_duyet']

function row(trip: Trip, plan: Revision, status: TripStatus, vehicleNames: ReadonlyMap<string, string>): MyTripRow {
  const total = plannedStops(plan).size
  return {
    id: trip.id,
    name: trip.name,
    scheduledDate: trip.scheduledDate,
    vehicleName: vehicleNames.get(trip.vehicleId) ?? trip.vehicleId,
    status,
    stopCount: trip.stops.length,
    packageCount: total - missingIds(trip).size,
    loadingRecorded: trip.loading?.steps.length ?? 0,
    loadingTotal: total,
    currentStop: trip.delivery?.stops.find((stop) => stop.completedAt === undefined)?.number,
    completedAt: trip.delivery?.completedAt,
    issueCount: trip.delivery?.issues.length ?? 0,
  }
}

/** Nhóm theo thứ tự trong `order` (đang làm trước), rồi ngày chạy sớm trước, rồi mã chuyến. */
function byStatusThenDate(order: readonly TripStatus[]) {
  return (a: MyTripRow, b: MyTripRow) =>
    order.indexOf(a.status) - order.indexOf(b.status) || a.scheduledDate.localeCompare(b.scheduledDate) || a.id.localeCompare(b.id)
}

/**
 * "Chuyến của tôi" (LM-087): chuyến người xem được thấy, chia ba nhóm. Chuyến đang lập kế hoạch (chưa duyệt, lỗi thời) và chuyến đã
 * huỷ không hiện — tài xế không làm gì được với chúng.
 */
export function myTrips(entries: readonly TripRevisions[], vehicleNames: ReadonlyMap<string, string>, viewer: Pick<User, 'id' | 'role'>): MyTrips {
  const ready: MyTripRow[] = []
  const preparing: MyTripRow[] = []
  const recent: MyTripRow[] = []
  for (const { trip, revisions } of entries) {
    if (!isVisibleTo(trip, viewer)) continue
    const plan = driverPlan(trip, revisions)
    if (!plan) continue
    const status = tripStatus(trip, revisions)
    if (READY.includes(status)) ready.push(row(trip, plan, status, vehicleNames))
    else if (PREPARING.includes(status)) preparing.push(row(trip, plan, status, vehicleNames))
    else if (status === 'hoan_thanh') recent.push(row(trip, plan, status, vehicleNames))
  }
  return {
    ready: ready.toSorted(byStatusThenDate(READY)),
    preparing: preparing.toSorted(byStatusThenDate(PREPARING)),
    recent: recent.toSorted((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')).slice(0, RECENT_LIMIT),
  }
}
