import type { Placement, VehicleSpec } from '@/types/load-plan'
import { stopDistribution } from './operations-model.ts'

/** Three-space millimetres: X along length, Y up, Z across width.
 * A 100 mm lane inset inside the floor; never vehicle/chassis geometry.
 */
export function interiorStopMap(placements: readonly Placement[], vehicle: VehicleSpec) {
  const width = vehicle.innerWidthMm, length = vehicle.innerLengthMm
  if (width <= 0 || length <= 0) return []
  const margin = Math.min(20, width / 10), lane = Math.min(100, width - margin * 2)
  return stopDistribution(placements, length).flatMap((bin) => {
    let offset = 0
    return bin.portions.map((part) => {
      const x1 = bin.fromMm, x2 = Math.max(x1, bin.toMm - Math.min(2, length / 1000))
      const z1 = margin + offset * lane, z2 = margin + (offset + part.ratio) * lane
      offset += part.ratio
      return { stop: part.stop, vertices: [x1, 4, z1, x2, 4, z1, x2, 4, z2, x1, 4, z1, x2, 4, z2, x1, 4, z2] }
    })
  })
}
