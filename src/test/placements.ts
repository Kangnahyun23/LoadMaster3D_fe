import { createPlacementLayout, createStackGraph, type StackGraph, type StackingProfile } from '@/domain/constraints'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { PackagePlacement, VehicleConfig, VehicleObstacle } from '@/domain/models'

export type Triple = [number, number, number]

/** Truck 6m không có hốc bánh xe: test chỉ có những mặt đỡ nó tự dựng. */
export const EMPTY_TRUCK_6M: VehicleConfig = { ...SPEC_TRUCK_6M, obstacles: [] }

/** Placement theo contract với id, vị trí (x, y, z) và kích thước đã xoay (dài, rộng, cao), cm. */
export function placed(
  packageInstanceId: string,
  [xCm, yCm, zCm]: Triple,
  [placedLengthCm, placedWidthCm, placedHeightCm]: Triple,
): PackagePlacement {
  return { ...SPEC_CARTON_A_PLACEMENT, packageInstanceId, xCm, yCm, zCm, placedLengthCm, placedWidthCm, placedHeightCm }
}

/** Kiện xếp chồng được, nặng `weightKg`, sức chịu tải rộng rãi trừ khi test tự đặt. */
export function stackingProfile(weightKg: number, overrides: Partial<StackingProfile> = {}): StackingProfile {
  return { weightKg, stackable: true, maxTopLoadKg: 10_000, ...overrides }
}

/** Đồ thị đỡ của `placements` trong xe (mặc định Truck 6m không vật cản). */
export function stackGraphOf(
  placements: readonly PackagePlacement[],
  profiles: Readonly<Record<string, StackingProfile>>,
  vehicle: VehicleConfig = EMPTY_TRUCK_6M,
): StackGraph {
  return createStackGraph(createPlacementLayout(vehicle, placements), new Map(Object.entries(profiles)))
}

/** Park–Miller: cùng một dãy số mỗi lần chạy. */
export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

/**
 * Thả hộp `size` tại góc (x, y) xuống mặt cao nhất bên dưới nó: sàn, đỉnh vật cản hoặc đỉnh kiện khác (bỏ qua kiện cùng id).
 * Chỉ cho dữ liệu test trên lưới số nguyên, nên so sánh thẳng.
 */
export function dropAt(
  id: string,
  [x, y]: [number, number],
  size: Triple,
  others: Iterable<PackagePlacement>,
  obstacles: readonly VehicleObstacle[] = [],
): PackagePlacement {
  const [length, width] = size
  const underBase = (bx: number, by: number, bl: number, bw: number) => x < bx + bl && bx < x + length && y < by + bw && by < y + width
  let z = 0
  for (const obstacle of obstacles) {
    if (underBase(obstacle.xCm, obstacle.yCm, obstacle.lengthCm, obstacle.widthCm)) z = Math.max(z, obstacle.zCm + obstacle.heightCm)
  }
  for (const other of others) {
    if (other.packageInstanceId !== id && underBase(other.xCm, other.yCm, other.placedLengthCm, other.placedWidthCm)) {
      z = Math.max(z, other.zCm + other.placedHeightCm)
    }
  }
  return placed(id, [x, y, z], size)
}
