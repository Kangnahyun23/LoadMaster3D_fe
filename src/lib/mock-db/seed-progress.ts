import type { AuditAction, AuditTargetType } from './audit'
import { addDays, vnTime } from './clock'
import { plannedStops } from './operations'
import type { TripSpec } from './seed-trips'
import type { DeliveryIssue, DeliveryProgress, LoadingProgress, Revision, Trip } from './types'

/** Một sự kiện seed chưa đánh mã: `seed.ts` sắp theo thời điểm rồi cấp `EV-…`. */
export type SeedEvent = {
  at: string
  actorId: string | null
  action: AuditAction
  target: { type: AuditTargetType; id: string }
  params?: Record<string, string | number>
}

const addSeconds = (iso: string, seconds: number) => new Date(Date.parse(iso) + seconds * 1000).toISOString()

/** Thời gian xếp một kiện trong seed. */
const STEP_SECONDS = 30

/** Kiện của phương án theo `loadingOrder` — thứ tự kho làm. */
function loadingSequence(revision: Revision): string[] {
  return revision.result.placements.toSorted((a, b) => a.loadingOrder - b.loadingOrder).map((p) => p.packageInstanceId)
}

/** Kiện của điểm giao theo `unloadingOrder`, trừ kiện kho báo thiếu. */
function unloadSequence(revision: Revision, stopNumber: number, missing: ReadonlySet<string>): string[] {
  const stops = plannedStops(revision)
  return revision.result.placements
    .filter((p) => stops.get(p.packageInstanceId) === stopNumber && !missing.has(p.packageInstanceId))
    .toSorted((a, b) => a.unloadingOrder - b.unloadingOrder)
    .map((p) => p.packageInstanceId)
}

/**
 * Tiến độ xếp: kho bắt đầu 05:30 ngày chạy (chuyến hôm nay 04:45), mỗi kiện 30 giây. `loading` chỉ ghi `loadedSteps` bước đầu;
 * `missingAtStep` là kiện báo thiếu.
 */
export function seedLoading(spec: TripSpec, today: string, approved: Revision, events: SeedEvent[]): LoadingProgress {
  const day = addDays(today, spec.day)
  const startedAt = vnTime(day, spec.day === 0 ? '04:45' : '05:30')
  const sequence = loadingSequence(approved)
  const count = spec.outcome === 'loading' ? (spec.loadedSteps ?? 0) : sequence.length
  const steps = sequence.slice(0, count).map((packageInstanceId, index) => ({
    packageInstanceId,
    outcome: index + 1 === spec.missingAtStep ? ('missing' as const) : ('loaded' as const),
    at: addSeconds(startedAt, (index + 1) * STEP_SECONDS),
  }))
  const target = { type: 'trip' as const, id: spec.id }
  events.push({ at: startedAt, actorId: spec.warehouseId, action: 'loading.started', target, params: { revisionId: approved.id } })
  for (const step of steps.filter((item) => item.outcome === 'missing')) {
    events.push({ at: step.at, actorId: spec.warehouseId, action: 'loading.missing', target, params: { packageInstanceId: step.packageInstanceId } })
  }
  if (spec.outcome === 'loading') return { revisionId: approved.id, startedAt, startedBy: spec.warehouseId, steps }
  const completedAt = addSeconds(startedAt, (steps.length + 1) * STEP_SECONDS)
  const missing = steps.filter((step) => step.outcome === 'missing').length
  events.push({ at: completedAt, actorId: spec.warehouseId, action: 'loading.completed', target, params: { loaded: steps.length - missing, missing } })
  return { revisionId: approved.id, startedAt, startedBy: spec.warehouseId, completedAt, steps }
}

/**
 * Tiến độ giao: xuất phát 20 phút sau khi kho xếp xong (nhật ký giữ đúng thứ tự xếp xong → xuất phát), mỗi điểm hoàn tất sau 70 phút.
 * Điểm đang giao dỡ được nửa số kiện.
 * Hàng hỏng vẫn tính đã dỡ; khách từ chối thì không dỡ.
 */
export function seedDelivery(spec: TripSpec, trip: Trip, approved: Revision, events: SeedEvent[]): DeliveryProgress {
  const loadedAt = trip.loading?.completedAt
  if (loadedAt === undefined) throw new Error(`Chuyến seed ${spec.id} giao hàng khi kho chưa xếp xong`)
  const startedAt = addSeconds(loadedAt, 20 * 60)
  const missing = new Set(trip.loading?.steps.filter((step) => step.outcome === 'missing').map((step) => step.packageInstanceId))
  const done = spec.outcome === 'delivering' ? (spec.stopsDone ?? 0) : trip.stops.length
  const actor = spec.driverId
  const target = { type: 'trip' as const, id: spec.id }
  events.push({ at: startedAt, actorId: actor, action: 'delivery.started', target })
  const issues: DeliveryIssue[] = []
  const stops = trip.stops.map((_, index) => {
    const number = index + 1
    const items = unloadSequence(approved, number, missing)
    const completedAt = addSeconds(startedAt, number * 70 * 60)
    for (const issueSpec of spec.issues?.filter((issue) => issue.stop === number) ?? []) {
      const packageInstanceId = issueSpec.pick === 'first' ? items[0] : items.at(-1)
      const at = addSeconds(completedAt, -10 * 60)
      issues.push({ id: `ISS-${String(issues.length + 1).padStart(3, '0')}`, stopNumber: number, kind: issueSpec.kind, note: issueSpec.note, at, reportedBy: actor, ...(packageInstanceId ? { packageInstanceId } : {}) })
      events.push({ at, actorId: actor, action: 'delivery.issue', target, params: { kind: issueSpec.kind, stopNumber: number, ...(packageInstanceId ? { packageInstanceId } : {}) } })
    }
    const refused = new Set(issues.filter((issue) => issue.stopNumber === number && issue.kind !== 'damaged').map((issue) => issue.packageInstanceId))
    if (number <= done) {
      events.push({ at: completedAt, actorId: actor, action: 'delivery.stopCompleted', target, params: { stopNumber: number } })
      return { number, unloadedIds: items.filter((id) => !refused.has(id)), completedAt }
    }
    // Điểm đang giao: đã dỡ nửa số kiện; điểm sau chưa dỡ gì
    return { number, unloadedIds: number === done + 1 ? items.slice(0, Math.floor(items.length / 2)) : [] }
  })
  if (done < trip.stops.length) return { startedAt, startedBy: actor, stops, issues }
  const completedAt = stops.at(-1)?.completedAt ?? startedAt
  events.push({ at: completedAt, actorId: actor, action: 'delivery.completed', target, params: { stops: stops.length, issues: issues.length } })
  return { startedAt, startedBy: actor, completedAt, stops, issues }
}
