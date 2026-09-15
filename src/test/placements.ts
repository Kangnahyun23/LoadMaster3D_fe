import { createPlacementLayout, createStackGraph, type StackGraph, type StackingProfile } from '@/domain/constraints'
import { SPEC_CARTON_A_PLACEMENT, SPEC_TRUCK_6M } from '@/domain/fixtures/spec-samples'
import type { PackagePlacement, VehicleConfig } from '@/domain/models'

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
