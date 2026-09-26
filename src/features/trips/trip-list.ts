import { expandPackages } from '@/domain/cargo'
import type { VehicleConfig } from '@/domain/models'
import { compareText, isWithinDateRange, matchesQuery } from '@/lib/list-filter'
import { latestApproved, tripStatus, type Revision, type Trip, type TripPhase } from '@/lib/mock-db'
import type { TripStatus } from '@/types/trip'
import type { User } from '@/types/user'

/** Một dòng danh sách chuyến (LM-053, LM-088): mọi giá trị lấy từ kho — chuyến, xe, tài xế và revision. */
export type TripRow = {
  readonly id: string
  readonly name: string
  /** Ngày chạy `YYYY-MM-DD` (D-46). */
  readonly scheduledDate: string
  readonly vehicleId: string
  readonly vehicleName: string
  readonly driverId: string | null
  /** `null` khi chưa gán tài xế (hoặc tài khoản không còn trong kho). */
  readonly driverName: string | null
  /** Tên điểm giao theo thứ tự giao */
  readonly route: string
  /** Số kiện sau khi mở rộng `quantity` */
  readonly packageCount: number
  /** Số điểm giao của chuyến */
  readonly stopCount: number
  /** Tỷ lệ thể tích của revision Planner mở mặc định; `null` khi chưa tối ưu */
  readonly volumePercent: number | null
  readonly status: TripStatus
  readonly phase: TripPhase
}

/**
 * `revisions` theo thứ tự kho trả (cũ trước). Trạng thái là `tripStatus` của kho (D-45): pha vận hành, riêng pha lập kế hoạch
 * suy từ revision. Lấp đầy lấy từ revision Planner mở mặc định: bản đã duyệt mới nhất, không có thì bản mới nhất.
 */
export function tripRow(
  trip: Trip,
  vehicle: Pick<VehicleConfig, 'name'> | undefined,
  revisions: readonly Revision[],
  driver?: Pick<User, 'fullName'>,
): TripRow {
  const shown = latestApproved(revisions) ?? revisions.at(-1)
  return {
    id: trip.id,
    name: trip.name,
    scheduledDate: trip.scheduledDate,
    vehicleId: trip.vehicleId,
    vehicleName: vehicle?.name ?? '',
    driverId: trip.driverId,
    driverName: driver?.fullName ?? null,
    route: trip.stops.map((stop) => stop.name).join(' → '),
    packageCount: expandPackages(trip.packages).instances.length,
    stopCount: trip.stops.length,
    volumePercent: shown ? shown.result.metrics.volumeUtilizationPercent : null,
    status: tripStatus(trip, revisions),
    phase: trip.phase,
  }
}

/** Tham số lọc của danh sách chuyến trên URL (D-52), ngoài `q`, `sap-xep`, `trang`, `so-dong` chung. */
export const TRIP_LIST_FILTERS = ['trang-thai', 'tu', 'den', 'xe', 'tai-xe'] as const

export type TripListFilter = (typeof TRIP_LIST_FILTERS)[number]

/** Giá trị lọc "chuyến chưa gán tài xế" của tham số `tai-xe`. */
export const UNASSIGNED_DRIVER = 'chua-gan'

/** Trạng thái chọn được ở bộ lọc, theo vòng đời chuyến. `dang_toi_uu` chỉ có khi đang chạy job nên không lọc theo nó. */
export const FILTERABLE_STATUSES: readonly TripStatus[] = [
  'nhap', 'da_toi_uu', 'da_duyet', 'can_xem_lai', 'dang_xep_hang', 'da_xep_xong', 'dang_giao', 'hoan_thanh', 'da_huy',
]

/**
 * Nhóm trạng thái của ô số liệu trên đầu danh sách (V2). Giá trị `trang-thai` trên URL là một trạng thái đơn hoặc slug của nhóm:
 * - đang thực hiện: kho đang/đã xếp hoặc tài xế đang giao;
 * - cần xem phương án: đã tối ưu chờ duyệt, hoặc cần xem lại vì dữ liệu đổi sau khi tối ưu.
 */
export const TRIP_STATUS_GROUPS = {
  active: ['dang_xep_hang', 'da_xep_xong', 'dang_giao'],
  review: ['da_toi_uu', 'can_xem_lai'],
} as const satisfies Record<string, readonly TripStatus[]>

export type TripStatusGroup = keyof typeof TRIP_STATUS_GROUPS

/** Slug nhóm trên URL, tiếng Việt không dấu như mọi tham số màn danh sách (D-52). */
export const TRIP_STATUS_GROUP_SLUGS = {
  active: 'dang-thuc-hien',
  review: 'can-xem-phuong-an',
} as const satisfies Record<TripStatusGroup, string>

function matchesStatus(status: TripStatus, filter: string): boolean {
  if (filter === '') return true
  const group = (Object.keys(TRIP_STATUS_GROUP_SLUGS) as TripStatusGroup[]).find((key) => TRIP_STATUS_GROUP_SLUGS[key] === filter)
  return group ? (TRIP_STATUS_GROUPS[group] as readonly TripStatus[]).includes(status) : status === filter
}

/** Số của ba ô số liệu: mọi chuyến (kể cả đã huỷ) và từng nhóm — đếm trên cả danh sách, không theo ô tìm. */
export function tripStatusGroupCounts(rows: readonly TripRow[]): { total: number } & Record<TripStatusGroup, number> {
  const count = (group: TripStatusGroup) => rows.filter((row) => matchesStatus(row.status, TRIP_STATUS_GROUP_SLUGS[group])).length
  return { total: rows.length, active: count('active'), review: count('review') }
}

/**
 * Lọc dòng theo từ khoá và bộ lọc của URL: tìm bỏ dấu trên mã, tên, tuyến, xe, tài xế; trạng thái hoặc nhóm trạng thái, khoảng
 * ngày chạy (tính hai đầu), xe và tài xế (`UNASSIGNED_DRIVER` là chưa gán). Giá trị rỗng là không lọc.
 */
export function filterTripRows(
  rows: readonly TripRow[],
  query: string,
  filters: Readonly<Record<TripListFilter, string>>,
): TripRow[] {
  const { 'trang-thai': status, tu: from, den: to, xe: vehicleId, 'tai-xe': driverId } = filters
  return rows.filter((row) =>
    matchesQuery([row.id, row.name, row.route, row.vehicleName, row.driverName], query)
    && matchesStatus(row.status, status)
    && isWithinDateRange(row.scheduledDate, from, to)
    && (vehicleId === '' || row.vehicleId === vehicleId)
    && (driverId === '' || (driverId === UNASSIGNED_DRIVER ? row.driverId === null : row.driverId === driverId)))
}

export type FilterOption = { readonly value: string; readonly label: string }

/** Xe và tài xế có trong danh sách, sắp theo tên tiếng Việt — lựa chọn của bộ lọc không bao giờ dẫn tới bảng rỗng vô cớ. */
export function tripFilterOptions(rows: readonly TripRow[]): { vehicles: FilterOption[]; drivers: FilterOption[] } {
  const vehicles = new Map<string, string>()
  const drivers = new Map<string, string>()
  for (const row of rows) {
    vehicles.set(row.vehicleId, row.vehicleName || row.vehicleId)
    if (row.driverId !== null) drivers.set(row.driverId, row.driverName ?? row.driverId)
  }
  const sorted = (entries: Map<string, string>) =>
    [...entries].map(([value, label]) => ({ value, label })).sort((a, b) => compareText(a.label, b.label))
  return { vehicles: sorted(vehicles), drivers: sorted(drivers) }
}
