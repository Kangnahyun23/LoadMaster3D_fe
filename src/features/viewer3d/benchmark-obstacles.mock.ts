import { gt, overlapArea2D } from '@/domain/geometry'
import { SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import { computeMetrics } from '@/domain/metrics'
import { obstacleToBox, placementToBox, type VehicleObstacle } from '@/domain/models'
import type { BenchmarkInput } from './benchmark.mock'

export const BENCHMARK_OBSTACLE_COUNTS = [0, 1, 20] as const
export type BenchmarkObstacleCount = (typeof BENCHMARK_OBSTACLE_COUNTS)[number]

/** `?debug&packages=N&obstacles=0|1|20` — chỉ để đo draw call của vật cản (LM-033); thiếu `debug` thì bỏ qua. */
export function benchmarkObstacleCountFromSearch(search: string): BenchmarkObstacleCount | undefined {
  const params = new URLSearchParams(search)
  if (!params.has('debug') || !params.has('obstacles')) return undefined
  const count = Number(params.get('obstacles'))
  return BENCHMARK_OBSTACLE_COUNTS.find((allowed) => allowed === count)
}

const TYPES: readonly VehicleObstacle['type'][] = ['WHEEL_ARCH', 'COOLING_UNIT', 'PARTITION', 'RESERVED_ZONE']
const SLOT_START_CM = 20
const SLOT_STEP_CM = 70
const DEPTH_CM = 25

/**
 * 1 vật cản: đúng hốc bánh mẫu Spec (góc 0,0,0 · 120 × 30 × 45 cm, không chịu tải).
 * 20 vật cản: mười ô dọc mỗi vách, đủ bốn loại, có vật cản chịu tải, đều nằm trong lòng thùng 720 × 235 × 240 cm.
 */
export function benchmarkObstacles(count: BenchmarkObstacleCount, vehicle: BenchmarkInput['request']['vehicle']): VehicleObstacle[] {
  if (count === 0) return []
  if (count === 1) return SPEC_TRUCK_6M.obstacles.map((obstacle) => structuredClone(obstacle))
  return Array.from({ length: count }, (_, index): VehicleObstacle => {
    const wall = index % 2
    const slot = Math.floor(index / 2)
    const type = TYPES[(slot + wall) % TYPES.length] ?? 'WHEEL_ARCH'
    const heightCm = type === 'PARTITION' ? 60 : type === 'RESERVED_ZONE' ? 45 : 30
    const bearing = type === 'PARTITION'
    return {
      id: `BENCH-OBS-${String(index + 1).padStart(2, '0')}`,
      type,
      xCm: SLOT_START_CM + slot * SLOT_STEP_CM,
      yCm: wall === 0 ? 0 : vehicle.innerWidthCm - DEPTH_CM,
      zCm: type === 'COOLING_UNIT' ? vehicle.innerHeightCm - heightCm : 0,
      lengthCm: type === 'PARTITION' ? 5 : 30,
      widthCm: DEPTH_CM,
      heightCm,
      loadBearing: bearing,
      ...(bearing ? { maxTopLoadKg: 50 } : {}),
    }
  })
}

/**
 * Thêm vật cản vào fixture renderer. Kiện có hình chiếu sàn chạm hình chiếu một vật cản bị chuyển sang chưa xếp (`NO_SPACE`)
 * để không chồng lấn và để vật cản nhìn thấy được từ trên; thứ tự xếp/dỡ đánh lại liền mạch. Không phải kết quả tối ưu.
 * `count = 0` trả nguyên input.
 */
export function withBenchmarkObstacles(input: BenchmarkInput, count: BenchmarkObstacleCount): BenchmarkInput {
  if (count === 0) return input
  const vehicle = { ...input.request.vehicle, obstacles: benchmarkObstacles(count, input.request.vehicle) }
  const boxes = vehicle.obstacles.map(obstacleToBox)
  const blocked = (box: ReturnType<typeof placementToBox>) => boxes.some((obstacle) => gt(overlapArea2D(box, obstacle), 0))
  const kept = input.result.placements.filter((placement) => !blocked(placementToBox(placement)))
  const removed = input.result.placements.filter((placement) => blocked(placementToBox(placement)))
  const placements = kept.map((placement, index) => ({ ...placement, loadingOrder: index + 1, unloadingOrder: kept.length - index }))
  const weightByInstanceId = new Map(input.request.packages.map((pkg) => [`${pkg.id}-01`, pkg.weightKg]))
  return {
    ...input,
    request: { ...input.request, vehicle },
    result: {
      ...input.result,
      placements,
      unplacedPackages: removed.map((placement) => ({ packageInstanceId: placement.packageInstanceId, reasonCode: 'NO_SPACE', message: 'NO_SPACE' })),
      metrics: computeMetrics({ vehicle, placements, weightByInstanceId, unplacedCount: removed.length, runtimeMs: 0 }),
    },
  }
}
