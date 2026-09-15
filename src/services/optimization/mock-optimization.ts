import type { PackageInstance } from '@/domain/cargo'
import { createConstraintEngine, createPlacementLayout, createStackGraph, recomputeOrders } from '@/domain/constraints'
import { computeMetrics } from '@/domain/metrics'
import type { OptimizationRequest, OptimizationResult, PackagePlacement } from '@/domain/models'
import { preflight } from './mock-preflight'
import type { OptimizationProgress } from './OptimizationService'
import { packShelves } from './shelf-packer'

export type MockRunOptions = {
  /** Đồng hồ ms cho `runtimeMs`; test truyền đồng hồ giả để kết quả tất định. */
  readonly clock?: () => number
  readonly onProgress?: (progress: OptimizationProgress) => void
}

/** FNV-1a 32 bit: băm tất định, đủ cho `jobId` và phá hoà theo seed. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

function volumeCm3({ lengthCm, widthCm, heightCm }: PackageInstance): number {
  return lengthCm * widthCm * heightCm
}

/** Thứ tự xếp: `mustLoad` trước, `priority` cao, điểm giao muộn (xếp sâu), thể tích lớn; hoà thì theo seed, rồi mã. */
function packingOrder(instances: readonly PackageInstance[], seed: number): PackageInstance[] {
  const tieBreak = (instance: PackageInstance) => fnv1a(`${seed}:${instance.packageInstanceId}`)
  return instances.toSorted(
    (a, b) =>
      Number(b.mustLoad) - Number(a.mustLoad) ||
      b.priority - a.priority ||
      b.deliveryStop - a.deliveryStop ||
      volumeCm3(b) - volumeCm3(a) ||
      tieBreak(a) - tieBreak(b) ||
      (a.packageInstanceId < b.packageInstanceId ? -1 : 1),
  )
}

/**
 * Mock optimization thuần (Spec mục 11, LM-024) — chạy được trong worker và trong test, cùng request + seed cho cùng kết quả.
 * Kiểm request (`preflight`), xếp kệ (`packShelves`), rồi dùng domain cho phần còn lại: thứ tự xếp/dỡ (LM-022),
 * `supportRatio`/`constraintWarnings` (engine LM-023), metrics (LM-021). Luôn `isMockResult: true`, `method: 'MOCK'`.
 */
export function runMockOptimization(request: OptimizationRequest, { clock = () => performance.now(), onProgress }: MockRunOptions = {}): OptimizationResult {
  const startedAt = clock()
  const seed = request.settings?.randomSeed ?? 0
  const jobId = `MOCK-${seed}-${fnv1a(JSON.stringify(request)).toString(16).padStart(8, '0')}`
  const checked = preflight(request)
  const weights = new Map(checked.instances.map((instance) => [instance.packageInstanceId, instance.weightKg]))

  if (!checked.ok) {
    const unplacedPackages = checked.instances.map(({ packageInstanceId }) => ({ packageInstanceId, reasonCode: 'UNKNOWN' as const, message: 'UNKNOWN' }))
    return {
      jobId,
      status: 'FAILED',
      method: 'MOCK',
      isMockResult: true,
      placements: [],
      unplacedPackages,
      metrics: failedMetrics(request, unplacedPackages.length, clock() - startedAt),
    }
  }

  const { vehicle, packages, settings } = request
  const packed = packShelves({
    vehicle,
    instances: packingOrder(checked.instances, seed),
    reasons: checked.reasons,
    lowCenterOfGravity: settings.prioritizeLowCenterOfGravity,
    onProgress,
  })
  const instances = new Map(checked.instances.map((instance) => [instance.packageInstanceId, instance]))
  const graph = createStackGraph(createPlacementLayout(vehicle, packed.placements), instances)
  const { orders } = recomputeOrders(graph, new Map(checked.instances.map((instance) => [instance.packageInstanceId, instance.deliveryStop])))
  const ordered = packed.placements.map((placement): PackagePlacement => ({ ...placement, ...orders.get(placement.packageInstanceId) }))
  const evaluation = createConstraintEngine({ vehicle, packages, placements: ordered, settings }).evaluateAll()
  const placements = ordered.map(
    (placement): PackagePlacement => ({
      ...placement,
      supportRatio: evaluation.supportRatioById.get(placement.packageInstanceId) ?? 1,
      constraintWarnings: [...new Set((evaluation.byInstanceId.get(placement.packageInstanceId) ?? []).map(({ code }) => code))],
    }),
  )
  return {
    jobId,
    status: 'COMPLETED',
    method: 'MOCK',
    isMockResult: true,
    placements,
    unplacedPackages: packed.unplaced,
    metrics: computeMetrics({
      vehicle,
      placements,
      weightByInstanceId: weights,
      unplacedCount: packed.unplaced.length,
      runtimeMs: clock() - startedAt,
    }),
  }
}

/** Request sai thì có thể không tính được thể tích xe: metric về 0, chỉ giữ số kiện chưa xếp và thời gian chạy. */
function failedMetrics(request: OptimizationRequest, unplacedCount: number, runtimeMs: number): OptimizationResult['metrics'] {
  const { innerLengthCm = 0, innerWidthCm = 0, innerHeightCm = 0, maxPayloadKg = 0 } = request.vehicle ?? {}
  const volume = innerLengthCm * innerWidthCm * innerHeightCm
  return {
    totalVehicleVolumeCm3: Number.isFinite(volume) ? volume : 0,
    usedVolumeCm3: 0,
    volumeUtilizationPercent: 0,
    maxPayloadKg: Number.isFinite(maxPayloadKg) ? maxPayloadKg : 0,
    usedPayloadKg: 0,
    payloadUtilizationPercent: 0,
    placedCount: 0,
    unplacedCount,
    runtimeMs,
  }
}
