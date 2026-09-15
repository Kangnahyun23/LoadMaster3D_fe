import { createSpatialGrid, type SpatialGrid } from '@/domain/geometry'
import { placementToBox, type PackagePlacement, type VehicleConfig } from '@/domain/models'

/** Phương án đang kiểm: vật cản của xe và mọi kiện đã xếp, tra theo `packageInstanceId`. */
export type PlacementLayout = {
  readonly vehicle: Pick<VehicleConfig, 'obstacles'>
  readonly placements: ReadonlyMap<string, PackagePlacement>
  /** Lưới LM-016 chứa đúng `placements`, ID là `packageInstanceId`: tìm ứng viên không quét toàn bộ. */
  readonly grid: SpatialGrid
}

/** Dựng chỉ mục một lần cho mỗi snapshot phương án (D-29). */
export function createPlacementLayout(
  vehicle: Pick<VehicleConfig, 'obstacles'>,
  placements: readonly PackagePlacement[],
): PlacementLayout {
  return {
    vehicle,
    placements: new Map(placements.map((placement) => [placement.packageInstanceId, placement])),
    grid: createSpatialGrid(placements.map((placement) => ({ id: placement.packageInstanceId, box: placementToBox(placement) }))),
  }
}
