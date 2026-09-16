import { expandPackages } from '@/domain/cargo'
import { roundKg } from '@/domain/geometry'
import type { VehicleConfig } from '@/domain/models'
import type { Revision, Trip } from '@/lib/mock-db'

/** Số kế hoạch gần đây hiện trên bảng điều khiển (LM-052). */
export const RECENT_PLAN_LIMIT = 5

/**
 * Một lần tối ưu đã lưu, rút gọn cho bảng điều khiển. Mọi trường lấy thẳng từ revision của kho —
 * không có số nào do màn tự nghĩ ra (tiêu chí nghiệm thu LM-052).
 */
export type DashboardPlan = {
  revisionId: string
  jobId: string
  tripId: string
  /** Tên chuyến trong kho; rỗng nếu chuyến đã bị xoá khỏi kho. */
  tripName: string
  method: string
  status: 'COMPLETED' | 'FAILED'
  isMockResult: boolean
  approved: boolean
  /** ISO 8601, thời điểm tạo revision đang hiển thị. */
  createdAt: string
  volumeUtilizationPercent: number
  payloadUtilizationPercent: number
  placedCount: number
  unplacedCount: number
  runtimeMs: number
}

export type DashboardSummary = {
  vehicleCount: number
  tripCount: number
  /** Số kiện vật lý: đã mở rộng `quantity` thành instance (`expandPackages`). */
  packageCount: number
  /** Tổng khối lượng hàng của mọi chuyến, kg đã làm tròn bội 0,01. */
  totalWeightKg: number
  /** Job mới nhất trong kho, không có revision nào thì vắng. */
  latestPlan?: DashboardPlan
  /** Tối đa `RECENT_PLAN_LIMIT` job, mới nhất trước. */
  recentPlans: DashboardPlan[]
}

export type DashboardInput = {
  vehicles: readonly VehicleConfig[]
  trips: readonly Trip[]
  /** Revision của mọi chuyến, thứ tự nào cũng được. */
  revisions: readonly Revision[]
}

/**
 * Gộp số liệu bảng điều khiển từ dữ liệu kho (D-06). Hàm thuần, không đọc kho: `dashboard-api.ts` lấy dữ liệu,
 * hàm này chỉ tính.
 *
 * Một job có thể có hai revision (bản tối ưu và bản đã duyệt dùng chung `jobId`, D-31) nên danh sách gộp theo
 * `jobId` và giữ revision mới nhất của job, để "5 kế hoạch gần đây" là 5 lần tối ưu chứ không phải 5 bản ghi.
 */
export function deriveDashboardSummary({ vehicles, trips, revisions }: DashboardInput): DashboardSummary {
  const tripNameById = new Map(trips.map((trip) => [trip.id, trip.name]))
  let packageCount = 0
  let totalWeightKg = 0
  for (const trip of trips) {
    for (const instance of expandPackages(trip.packages).instances) {
      packageCount += 1
      totalWeightKg += instance.weightKg
    }
  }

  const newestByJobId = new Map<string, Revision>()
  for (const revision of revisions) {
    const kept = newestByJobId.get(revision.jobId)
    if (kept === undefined || isNewer(revision, kept)) newestByJobId.set(revision.jobId, revision)
  }
  const plans = [...newestByJobId.values()]
    .sort((a, b) => (isNewer(a, b) ? -1 : 1))
    .map((revision) => toPlan(revision, tripNameById))

  return {
    vehicleCount: vehicles.length,
    tripCount: trips.length,
    packageCount,
    totalWeightKg: roundKg(totalWeightKg),
    latestPlan: plans[0],
    recentPlans: plans.slice(0, RECENT_PLAN_LIMIT),
  }
}

/** Mới hơn theo `createdAt`; cùng thời điểm thì mã revision lớn hơn là mới hơn (kho cấp mã tăng dần). */
function isNewer(revision: Revision, other: Revision): boolean {
  return revision.createdAt === other.createdAt
    ? revision.id > other.id
    : revision.createdAt > other.createdAt
}

function toPlan(revision: Revision, tripNameById: ReadonlyMap<string, string>): DashboardPlan {
  const { result } = revision
  return {
    revisionId: revision.id,
    jobId: revision.jobId,
    tripId: revision.tripId,
    tripName: tripNameById.get(revision.tripId) ?? '',
    method: result.method,
    status: result.status,
    isMockResult: result.isMockResult,
    approved: revision.approvedAt !== undefined,
    createdAt: revision.createdAt,
    volumeUtilizationPercent: result.metrics.volumeUtilizationPercent,
    payloadUtilizationPercent: result.metrics.payloadUtilizationPercent,
    placedCount: result.metrics.placedCount,
    unplacedCount: result.metrics.unplacedCount,
    runtimeMs: result.metrics.runtimeMs,
  }
}
