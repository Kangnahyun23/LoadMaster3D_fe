import { expandPackages } from '@/domain/cargo'
import { applyPose, createPlacementLayout, createStackGraph, recomputeOrders, type PlacementPatch } from '@/domain/constraints'
import { computeMetrics } from '@/domain/metrics'
import type { OptimizationRequest, OptimizationResult } from '@/domain/models'
import { MockDbError } from './errors'
import type { Revision, Trip } from './types'

/** Revision lỗi thời khi xe hoặc kiện của chuyến đã đổi sau khi tạo nó (D-31): chặn Duyệt. Hai tham số phải cùng một chuyến. */
export function isStale(revision: Pick<Revision, 'inputVersion'>, trip: Pick<Trip, 'inputVersion'>): boolean {
  return revision.inputVersion !== trip.inputVersion
}

/**
 * Kết quả của revision approved (D-31, D-32), dựng mới, không sửa `request`/`result` nguồn:
 * 1. áp từng patch bằng `applyPose`, kích thước kiện lấy từ instance của `expandPackages(request.packages)`;
 * 2. tính lại `loadingOrder`/`unloadingOrder` bằng `recomputeOrders` trên đồ thị đỡ của placement đã áp draft, thuộc tính xếp chồng và
 *    điểm giao lấy từ instance;
 * 3. tính lại `metrics` bằng `computeMetrics`.
 *
 * Các trường khác giữ nguyên, gồm `isMockResult`. `supportRatio` và `constraintWarnings` của placement giữ giá trị nguồn cho tới khi
 * Duyệt gọi được constraint engine (LM-023).
 */
export function approvedResult(
  request: OptimizationRequest,
  result: OptimizationResult,
  patches: readonly PlacementPatch[],
): OptimizationResult {
  const { instances } = expandPackages(request.packages)
  const instanceById = new Map(instances.map((instance) => [instance.packageInstanceId, instance]))
  const placementById = new Map(result.placements.map((placement) => [placement.packageInstanceId, placement]))
  for (const patch of patches) {
    const placement = placementById.get(patch.packageInstanceId)
    const instance = instanceById.get(patch.packageInstanceId)
    // Editor không tạo placement cho kiện chưa xếp: patch chỉ được chỉnh kiện đã có trong kết quả
    if (placement === undefined || instance === undefined) {
      throw new MockDbError('PATCH_UNKNOWN_INSTANCE', { packageInstanceId: patch.packageInstanceId })
    }
    placementById.set(patch.packageInstanceId, applyPose(placement, patch, instance))
  }
  // Map giữ thứ tự chèn: placement vẫn theo thứ tự của kết quả nguồn
  const patched = [...placementById.values()]
  const graph = createStackGraph(createPlacementLayout(request.vehicle, patched), instanceById)
  const deliveryStops = new Map(instances.map(({ packageInstanceId, deliveryStop }) => [packageInstanceId, deliveryStop]))
  const { orders } = recomputeOrders(graph, deliveryStops)
  const placements = patched.map((placement) => ({ ...placement, ...orders.get(placement.packageInstanceId) }))
  const metrics = computeMetrics({
    vehicle: request.vehicle,
    placements,
    weightByInstanceId: new Map(instances.map(({ packageInstanceId, weightKg }) => [packageInstanceId, weightKg])),
    unplacedCount: result.unplacedPackages.length,
    // Thời gian chạy là của lần tối ưu, Duyệt không chạy lại service
    runtimeMs: result.metrics.runtimeMs,
  })
  return { ...result, placements, metrics }
}
