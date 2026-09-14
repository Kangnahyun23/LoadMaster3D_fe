import type { Placement, VehicleSpec } from '@/types/load-plan'
import { findBelow, layerOf } from '@/lib/placement'

/** Domain-mm distances; below/layer are guidance, not a support/stability solver. */
export function placementMeasurements(p: Placement, placements: readonly Placement[], vehicle: VehicleSpec) {
  return {
    frontMm: p.position.x, rearMm: vehicle.innerLengthMm - p.position.x - p.lengthMm,
    leftMm: p.position.y, rightMm: vehicle.innerWidthMm - p.position.y - p.widthMm,
    floorMm: p.position.z, ceilingMm: vehicle.innerHeightMm - p.position.z - p.heightMm,
    layer: layerOf(p, placements), belowId: findBelow(p, placements)?.id,
  }
}
