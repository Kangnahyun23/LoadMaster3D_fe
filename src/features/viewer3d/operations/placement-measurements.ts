import type { ScenePlacement } from '@/features/viewer3d/scene-input'
import type { VehicleConfig } from '@/domain/models'
import { findBelow, layerOf } from '../panels/placement-relations'

/** Distances in cm; below/layer are guidance, not a support/stability solver. */
export function placementMeasurements(p: ScenePlacement, placements: readonly ScenePlacement[], vehicle: VehicleConfig) {
  return {
    frontCm: p.position.x, rearCm: vehicle.innerLengthCm - p.position.x - p.lengthCm,
    leftCm: p.position.y, rightCm: vehicle.innerWidthCm - p.position.y - p.widthCm,
    floorCm: p.position.z, ceilingCm: vehicle.innerHeightCm - p.position.z - p.heightCm,
    layer: layerOf(p, placements), belowId: findBelow(p, placements)?.id,
  }
}
